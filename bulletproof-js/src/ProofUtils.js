const BigIntVector = require('./BigIntVector');
const Maths = require('./Maths');

class ProofUtils {

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
    static delta(yn, z, mod=false) {
        if( mod && typeof mod !== 'bigint' ) {
            throw new Error("Please supply bigint as mod parameter");
        }
        const ones = BigIntVector.getVectorWithOnlyScalar(1n, yn.length(), mod);
        const twopown = BigIntVector.getVectorToPowerN(2n, BigInt(yn.length(), mod));
        const left = (z - z ** 2n) * ones.multVectorToScalar(yn);
        const right = z ** 3n * ones.multVectorToScalar(twopown);
        const result = left - right;
        if( mod ) { return Maths.mod(result, mod); }
        return result;
    }
}

module.exports = ProofUtils;