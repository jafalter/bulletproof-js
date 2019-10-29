const assert = require('assert');

const Utils = require('./Utils');
const Vector = require('./Vector');
const Maths = require('./Maths');

class Factory {

    /**
     * Compute a Bulletproof. The code is structured after a popular Bulletproof library implemented in Rust.
     * You can find documentation and also learn how the proof works on
     * https://doc-internal.dalek.rs/bulletproofs/notes/range_proof/index.html
     *
     * @param val {BigInt} the value of the commitment. Please use BigInt not number
     * @param x {BigInt} blinding factor used in the commitment
     * @param com {point} pedersen commitment for which we want to compute the rangeproof
     * @param G {point} generator G used in pedersen
     * @param H {point} generator H used in pedersen
     * @param lowBound {BigInt} the lower bound of the rangeproof. Please use BigInt not number
     * @param upBound {BigInt} the upper bound of the rangeproof. Please use BigInt not number
     * @param p {BigInt} elliptic curve used for computation of the proof
     * @param doAssert {boolean} if we should do asserts. Should be set to false in production for performance gains
     * @param randomNum {boolean|function} optional random bigint generating function
     * @return {RangeProof} Final rangeproof
     */
    static computeBulletproof(val, x, com, G, H, lowBound, upBound, p, doAssert=true, randomNum=false) {

        if( typeof val !== 'bigint' || typeof  x !== 'bigint' || typeof lowBound !== 'bigint' || typeof upBound !== 'bigint' ) {
            throw new Error("Parameters val, x, low and upper bound have to be bigints");
        }
        if( lowBound !== 0n ) {
            throw new Error("Currently only range proofs with lower bound 0 are supported");
        }
        if( (upBound % 2n) !== 0n ) {
            throw new Error("Upper bound has to be a power of 2");
        }
        if( val < lowBound || val > upBound ) {
            throw new Error("val must be in the range [lowBound, upBound]");
        }
        const binary = val.toString(2);

        // Vector 1 contains the value in binary
        const vec1 = new Vector();
        for( let i = binary.length -1; i >= 0; i-- ) {
            const v = binary[i];
            vec1.addElem(BigInt(v))
        }

        // Vector 2 contains powers of 2 up to our upper bound
        const vec2 = new Vector();
        let pow = 0n;
        while ((2n ** pow) <= upBound) {
            vec2.addElem(2n ** pow);
            pow++;
        }
        const n = BigInt(vec2.length());

        if( doAssert ) assert(vec1.length() <= vec2.length(), "Vector 1 length can't be greater then vec2");
        while ( vec1.length() < vec2.length() ) {
            vec1.addElem(0n);
        }
        if( doAssert ) assert(vec1.length() === vec2.length(), "Vectors now have to be same length");
        // Now val can be represented as val = < vec1, vec2 >
        if( doAssert ) assert(vec1.multVectorToScalar(vec2) === val, "Now val has t obe < vec1, vec2 >");

        // To match notation with reference
        const a_L = vec1;
        const a_R = vec1.subScalar(1n);
        if( doAssert ) assert(a_L.multVectorToScalar(a_R) === 0n, "a_L * a_R has to be 0, as a_L can only contain 0, or 1");

        /*
        * Now we want to prove three statements
        * < a_L, 2^n > = v (the binary vector representation times a vector containing powers of 2 will result in the original number)
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

        const y = Utils.getFiatShamirChallenge(com, p);
        const y_n = Vector.getVectorToPowerN( y, BigInt(a_L.length()) );
        if( doAssert ) assert(y_n.length() === a_L.length() && y_n.length() === a_R.length(), "All vectors should be same length");

        const yP = Utils.scalarToPoint(y.toString(16));
        const z = Utils.getFiatShamirChallenge(yP, p);

        const twos_times_zsq = vec2.multWithScalar(z ** 2n);

        if( doAssert ) {
            // Unblinded version
            // Don't really have to calculate those
            const a_R_plusz = a_R.addScalar(z);

            const clearL = a_L.subScalar(z);
            const clearR = y_n.multVector(a_R_plusz).addVector(twos_times_zsq);

            const lefthandside = ((z ** 2n) * val + Maths.delta(y_n, z)) % p;
            const righthandside = (clearL.multVectorToScalar(clearR)) % p;

            // Now we got a single vector product proving our 3 statements which can be easily verified
            // as is done below:
            assert(lefthandside === righthandside, "Non secret terms should equal the multiplication of the vectors");
        }

        // However we can't sent this two vectors to the verifier since it would leak information about v.
        // Note that the inner-product argument which is actually transmitted instead of the full vectors
        // are not zero-knowledge and therefore can't be used either.
        // Therefore we need to introduce additional blinding factors
        const s_L = new Vector();
        const s_R = new Vector();
        if( !randomNum ) {
            const Rand = require('./Rand');
            randomNum = Rand.secureRandomBigInt;
        }
        for( let i = 0; i < n; i++ ) {
            const r1 = randomNum(p);
            const r2 = randomNum(p);
            s_L.addElem(r1);
            s_R.addElem(r2);
        }

        // The blinded l(x) and r(x) have a_L and a_R replaced by
        // blinded terms a_L + s_L*x and a_R + s_R*x

        /**
         * Vector polynomial l(x) which is a_L blinded
         * by s_L
         *
         * @param x {BigInt} random number
         * @return {Vector}
         */
        const l = (x) => {
            return a_L.addVector(s_L.multWithScalar(x)).subScalar(z)
        };

        /**
         * Vector polynomial r(y) which is a_R blinded
         * by s_R
         *
         * @param x {BigInt} random number
         * @return {Vector}
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
        }
    }
}

module.exports = Factory;