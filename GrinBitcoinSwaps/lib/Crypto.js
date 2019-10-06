const keccak256 = require('js-sha3').keccak256;

const CHECKSUM_SALT = `&q!phF&jH#pJ.#dmaTd:gJ$etm|ci,?r%vz&]Ad(L^><g.)C)E"PJK?DAZ("FU*T`;

class Crypto {

    /**
     * Return a keccack 256 hash as a hex string
     *
     * @param input {string} the input as a string
     * @return {string} 64 character long string
     */
    static keccakSaltedHash(input) {
        return keccak256(CHECKSUM_SALT + input);
    }
}

export default Crypto;