const keccak256 = require('js-sha3').keccak256;

const CHECKSUM_SALT = `&q!phF&jH#pJ.#dmaTd:gJ$etm|ci,?r%vz&]Ad(L^><g.)C)E"PJK?DAZ("FU*T`;
const PASSPHRASE_SALT = `|Z#kUQ,=l..9V&cMgluJ6py+s@3M;RQ&dLp@G|bg#hMOc/~yI+"%||P8wjzn$rtf`;

let encryptionKey = ''; // Passphrase used for encryption

class Crypto {

    /**
     * Set the symetric key used for encryption and decryption of local data
     * like private keys
     *
     * @param phrase {string} a password string which is at least 10 characters long
     */
    static setPassphrase(phrase) {
        encryptionKey = keccak256(PASSPHRASE_SALT + phrase);
    }

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