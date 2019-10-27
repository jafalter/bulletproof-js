const assert = require('assert');

const Utils = require('./Utils');
const Vector = require('./Vector');

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
     * @return {RangeProof} Final rangeproof
     */
    static computeBulletproof(val, x, com, G, H, lowBound, upBound, p, doAssert=true) {

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

        const y = Utils.getFiatShamirChallenge(com, p);
        const y_n = Vector.getVectorToPowerN( y, BigInt(a_L.length()) );
        if( doAssert ) assert(y_n.length() === a_L.length() && y_n.length() === a_R.length(), "All vectors should be same length");

        const yP = Utils.scalarToPoint(y.toString(16));
        const z = Utils.getFiatShamirChallenge(yP, p);

        /**
         * Function delta which can be computed from all
         * non secret terms
         *
         * @param yn {Vector} vector of challenge param y^n
         * @param z {BigInt} challenge param z
         * @param mod {BigInt|boolean} if set it the result will be
         *                             modulos mod
         * @return {BigInt} result of computation
         */
        const delta = (yn, z, mod=false) => {
            if( mod && typeof mod !== 'bigint' ) {
                throw new Error("Please supply bigint as mod parameter");
            }
            const ones = Vector.getVectorWithOnlyScalar(1n, yn.length());
            const twopown = Vector.getVectorToPowerN(2n, BigInt(yn.length()));
            const left = (z - z ** 2n) * ones.multVectorToScalar(yn);
            const right = z ** 3n * ones.multVectorToScalar(twopown);
            const result = left - right;
            if( mod ) { return result % mod }
            return result;
        };

        const twopown = Vector.getVectorToPowerN(2n, BigInt(y_n.length()));
        const clearL = a_L.subScalar(z);
        const a_R_plusz = a_R.addScalar(z);
        const twos_times_zsq = twopown.multWithScalar(z ** 2n);
        const clearR = y_n.multVector(a_R_plusz).addVector(twos_times_zsq);

        const lefthandside = ((z ** 2n) * val + delta(y_n, z)) % p;
        const righthandside = (clearL.multVectorToScalar(clearR)) % p;
        assert(lefthandside === righthandside, "Non secret terms should equal the multiplication of the vectors");
    }
}

module.exports = Factory;