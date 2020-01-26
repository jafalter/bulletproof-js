const sha256 = require('js-sha256').sha256;
const EC = require('elliptic').ec;
const BN = require('bn.js');

const Maths = require('./Maths');

const ec = new EC('secp256k1');

class Utils {

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
     * Get Challenge value from Proof Transcript
     *
     * @param ts {Transcript} Transcript of the proof
     * @param n {BigInt} modulus to which challenge should be returned
     * @param retPoint {boolean} If true return a point, else the scalar
     */
    static getFiatShamirChallengeTranscript(ts, n, retPoint=false) {
        if( typeof n !== 'bigint' ) {
            throw new Error("Please provide n as a BigInt value");
        }
        else {
            const hex = Utils.sha256strtohex(ts.toString());
            const num = Maths.mod(BigInt('0x' + hex), n);
            const p = ec.g.mul(num);
            ts.addPoint(p);
            return retPoint ? p : num;
        }
    }

    /**
     * Get a new generator point by sha256 hashing G
     *
     * @param G {Point}
     * @return {Point}
     */
    static getnewGenFromHashingGen(G) {
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
        const G = ec.g;
        if( !H ) {
            H = Utils.getnewGenFromHashingGen(G);
        }
        const x_BN = Utils.toBN(n ? Maths.mod(x, n) : x);
        const v_BN = Utils.toBN(n ? Maths.mod(v, n) : x);
        return G.mul(v_BN).add(H.mul(x_BN))
    }

    /**
     * Generate a Vector Pedersen Commitment with blinding factor x
     *
     * @param l {Vector} Vector 1
     * @param r {Vector} Vector 2
     * @param x {BigInt} blinding factor
     * @param n {BigInt} optional group order
     * @param H {Point} second Generator (If non provided we sha256 hash G)
     * @return {Point}
     */
    static getVectorPedersenCommitment(l, r, x, n=false, H=false) {
        const G = ec.g;
        if( !H ) {
            H = Utils.getnewGenFromHashingGen(G);
        }
        const P1 = l.multVectorWithPointToPoint(G);
        const P2 = r.multVectorWithPointToPoint(H);
        const B = H.mul(Utils.toBN(x));
        return P1.add(P2).add(B);
    }
}

module.exports = Utils;