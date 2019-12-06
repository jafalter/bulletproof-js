var EC = require('elliptic').ec;
const assert = require('assert');
const cryptoutils = require('bigint-crypto-utils');

const RangeProof = require('./RangeProof');
const Utils = require('./Utils');
const BigIntVector = require('./BigIntVector');
const Maths = require('./Maths');
const PointVector = require('./PointVector');
const CompressedBulletproof = require('./CompressedBulletproof');
const ProofUtils = require('./ProofUtils');

var ec = new EC('secp256k1');

/**
 * A bulletproof which can be verified or transformed into
 * a more compact InnerProductBulletproof
 */
class UncompressedBulletproof extends RangeProof {

    /**
     * Get UncompressedBulletproof from serialzed
     * json string
     *
     * @param str {string}
     * @return {UncompressedBulletproof}
     */
    static fromJsonString(str) {
        const obj = JSON.parse(str);
        return new UncompressedBulletproof(
            ec.keyFromPublic(obj.V, 'hex').pub,
            ec.keyFromPublic(obj.A, 'hex').pub,
            ec.keyFromPublic(obj.S, 'hex').pub,
            ec.keyFromPublic(obj.T1, 'hex').pub,
            ec.keyFromPublic(obj.T2, 'hex').pub,
            BigInt(obj.tx),
            BigInt(obj.txbf),
            BigInt(obj.e),
            BigIntVector.getFromObject(obj.lx),
            BigIntVector.getFromObject(obj.rx),
            ec.keyFromPublic(obj.G, 'hex').pub,
            BigInt(obj.order),
        )
    }

    /**
     *
     * @param V {Point} Pedersen commitment for which the range is proven
     * @param A {Point} Vector pedersen commitment committing to a_L and a_R the amount split into a vector which is the amount in binary and a vector containing exponents of 2
     * @param S {Point} Vector pedersen commitment committing to s_L and s_R the blinding vectors
     * @param T1 {Point} Pedersen commitment to tx
     * @param T2 {Point} Pedersen commitment to tx²
     * @param tx {BigInt} Polynomial t() evaluated with challenge x
     * @param txbf {BigInt} Opening blinding factor for t() to verify the correctness of t(x)
     * @param e {BigInt} Opening e of the combined blinding factors using in A and S to verify correctness of l(x) and r(x)
     * @param lx {BigIntVector} left side of the blinded vector product
     * @param rx {BigIntVector} right side of the blinded vector prduct
     * @param G {Point} Base generator
     * @param order {BigInt} curve order
     */
    constructor(V, A, S, T1, T2, tx, txbf, e, lx, rx, G, order) {
        super();
        this.V = V;
        this.A = A;
        this.S = S;
        this.T1 = T1;
        this.T2 = T2;
        this.tx = tx;
        this.txbf = txbf;
        this.e = e;
        this.lx = lx;
        this.rx = rx;
        this.G = G;
        this.order = order;

        // Calculate the challenges y, z, x by using Fiat Shimar
        this.y = Utils.getFiatShamirChallenge(this.V, this.order);
        this.z = Utils.getFiatShamirChallenge(Utils.scalarToPoint(this.y.toString(16)), this.order);
        this.x = Utils.getFiatShamirChallenge(Utils.scalarToPoint(this.z.toString(16)), this.order);
    }

    /**
     *
     * @param e {UncompressedBulletproof}
     * @return {boolean}
     */
    equals(e) {
        if( !(e instanceof UncompressedBulletproof) ) {
            return false;
        }
        return this.V.eq(e.V) &&
               this.A.eq(e.A) &&
               this.S.eq(e.S) &&
               this.T1.eq(e.T1) &&
               this.T2.eq(e.T2) &&
               this.tx === e.tx &&
               this.txbf === e.txbf &&
               this.e === e.e &&
               this.lx.equals(e.lx) &&
               this.rx.equals(e.rx) &&
               this.G.eq(e.G) &&
               this.order === e.order;
    }

    /**
     * Serialize Uncompressed proof into a JSON string
     *
     * @return {string}
     */
    toJson() {
        return JSON.stringify({
            V : this.V.encode('hex'),
            A : this.A.encode('hex'),
            S : this.S.encode('hex'),
            T1 : this.T1.encode('hex'),
            T2 : this.T2.encode('hex'),
            tx : '0x' + this.tx.toString(16),
            txbf : '0x' + this.txbf.toString(16),
            e : '0x' + this.e.toString(16),
            lx : this.lx.toObject(),
            rx : this.rx.toObject(),
            G : this.G.encode('hex'),
            order : '0x' + this.order.toString(16)
    });
    }

    verify(low, up) {
        // Generator H
        const H = Utils.getnewGenFromHashingGen(this.G);

        // First we calculate the challenges y, z, x by using Fiat Shamir
        const y = this.y;
        const z = this.z;
        const x = this.x;
        console.log(`
        Challenges:
        y : ${y}
        z : ${z}
        x : ${x}
        `);

        // Verify that <lx, rx> = tx
        const vTx = Maths.mod(this.lx.multVectorToScalar(this.rx, this.order), this.order);
        if( vTx !== this.tx ) { return false; }

        // Now we verify that t() is the right polynomial
        const zsq = Maths.mod(z ** 2n, this.order);
        const y_e = BigIntVector.getVectorToPowerN( y, up, this.order );
        const xsq = Maths.mod(x ** 2n, this.order);

        const leftEq = Utils.getPedersenCommitment(this.tx, this.txbf, this.order, H);
        const rightEq = this.V.mul(Utils.toBN(zsq)).add(this.G.mul(Utils.toBN(ProofUtils.delta(y_e, z, this.order)))).add(this.T1.mul(Utils.toBN(x))).add(this.T2.mul(Utils.toBN(xsq)));
        if( leftEq.eq(rightEq) === false ) { return false; }

        // Now prove validity of lx and rx
        const y_nege = BigIntVector.getVectorToPowerN( -y, up, this.order);
        const H2 = y_nege.multVectorWithPointToPoint(H);

        const nege = Maths.mod(-this.e, this.order);
        const Bnege = Utils.toBN(nege);
        const Bx = Utils.toBN(x);
        const vec_z = BigIntVector.getVectorWithOnlyScalar(z, y_e.length(), this.order);
        const twos_power_e  = BigIntVector.getVectorToPowerN(2n, BigInt(y_e.length()), this.order);
        const twos_times_zsq = twos_power_e.multWithScalar(zsq);

        const l1 = y_e.multWithScalar(z).addVector(twos_times_zsq);
        const l2 = vec_z.addVector(y_nege.multWithScalar(zsq).multVector(twos_power_e));

        const P1 = H.mul(Bnege).add(this.A).add(this.S.mul(Bx)).add(l1.multVectorWithPointToPoint(H2)).add(vec_z.multVectorWithPointToPoint(this.G).neg());
        const P2 = H.mul(Bnege).add(this.A).add(this.S.mul(Bx)).add(l2.multVectorWithPointToPoint(H)).add(vec_z.multVectorWithPointToPoint(this.G).neg());

        return P1.eq(P2);
    }

    /**
     * Use the inner product compression to
     * compress size of the vectors to log order
     *
     * @param doAssert {boolean} if we should do assertions which will hurt performance
     * @return {CompressedBulletproof}
     */
    compressProof(doAssert=false) {
        const H = Utils.getnewGenFromHashingGen(this.G);

        // Orthogonal generator B
        const B = Utils.getnewGenFromHashingGen(H);
        // Indeterminate variable w
        const w = Utils.getFiatShamirChallenge(Utils.scalarToPoint(this.x.toString(16)), this.order);

        const P = this.lx.multVectorWithPointToPoint(this.G).add(this.rx.multVectorWithPointToPoint(H));
        const c = this.lx.multVectorToScalar(this.rx, this.order);
        const Q = B.mul(Utils.toBN(w));

        /* Now we need k iterations to half the vectors
           until we arrive at single element vectors
        */
        const len = this.lx.length();
        let a_tmp = this.lx.clone();
        let b_tmp = this.rx.clone();
        let Gs_tmp = BigIntVector.getVectorWithOnlyScalar(1n, this.rx.length(), this.order);
        let Hs_tmp = BigIntVector.getVectorWithOnlyScalar(1n, this.rx.length(), this.order);

        const intermediateTerms = [];
        let first = true;

        while (a_tmp.length() > 1) {
            const a_lo = new BigIntVector(this.order);
            const b_lo = new BigIntVector(this.order);
            const G_lo = new BigIntVector(this.order);
            const H_lo = new BigIntVector(this.order);

            const a_hi = new BigIntVector(this.order);
            const b_hi = new BigIntVector(this.order);
            const G_hi = new BigIntVector(this.order);
            const H_hi = new BigIntVector(this.order);

            const half = a_tmp.length() / 2;
            for( let i = 0; i < a_tmp.length(); i++ ) {
                if( i < half ) {
                    a_lo.addElem(a_tmp.get(i));
                    b_lo.addElem(b_tmp.get(i));
                    G_lo.addElem(Gs_tmp.get(i));
                    H_lo.addElem(Hs_tmp.get(i));
                }
                else {
                    a_hi.addElem(a_tmp.get(i));
                    b_hi.addElem(b_tmp.get(i));
                    G_hi.addElem(Gs_tmp.get(i));
                    H_hi.addElem(Hs_tmp.get(i));
                }
            }
            if( doAssert ) {
                assert(a_lo.length() === a_hi.length(), "Length of those vectors needs to be the same when we start for a length which is a exponent of 2");
                assert(b_lo.length() === b_hi.length(), "Length of those vectors needs to be the same when we start for a length which is a exponent of 2");
                assert(G_lo.length() === G_hi.length(), "Length of those vectors needs to be the same when we start for a length which is a exponent of 2");
                assert(H_lo.length() === H_hi.length(), "Length of those vectors needs to be the same when we start for a length which is a exponent of 2");
            }
            // Before we get challenge u_k we commit to L_k and R_k
            const Lk = this.G.mul(Utils.toBN(a_lo.multVectorToScalar(G_hi))).add( H.mul(Utils.toBN(b_hi.multVectorToScalar(H_lo))) ).add( Q.mul(Utils.toBN(a_lo.multVectorToScalar(b_hi, this.order))) );
            const Rk = this.G.mul(Utils.toBN(a_hi.multVectorToScalar(G_lo))).add( H.mul(Utils.toBN(b_lo.multVectorToScalar(H_hi))) ).add( Q.mul(Utils.toBN(a_hi.multVectorToScalar(b_lo, this.order))) );

            let u_k = Utils.getFiatShamirChallenge(Utils.scalarToPoint(w.toString(16)), this.order);
            const u_k_inv = cryptoutils.modInv(u_k, this.order);

            intermediateTerms.push({
                L : Lk,
                R : Rk,
                u: u_k
            });

            // Now we add up the vectors seperated by u_k
            a_tmp = new BigIntVector(this.order);
            b_tmp = new BigIntVector(this.order);
            Gs_tmp = new BigIntVector(this.order);
            Hs_tmp = new BigIntVector(this.order);
            for ( let i = 0; i < a_lo.length(); i++ ) {
                a_tmp.addElem(a_lo.get(i) * u_k + u_k_inv * a_hi.get(i));
                b_tmp.addElem(b_lo.get(i) * u_k_inv + u_k * b_hi.get(i));
                Gs_tmp.addElem(G_lo.get(i) * u_k_inv + u_k * G_hi.get(i));
                Hs_tmp.addElem(H_lo.get(i) * u_k + u_k_inv * H_hi.get(i));
            }

            if( doAssert && first ) {
                const P_star = P.add(Q.mul(Utils.toBN(c)));
                const Pk = this.G.mul(Utils.toBN(Gs_tmp.multVectorToScalar(a_tmp))).add( H.mul(Utils.toBN(Hs_tmp.multVectorToScalar(b_tmp))) ).add( Q.mul(Utils.toBN(a_tmp.multVectorToScalar(b_tmp))) );
                const Lj = intermediateTerms[0].L;
                const Rj = intermediateTerms[0].R;
                const uj_2 = Maths.mod(u_k ** 2n, this.order);
                const uj_2neg = Maths.mod( u_k_inv ** 2n, this.order);
                const det = Lj.mul(Utils.toBN(uj_2)).add(Rj.mul(Utils.toBN(uj_2neg)));
                assert(P_star.add(det).eq(Pk));
            }
            first = false;
        }
        const G0 = Gs_tmp.get(0);
        const H0 = Hs_tmp.get(0);
        const a0 = a_tmp.get(0);
        const b0 = a_tmp.get(0);
        if( doAssert ) {
            const P_star = P.add(B.mul(Utils.toBN(Maths.mod(w * c, this.order))));
            const L0 = intermediateTerms[0].L;
            const R0 = intermediateTerms[0].R;
            const u0 = intermediateTerms[0].u;
            const u0_2 = u0 ^2n;
            const u0_2neg = u0 ^(-2n);
            const det = L0.mul(u0_2).add(R0.mul(u0_2neg));
            for( let j = 1; j < intermediateTerms.length; j++ ) {
                const Lj = intermediateTerms[j].L;
                const Rj = intermediateTerms[j].R;
                const uj = intermediateTerms[j].u;
                const uj_2 = Maths.mod(uj ^ 2n, this.order);
                const uj_2neg = Maths.mod(uj ^(-2n), this.order);
                det.add(Lj.mul(uj_2).add(Rj.mul(uj_2neg)));
            }
            const P_cmp = this.G.mul(Utils.toBN(a0)).add(H.mul(Utils.toBN(b0))).add(Q.mul(Utils.toBN(Maths.mod(a0 * b0, this.order)))).add(det.neg());
            assert(P_star.eq(P_cmp), 'What the verifier will check');
        }
        return new CompressedBulletproof(
            this.V,
            this.A,
            this.S,
            this.T1,
            this.T2,
            this.tx,
            this.txbf,
            this.e,
            a0,
            b0,
            G0,
            H0,
            intermediateTerms,
            Q,
            this.G,
            this.order
        );
    }
}

module.exports = UncompressedBulletproof;