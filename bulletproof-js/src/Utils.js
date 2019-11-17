const sha256 = require('js-sha256').sha256;
const EC = require('elliptic').ec;
const BN = require('bn.js');

const Maths = require('./Maths');

const ec = new EC('secp256k1');

class Utils {

    /**
     * Substract a scalar from every element
     * of a vector
     *
     * @param vec {[]} Vector needs to contain only bigints
     * @param scalar {BigInt} the scalar to subScalar from the vector
     * @return {[]} the new vector
     */
    static vecSubScalar(vec, scalar) {
        if( typeof scalar !== 'bigint' ) {
            throw new Error("Scalar must be bigint");
        }
        const retVec = [];
        for( let i = 0; i < vec.length; i++ ) {
            const val = vec[i];
            if( typeof val !== 'bigint' ) {
                throw new Error("Vector may only contain bigints");
            }
            retVec.push(val - scalar);
        }
        return retVec;
    }

    /**
     * Mulitply two vectors with a bigint result
     *
     * @param v1 {array} must only contain bigints
     * @param v2 {array} must only contain bigints
     * @return {BigInt} the result of the multiplication
     */
    static vecMult(v1, v2) {
        let result = 0n;
        if( v1.length !== v2.length ) {
            throw new Error("Vectors to be multiplied must be same length");
        }
        for( let i = 0; i < v1.length; i++ ) {
            if( typeof v1[i] !== 'bigint' || typeof v2[i] !== 'bigint' ) {
                throw new Error("Vectors must only contain bigint values");
            }
            const nextVal = v1[i] * v2[i];
            result += nextVal;
        }
        return result;
    }

    /**
     * Get a vector from a single scalar with the
     * length len
     *
     * @param sc {BigInt} the scalar
     * @param len {number} how many elements the vector should have
     * @return {Array} vector
     */
    static vectorFromScalar(sc, len) {
        if( typeof sc !== 'bigint' ) {
            throw new Error("Scalar i has to be a bigint");
        }
        const v = [];
        for( let i = 0; i < len; i++ ) {
            v.push(sc);
        }
        return v;
    }

    /**
     * Get elliptic curve point from a hexadecimal encoded
     * scalar
     *
     * @param hex {string}
     * @return {Point}
     */
    static scalarToPoint(hex) {
        return ec.keyFromPrivate(hex, 'hex').getPublic();
    }

    /**
     * Generate a sha256 hash and return
     * a hex string output
     *
     * @param msg {string}
     */
    static sha256strtohex(msg) {
        const hash = sha256.create();
        hash.update(msg);
        return hash.hex();
    }

    /**
     * Generate a sha256 hash of a elliptic curve point
     *
     * @param p {Point}
     */
    static sha256pointtohex(p) {
        return Utils.sha256strtohex(p.encode('hex'));
    }

    /**
     * Generate the next challenge using the
     * Fiat shamir heuristic
     *
     * @param commitment {Point} Elliptic curve point
     *                           from which the next challenge will
     *                           ge calculated from by sha256 hashing it
     * @param mod        {BigInt} the modulus of the elliptic curve
     * @return {BigInt}
     */
    static getFiatShamirChallenge(commitment, mod) {
        if( typeof mod !== 'bigint' ) {
            throw new Error("Please provide mod as bigint");
        }
        const hex = Utils.sha256pointtohex(commitment);
        const num = BigInt('0x' + hex);
        return Maths.mod(num, mod);
    }

    /**
     * Get a new generator point by sha256 hashing G
     *
     * @param G {Point}
     * @return {Point}
     */
    static getHFromHashingG(G) {
        const hashedG = Utils.sha256pointtohex(G);
        return  Utils.scalarToPoint(hashedG);
    }

    /**
     * Convert BigInt to BN (used in elliptic)
     *
     * @param bgint {BigInt}
     * @return {BN}
     */
    static toBN(bgint) {
        return new BN(bgint.toString(16), 'hex');
    }

    /**
     * Generate a Pedersen commitment
     * on secp256k1 curve
     *
     * @param v {BigInt} The value we want to commit to
     * @param x {BigInt} The blinding factor
     * @param n {BigInt} Optional group order
     * @param H {Point} Second generator point used in the commitment
     */
    static getPedersenCommitment(v, x, n=false, H=false) {
        if( !H ) {
            H = Utils.getHFromHashingG(ec.g);
        }
        const G = ec.g;
        const x_BN = Utils.toBN(n ? Maths.mod(x, n) : x);
        const v_BN = Utils.toBN(n ? Maths.mod(v, n) : x);
        return G.mul(v_BN).add(H.mul(x_BN))
    }
}

module.exports = Utils;