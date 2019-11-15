const Vector = require('./Vector');

class Maths {

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
        const ones = Vector.getVectorWithOnlyScalar(1n, yn.length());
        const twopown = Vector.getVectorToPowerN(2n, BigInt(yn.length()));
        const left = (z - z ** 2n) * ones.multVectorToScalar(yn);
        const right = z ** 3n * ones.multVectorToScalar(twopown);
        const result = left - right;
        if( mod ) { return result % mod }
        return result;
    }

    /**
     * Modulos funtion always returning the
     * positive modulos not the remainder
     *
     * @param num {BigInt} initial number
     * @param n {BigInt} the mod number
     * @return {BigInt}
     */
    static mod(num, n) {
        return ((num % n) + n) % n;
    }
}

module.exports = Maths;