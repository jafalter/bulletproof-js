const assert = require('assert');

const Utils = require('./Utils');
const Transcript = require('./Transcript');
const PointVector = require('./PointVector');
const BigIntVector = require('./BigIntVector');
const Maths = require('./Maths');
const UncompressedBulletproof = require('./UncompressedBulletproof');
const ProofUtils = require('./ProofUtils');

class ProofFactory {

    /**
     * Compute a Bulletproof. The code is structured after a popular Bulletproof library implemented in Rust.
     * You can find documentation and also learn how the proof works on
     * https://doc-internal.dalek.rs/bulletproofs/notes/range_proof/index.html
     *
     * @param v {BigInt} the value of the commitment. Please use BigInt not number
     * @param bf {BigInt} blinding factor used in the commitment
     * @param V {Point} pedersen commitment for which we want to compute the rangeproof, which
     *                  has to be a valid commitement to v with blinding factor B
     * @param G {Point} generator G used in pedersen
     * @param H {Point} generator H used in pedersen
     * @param lowBound {BigInt} the lower bound of the rangeproof. Please use BigInt not number
     * @param upBound {BigInt} the upper bound of the rangeproof. Please use BigInt not number
     * @param order {BigInt} Order of the group. All calculations will be mod order
     * @param doAssert {boolean} if we should do asserts. Should be set to false in production for performance gains
     * @param randomNum {boolean|function} optional random bigint generating function
     * @return {UncompressedBulletproof} Final rangeproof which can be verified
     */
    static computeBulletproof(v, bf, V, G, H, lowBound, upBound, order, doAssert=true, randomNum=false) {

        const T = new Transcript();
        if( typeof v !== "bigint" || typeof  bf !== "bigint" || typeof lowBound !== "bigint" || typeof upBound !== "bigint" ) {
            throw new Error("Parameters val, x, low and upper bound have to be bigints");
        }
        if( lowBound !== 0n ) {
            throw new Error("Currently only range proofs with lower bound 0 are supported");
        }
        if( (upBound % 2n) !== 0n ) {
            throw new Error("Upper bound has to be a power of 2");
        }
        if( v < lowBound || v > upBound ) {
            throw new Error("val must be in the range [lowBound, upBound]");
        }
        if( !randomNum ) {
            const Rand = require('./Rand');
            randomNum = Rand.secureRandomBigInt;
        }
        const binary = v.toString(2);

        // Vector 1 contains the value in binary
        const vec1 = new BigIntVector(order);
        for( let i = binary.length -1; i >= 0; i-- ) {
            const v = binary[i];
            vec1.addElem(BigInt(v))
        }

        // Vector 2 contains powers of 2 up to our upper bound
        const vec2 = new BigIntVector(order);
        let pow = 0n;
        while ((2n ** pow) < upBound) {
            vec2.addElem(2n ** pow);
            pow++;
        }
        const len = BigInt(vec2.length());

        if( doAssert ) assert(vec1.length() <= vec2.length(), "Vector 1 length can't be greater then vec2");
        while ( vec1.length() < vec2.length() ) {
            vec1.addElem(0n);
        }
        if( doAssert ) assert(vec1.length() === vec2.length(), "Vectors now have to be same length");
        // Now val can be represented as val = < vec1, vec2 >
        if( doAssert ) assert(vec1.multVectorToScalar(vec2) === v, "Now val has t obe < vec1, vec2 >");

        // To match notation with reference
        const a_L = vec1;
        const a_R = vec1.subScalar(1n);
        // Commit to those values in a pedersen commitment (is needed later)
        const a_bf = randomNum(order);
        const A = Utils.getVectorPedersenCommitment(a_L, a_R, a_bf, order, H);
        T.addPoint(A);
        if( doAssert ) assert(a_L.multVectorToScalar(a_R) === 0n, "a_L * a_R has to be 0, as a_L can only contain 0, or 1");

        /*
        * Now we want to prove three statements
        * < a_L, 2^order > = v (the binary vector representation times a vector containing powers of 2 will result in the original number)
        * a_L * a_R = 0
        * (a_L -1) - a_R = 0 (Those two statements prove that a_L contains only 1 and 0)
        *
        * To make the prove really compact we want to combine these statements
        * into one single vector product.
        * We can do this by utilizing two challenges from the verifier y and z
        * To make the prove interactive we use Fiat Shamir Heuristic, while we always hash a commitment
        * to get the next random challenge, the first commitment is our pedersen commitment.
        * To understand the details of the math on who the 3 statements are combined check
        * https://doc-internal.dalek.rs/bulletproofs/notes/range_proof/index.html
        */

        // We can't sent this two vectors to the verifier since it would leak information about v.
        // Note that the inner-product argument which is actually transmitted instead of the full vectors
        // are not zero-knowledge and therefore can't be used either.
        // Therefore we need to introduce additional blinding factors
        const s_L = new BigIntVector(order);
        const s_R = new BigIntVector(order);
        for( let i = 0; i < len; i++ ) {
            const r1 = randomNum(order);
            const r2 = randomNum(order);
            s_L.addElem(r1);
            s_R.addElem(r2);
        }
        // We need to commit to s_L and s_R
        const s_bf = randomNum(order);
        const S = Utils.getVectorPedersenCommitment(s_L, s_R, s_bf, order, H);
        T.addPoint(S);

        const y = Utils.getFiatShamirChallengeTranscript(T, order);
        const y_n = BigIntVector.getVectorToPowerN( y, BigInt(a_L.length()), order );
        const y_ninv = BigIntVector.getVectorToPowerMinusN( y, BigInt(a_L.length()), order);
        if( doAssert ) assert(y_n.length() === a_L.length() && y_n.length() === a_R.length(), "All vectors should be same length");

        const z = Utils.getFiatShamirChallengeTranscript(T, order, false);
        const zsq = Maths.mod(z ** 2n, order);

        const twos_times_zsq = vec2.multWithScalar(zsq);

        // Unblinded version
        const a_R_plusz = a_R.addScalar(z);

        const l0 = a_L.subScalar(z);
        const r0 = y_n.multVector(a_R_plusz).addVector(twos_times_zsq);

        if( doAssert ) {
            const lefthandside = Maths.mod(zsq * v + ProofUtils.delta(y_n, z), order);
            const righthandside = Maths.mod(l0.multVectorToScalar(r0), order);

            // Now we got a single vector product proving our 3 statements which can be easily verified
            // as is done below:
            assert(lefthandside === righthandside, "Non secret terms should equal the multiplication of the vectors");
        }

        // The blinded l(x) and r(x) have a_L and a_R replaced by
        // blinded terms a_L + s_L*x and a_R + s_R*x

        /**
         * Vector polynomial l(x) which is a_L blinded
         * by s_L
         *
         * @param x {BigInt} random number
         * @return {BigIntVector}
         */
        const l = (x) => {
            return a_L.addVector(s_L.multWithScalar(x)).subScalar(z)
        };

        /**
         * Vector polynomial r(y) which is a_R blinded
         * by s_R
         *
         * @param x {BigInt} random number
         * @return {BigIntVector}
         */
        const r = (x) => {
            return y_n.multVector(a_R.addVector(s_R.multWithScalar(x)).addScalar(z)).addVector(twos_times_zsq)
        };

        /**
         * Term t of the form
         * t_0 + t_1x + t_2x²
         * Whereas t_0 is our unblinded version
         *
         * @param x {BigInt}
         * @return {BigInt}
         */
        const t = (x) => {
            return l(x).multVectorToScalar(r(x));
        };

        // Now we need to commit to T1 = Com(t1), and T2 = Com(t2)
        // Together with V (our original commitment) those are sent to the verifier
        const l1 = s_L.clone();
        const r1 = y_n.multVector(s_R);

        const t0 = Maths.mod(l0.multVectorToScalar(r0), order);
        const t2 = Maths.mod(l1.multVectorToScalar(r1), order);
        const t1 = Maths.mod(l0.addVector(l1).multVectorToScalar(r0.addVector(r1)) - t0 - t2, order);

        const t1_bf = randomNum(order);
        const T1 = Utils.getPedersenCommitment(t1, t1_bf, order, H);
        T.addPoint(T1);

        const t2_bf = randomNum(order);
        const T2 = Utils.getPedersenCommitment(t2, t2_bf, order, H);
        T.addPoint(T2);

        // Now we get the challenge point x
        const x = Utils.getFiatShamirChallengeTranscript(T, order, false);

        const xsq = Maths.mod(x ** 2n, order);
        const tx = Maths.mod(t0 + t1 * x + t2 * xsq, order);
        const tx_bf = Maths.mod(zsq * bf + x * t1_bf + t2_bf * xsq, order);
        // Send openings tx and tx_bf back to the verifier

        if( doAssert ) {
            const d = ProofUtils.delta(y_n, z, order);
            const Bdelta = Utils.toBN(d);
            const Bzsq = Utils.toBN(zsq);
            const Bx = Utils.toBN(x);
            const Bxsq = Utils.toBN(xsq);

            // Check t(x) was calculated correctly
            assert(Maths.mod(tx, order) === Maths.mod(t(x), order));

            // Check the sub equalities of the terms
            assert(Utils.getPedersenCommitment(zsq * v, zsq * bf, order, H).eq(V.mul(Bzsq)), "partial equality 1 of the term");
            assert(Utils.getPedersenCommitment(zsq * v, zsq * bf, order, H).add(G.mul(Bdelta)).eq(V.mul(Bzsq).add(G.mul(Bdelta))), "partial equality 2 of the term");
            assert(Utils.getPedersenCommitment(x * t1, x * t1_bf, order, H).eq(T1.mul(Bx), "partial equality 3 of the term"));
            assert(Utils.getPedersenCommitment(xsq * t2, xsq * t2_bf, order, H).eq(T2.mul(Bxsq), "partial equality 4 of the term"));

            // The complete equality
            const leftEq = Utils.getPedersenCommitment(tx, tx_bf, order, H);
            const rightEq = V.mul(Utils.toBN(zsq)).add(G.mul(Utils.toBN(Maths.mod(ProofUtils.delta(y_n, z), order)))).add(T1.mul(Utils.toBN(x))).add(T2.mul(Utils.toBN(xsq)));

            assert(leftEq.eq(rightEq), "Final equality the verifier checks to verify t(x) is correct polynomial");
        }

        // Now we need to prove to the verifier that l(x) and r(x) are correct
        // For that we need to give the opening e of the combined blinding factors used
        // for the commitments A and S
        const e = Maths.mod(a_bf + ( x * s_bf ), order);

        /* At this point we calculated everything for the verifier to
        verify the proof, the final values sen't to the verifier are
        V       ... Pedersen commitment for which we prove its range
        A       ... Vector pedersen commitment committing to a_L deltaand a_R the amount split into a vector
              which is the amount in binary and a vector containing exponents of 2
        S       ... Vector pedersen commitment committing to s_L and s_R the blinding vectors
        t(x)    ... Polynomial t() evaluated with challenge x
        t(x_bf) ... Opening blinding factor for t() to verify the correctness of t(x)
        e       ... Opening e of the combined blinding factors using in A and S to verify correctness of l(x) and r(x)
        l(x)    ... left side of the vector
        r(x)    ... right side of the vector

        Theoretically we could simply transmit l(x) and r(x) to the verifier, since they are blinded
        however this would need 2n scalars to be transmitted.
        Using the inner product prove we only need to transmit log(order) communication cost
         */

        if( doAssert ) {
            // transmutating the generator H such that we can verify r(x)
            const vecH = PointVector.getVectorOfPoint(H, y_n.length());
            const vecG = PointVector.getVectorOfPoint(G, y_n.length());
            const vecH2 = vecH.multWithBigIntVector(y_ninv);

            // Final verification
            const E = H.mul(Utils.toBN(e));
            const Einv = E.neg();
            const Bx = Utils.toBN(x);
            const vec_z = BigIntVector.getVectorWithOnlyScalar(z, y_n.length(), order);

            const l1 = y_n.multWithScalar(z).addVector(twos_times_zsq);
            const l2 = vec_z.addVector(y_ninv.multWithScalar(zsq).multVector(vec2));

            const P1 = Einv.add(A).add(S.mul(Bx)).add(vecH2.multWithBigIntVector(l1).toSinglePoint()).add(vecG.multWithBigIntVector(vec_z).toSinglePoint().neg());
            const P2 = Einv.add(A).add(S.mul(Bx)).add(vecH.multWithBigIntVector(l2).toSinglePoint()).add(vecG.multWithBigIntVector(vec_z).toSinglePoint().neg());
            const P = vecG.multWithBigIntVector(l(x)).addPointVector(vecH2.multWithBigIntVector(r(x))).toSinglePoint();

            assert(P1.eq(P2), 'What the verifier checks to verify that l(x) and r(x) are correct');
            assert(P.eq(P1));
        }
        return new UncompressedBulletproof(V, A, S, T1, T2, tx, tx_bf, e, l(x), r(x), G, order);
    }
}

module.exports = ProofFactory;