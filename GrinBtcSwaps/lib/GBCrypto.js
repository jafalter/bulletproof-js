import Factory from "./Factory";

const keccak256 = require('js-sha3').keccak256;
const shake128 = require('js-sha3').shake128;
const CryptoJS = require('crypto-js');
import bip39 from 'react-native-bip39'

const CHECKSUM_SALT = `&q!phF&jH#pJ.#dmaTd:gJ$etm|ci,?r%vz&]Ad(L^><g.)C)E"PJK?DAZ("FU*T`;
const PASSPHRASE_SALT = `|Z#kUQ,=l..9V&cMgluJ6py+s@3M;RQ&dLp@G|bg#hMOc/~yI+"%||P8wjzn$rtf`;
const IV_SALT = `($/.t|3Ko6Afglxsw0PaBbr[]%=iN*v[`;

const logger = Factory.getLogger();

let symmetricKey = null; // Key used for symmetric encryption
let iv = null;

class GBCrypto {

    /**
     * Reset symmetric key and iv
     */
    static resetEncryptionParams() {
        symmetricKey = null;
        iv = null;
    }

    /**
     * Set the symetric key used for encryption and decryption of local data
     * like private keys
     *
     * @param phrase {string} a password string which is at least 10 characters long
     */
    static setPassphrase(phrase) {
        const hash256 = keccak256(PASSPHRASE_SALT + phrase);
        const hash128 = shake128(IV_SALT + phrase, 128);
        symmetricKey = CryptoJS.enc.Hex.parse(hash256);
        iv = CryptoJS.enc.Hex.parse(hash128);
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

    /**
     * Generate a new bip39 mnemonic seed phrase from
     * which we can generate private keys
     *
     * @return {string}
     */
    static async genereteMnemonic() {
        try {
            return await bip39.generateMnemonic(256) // default to 128
        } catch(e) {
            logger.error("Error during bip39 generation " + e.message);
            return false;
        }
    }

    /**
     * Get a hexadecimal encoded seed which can be used
     * to generate keys from a mnmemonic phrase
     *
     * @param mnemonic {string}
     * @return {string}
     */
    static seedFromMnemonic(mnemonic) {
        return bip39.mnemonicToSeedHex(mnemonic)
    }

    /**
     * AES encrypt a message with the key derived from
     * the users locking password. Fails if no key
     * has been set yet.
     *
     * @param msg {string} the plaintext message to be encrypted
     * @return {string} the hex encoded ciphertext output of the encryption
     */
    static encryptMessage(msg) {
        if( symmetricKey === null || iv === null ) {
            throw new Error("Failed to encrypt message, no encryption key or iv set");
        }
        return CryptoJS.AES.encrypt(msg, symmetricKey, { iv : iv }).toString();
    }

    /**
     * AES decrypt a message with the key derived from
     * the users locking password. Fails if no key has yet
     * been set.
     *
     * @param msg {string} hex encoded ciphertext message
     * @return {string} the decrypted plaintext output
     */
    static decryptMessage(msg) {
        if( symmetricKey === null || iv === null ) {
            throw new Error("Failed to decrypt message, no encryption key or iv set");
        }
        const bytes = CryptoJS.AES.decrypt(msg, symmetricKey, { iv : iv });
        return bytes.toString(CryptoJS.enc.Utf8);
    }
}

export default GBCrypto;