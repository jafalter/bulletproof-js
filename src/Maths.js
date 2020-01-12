class Maths {

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