const sha256 = require('js-sha256').sha256;
const EC = require('elliptic').ec;
const BN = require('bn.js');

const constants = require('./Constants');
const Maths = require('./Maths');

const ec = new EC('secp256k1');

class Utils {

    /**
     * Try to coerce a scalar x to a curve point
     * meaning we try to find a y to the x.
     *
     * Notice that this can easily fail
     *
     * @param hex {string}
     * @return {Point}
     * @throws {Error} if not point was found
     */
    static scalarToPoint(hex) {
        try {
            return ec.keyFromPublic('02' + hex, 'hex').pub;
        } catch (e) {
            return ec.keyFromPublic('03' + hex, 'hex').pub;
        }
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

    static sha256hextohex(hx) {
        const hash = sha256.create();
        const inp = Buffer.from(hx, 'hex');
        hash.update(inp);
        return hash.hex();
    }

    /**
     * Generate a sha256 hash of a elliptic curve point
     *
     * @param p {Point}
     */
    static sha256pointtohex(p) {
        return Utils.sha256hextohex(p.encode('hex'));
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

        const fake = this.debugFakeChallenges();
        const hex = fake ? fake : Utils.sha256strtohex(ts.toString());
        const num = Maths.mod(BigInt('0x' + hex), n);
        const p = ec.g.mul(num);
        ts.addPoint(p);
        return retPoint ? p : num;
    }

    /**
     * A way to fake the challenges calculated during the proof
     * Only use this for debugging purposes
     *
     * To active set
     * DEBUG_CHALLENGES = "true"
     * FAKE_CHALLENGES = json array
     *
     * @return {boolean|array}
     */
    static debugFakeChallenges() {
        if( !process.env.DEBUG_CHALLENGES ) {
            return false;
        }
        else {
            if( !this.fakechallenges ) {
                this.fakechallenges = JSON.parse(process.env.FAKE_CHALLENGES);
                this.challenge_index = 0;
            }
            const x = this.fakechallenges[this.challenge_index];
            this.challenge_index++;
            console.log("Read fake challenge " + x);
            return x;
        }
    }

    /**
     * Get a new orthogonal generator point by sha256 hashing a generator
     * This should not be done during proof creation or verification
     * use the constants
     *
     * @param G {Point}
     * @return {Point}
     */
    static getnewGenFromHashingGen(G) {
        let hashedG = Utils.sha256pointtohex(G);
        let point = null;
        while (point === null ) {
            try {
                point = Utils.scalarToPoint(hashedG);
            } catch (e) {
                //
                hashedG = (BigInt('0x' + hashedG) + constants.essentials.FIXED_INC).toString(16);
            }
        }
        console.log("Found a point " + point.encode('hex'));
        return point;
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
     * @param blindingGen {Point} Blinding generator point (default is H)
     * @param valueGen {Point} Optional value generator (default is G)
     */
    static getPedersenCommitment(v, x, n=false, blindingGen=constants.gens.H, valueGen=constants.gens.G) {
        const x_BN = Utils.toBN(n ? Maths.mod(x, n) : x);
        const v_BN = Utils.toBN(n ? Maths.mod(v, n) : x);

        console.log("vH " + valueGen.mul(v_BN).encode('hex'));
        console.log("xG " + blindingGen.mul(x_BN).encode('hex'));

        return valueGen.mul(v_BN).add(blindingGen.mul(x_BN))
    }

    /**
     * @param bint {BigInt}
     * @return {string}
     */
    static encodeBigIntScalar(bint) {
        return bint.toString(16).padStart(64, '0');
    }

    /**
     * Encode points how it is done in libsec with the offset byte
     *
     * @param points Point[]
     */
    static encodePoints(points) {
        let output = "";
        const offsets = [];
        const nmbrOffsets = Math.ceil(points.length / 8);
        for ( let i = 0; i < nmbrOffsets; i++ ) {
            offsets.push([0,0,0,0,0,0,0,0]);
        }
        let offsetindex = 0;
        let offset = offsets[offsetindex];
        let counter = 0;
        for ( let j = 0; j < points.length; j++ ) {
            if( counter >= 8 ) {
                counter = 0;
                offsetindex++;
                offset = offsets[offsetindex];
            }
            const p = points[j];
            // Check the last bit of y
            const neg = !(BigInt(p.y.toString()) % 2n === 0n);
            if( neg ) {
                const ix = 7 - Maths.mod(j, 8);
                offset[ix] = 1;
            }
            counter++;
            output += this.encodeBigIntScalar(BigInt('0x' + p.x.toString(16)));
        }
        // Prepend the offset bytes
        let offsetStr = "";
        for( let o of offsets ) {
            const joined = o.join('');
            const b1 = parseInt(joined.substr(0,4), 2);
            const b2 = parseInt(joined.substr(4,4), 2);
            offsetStr += b1.toString(16);
            offsetStr += b2.toString(16);
        }
        return offsetStr + output;
    }

    /**
     * Generate a Vector Pedersen Commitment with blinding factor x
     *
     * @param l {Vector} Vector 1
     * @param r {Vector} Vector 2
     * @param vecG {PointVector} G vector
     * @param vecH {PointVector} H vector
     * @param x {BigInt} blinding factor
     * @param n {BigInt} optional group order
     * @param blindGen {Point} second Generator (If non provided we sha256 hash G)
     * @return {Point}
     */
    static getVectorPedersenCommitment(l, r, vecG, vecH, x, n=false, blindGen=constants.gens.H) {
        const P1 = vecG.multWithBigIntVector(l).toSinglePoint();
        const P2 = vecH.multWithBigIntVector(r).toSinglePoint();
        const B = blindGen.mul(Utils.toBN(x));
        return P1.add(P2).add(B);
    }
}

module.exports = Utils;