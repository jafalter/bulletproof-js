const bigintCryptoUtils = require('bigint-crypto-utils');

class Rand {

    /**
     * Generate a secure random number modulus q
     *
     * @param p {BigInt} modulus
     * @return {BigInt} random bigint number
     */
    static secureRandomBigInt(p) {
        return bigintCryptoUtils.randBetween(BigInt(2) ** BigInt(256)) % p;
    }
}

module.exports = Rand;