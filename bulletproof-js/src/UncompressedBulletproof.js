var EC = require('elliptic').ec;
const assert = require('assert');
const cryptoutils = require('bigint-crypto-utils');

const RangeProof = require('./RangeProof');
const PointVector = require('./PointVector');
const Utils = require('./Utils');
const BigIntVector = require('./BigIntVector');
const Maths = require('./Maths');
const Transcript = require('./Transcript');
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
        this.T = new Transcript();
        this.T.addPoint(this.A);
        this.T.addPoint(this.S);

        // Calculate the challenges y, z, x by using Fiat Shimar
        this.y = Utils.getFiatShamirChallengeTranscript(this.T, this.order);
        this.z = Utils.getFiatShamirChallengeTranscript(this.T, this.order);
        this.T.addPoint(T1);
        this.T.addPoint(T2);
        this.x = Utils.getFiatShamirChallengeTranscript(this.T, this.order);
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
        if(low !== 0n ) {
            throw new Error("Currently only range proofs from 0 to n are allowed");
        }
        // Generator H
        const G = this.G;
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
        const y_n = BigIntVector.getVectorToPowerN( y, up, this.order );
        const xsq = Maths.mod(x ** 2n, this.order);

        const leftEq = Utils.getPedersenCommitment(this.tx, this.txbf, this.order, H);
        const rightEq = this.V.mul(Utils.toBN(zsq)).add(this.G.mul(Utils.toBN(ProofUtils.delta(y_n, z, this.order)))).add(this.T1.mul(Utils.toBN(x))).add(this.T2.mul(Utils.toBN(xsq)));
        if( leftEq.eq(rightEq) === false ) { return false; }

        // Now prove validity of lx and rx
        const y_ninv = BigIntVector.getVectorToPowerMinusN( y, up, this.order);
        const vecH = PointVector.getVectorOfPoint(H, up);
        const vecG = PointVector.getVectorOfPoint(G, up);
        const vecH2 = vecH.multWithBigIntVector(y_ninv);

        const E = H.mul(Utils.toBN(this.e));
        const Einv = E.neg();
        const Bx = Utils.toBN(x);
        const vec_z = BigIntVector.getVectorWithOnlyScalar(z, up, this.order);

        const two_n  = BigIntVector.getVectorToPowerN(2n, BigInt(y_n.length()), this.order);
        const twos_times_zsq = two_n.multWithScalar(zsq);

        const l1 = y_n.multWithScalar(z).addVector(twos_times_zsq);
        const l2 = vec_z.addVector(y_ninv.multWithScalar(zsq).multVector(two_n));

        const P1 = Einv.add(this.A).add(this.S.mul(Bx)).add(vecH2.multWithBigIntVector(l1).toSinglePoint()).add(vecG.multWithBigIntVector(vec_z).toSinglePoint().neg());
        const P2 = Einv.add(this.A).add(this.S.mul(Bx)).add(vecH.multWithBigIntVector(l2).toSinglePoint()).add(vecG.multWithBigIntVector(vec_z).toSinglePoint().neg());
        const P = vecG.multWithBigIntVector(this.lx).addPointVector(vecH2.multWithBigIntVector(this.rx)).toSinglePoint();

        return P1.eq(P2) && P2.eq(P);
    }

    /**
     * Use the inner product compression to
     * compress size of the vectors to log order
     *
     * @param doAssert {boolean} if we should do assertions which will hurt performance
     * @return {CompressedBulletproof}
     */
    compressProof(doAssert=false) {
        const G = this.G;
        const n = this.order;
        const H = Utils.getnewGenFromHashingGen(G);

        const a = this.lx.clone();
        const b = this.rx.clone();
        const len = a.length();

        const vecG = PointVector.getVectorOfPoint(G, len);
        const vecH = PointVector.getVectorOfPoint(H, len);
        const y_ninv = BigIntVector.getVectorToPowerMinusN(this.y, BigInt(len), n);
        const vecH2 = vecH.multWithBigIntVector(y_ninv);

        // Orthogonal generator B
        const B = Utils.getnewGenFromHashingGen(H);
        // Indeterminate variable w
        const w = Utils.getFiatShamirChallengeTranscript(this.T, n);
        const wBN = Utils.toBN(w);

        const P = vecG.multWithBigIntVector(a).toSinglePoint().add(vecH2.multWithBigIntVector(b).toSinglePoint());
        const c = a.multVectorToScalar(b);
        const cBN = Utils.toBN(c);
        const Q = B.mul(wBN);

        /* Now we need k iterations to half the vectors
           until we arrive at single element vectors
        */
        let a_sum = a.clone();
        let b_sum = b.clone();
        let G_sum = vecG.clone();
        let H_sum = vecH2.clone();

        const intermediateTerms = [];
        let first = true;

        while (a_sum.length() > 1) {
            const a_lo = new BigIntVector(n);
            const b_lo = new BigIntVector(n);
            const G_lo = new PointVector();
            const H_lo = new PointVector();

            const a_hi = new BigIntVector(n);
            const b_hi = new BigIntVector(n);
            const G_hi = new PointVector();
            const H_hi = new PointVector();

            const half = a_sum.length() / 2;
            for( let i = 0; i < a_sum.length(); i++ ) {
                if( i < half ) {
                    a_lo.addElem(a_sum.get(i));
                    b_lo.addElem(b_sum.get(i));
                    G_lo.addElem(G_sum.get(i));
                    H_lo.addElem(H_sum.get(i));
                }
                else {
                    a_hi.addElem(a_sum.get(i));
                    b_hi.addElem(b_sum.get(i));
                    G_hi.addElem(G_sum.get(i));
                    H_hi.addElem(H_sum.get(i));
                }
            }
            if( doAssert ) {
                assert(a_lo.length() === a_hi.length(), "Length of those vectors needs to be the same when we start for a length which is a exponent of 2");
                assert(b_lo.length() === b_hi.length(), "Length of those vectors needs to be the same when we start for a length which is a exponent of 2");
                assert(G_lo.length() === G_hi.length(), "Length of those vectors needs to be the same when we start for a length which is a exponent of 2");
                assert(H_lo.length() === H_hi.length(), "Length of those vectors needs to be the same when we start for a length which is a exponent of 2");
            }
            // Before we get challenge u_k we commit to L_k and R_k
            const a_lo_b_hi = Utils.toBN(a_lo.multVectorToScalar(b_hi));
            const a_hi_b_lo = Utils.toBN(a_hi.multVectorToScalar(b_lo));

            const Lk = G_hi.multWithBigIntVector(a_lo).toSinglePoint().add(H_lo.multWithBigIntVector(b_hi).toSinglePoint()).add(Q.mul(a_lo_b_hi));
            const Rk = G_lo.multWithBigIntVector(a_hi).toSinglePoint().add(H_hi.multWithBigIntVector(b_lo).toSinglePoint()).add(Q.mul(a_hi_b_lo));
            this.T.addPoint(Lk);
            this.T.addPoint(Rk);

            let uk = Utils.getFiatShamirChallengeTranscript(this.T, n);
            const ukinv = cryptoutils.modInv(uk, n);
            let ukBN = Utils.toBN(uk);
            const ukinvBN = Utils.toBN(ukinv);

            if( doAssert ) {
                assert(Maths.mod(uk * ukinv, n) === 1n);
                assert(G.mul(Utils.toBN(uk * ukinv)).eq(G));
            }

            intermediateTerms.push({
                L : Lk,
                R : Rk,
                u: uk
            });

            // Now we add up the vectors seperated by u_k
            a_sum = new BigIntVector(n);
            b_sum = new BigIntVector(n);
            G_sum = new PointVector();
            H_sum = new PointVector();
            for ( let i = 0; i < a_lo.length(); i++ ) {
                a_sum.addElem(a_lo.get(i) * uk + ukinv * a_hi.get(i));
                b_sum.addElem(b_lo.get(i) * ukinv + uk * b_hi.get(i));

                G_sum.addElem( G_lo.get(i).mul(ukinvBN).add(G_hi.get(i).mul(ukBN)) );
                H_sum.addElem( H_lo.get(i).mul(ukBN).add(H_hi.get(i).mul(ukinvBN)) );
            }

            if( doAssert && first ) {
                const P_star = P.add(Q.mul(cBN));

                const a_sum_b_sum = Utils.toBN(a_sum.multVectorToScalar(b_sum));
                const Pk = G_sum.multWithBigIntVector(a_sum).toSinglePoint().add(H_sum.multWithBigIntVector(b_sum).toSinglePoint()).add(Q.mul(a_sum_b_sum));
                const Lj = intermediateTerms[0].L;
                const Rj = intermediateTerms[0].R;
                const uj2 = Maths.mod(uk ** 2n, n);
                const uj2_BN = Utils.toBN(uj2);
                const uj2inv = Maths.mod( cryptoutils.modInv(uj2, n), n);
                const uj2invBN = Utils.toBN(uj2inv);

                assert(Maths.mod(uj2 * uj2inv, n) === 1n);
                assert(G.mul(Utils.toBN(uj2 * uj2inv)).eq(G));

                const Lkuj2 = Lj.mul(uj2_BN);
                const Rkuj2inv = Rj.mul(uj2invBN);
                const Pk_comp = P_star.add(Lkuj2).add(Rkuj2inv);
                assert(Pk_comp.eq(Pk));
            }
            first = false;
        }
        const G0 = G_sum.get(0);
        const H0 = H_sum.get(0);
        const a0 = a_sum.get(0);
        const b0 = b_sum.get(0);
        const a0BN = Utils.toBN(a0);
        const b0BN = Utils.toBN(b0);
        const c0 = Maths.mod(a0 * b0, n);
        const c0BN = Utils.toBN(c0);
        if( doAssert ) {
            const P_star = P.add(Q.mul(cBN));
            const L0 = intermediateTerms[0].L;
            const R0 = intermediateTerms[0].R;
            const u0 = intermediateTerms[0].u;
            const u02 = Maths.mod(u0 ** 2n, n);
            const u02BN = Utils.toBN(u02);
            const u02inv = cryptoutils.modInv(u02, n);
            const u02invBN = Utils.toBN(u02inv);
            let det = L0.mul(u02BN).add(R0.mul(u02invBN));
            for( let j = 1; j < intermediateTerms.length; j++ ) {
                const Lj = intermediateTerms[j].L;
                const Rj = intermediateTerms[j].R;
                const uj = intermediateTerms[j].u;
                const uj2 = Maths.mod(uj ** 2n, n);
                const uj2BN = Utils.toBN(uj2);
                const uj2inv = cryptoutils.modInv(uj2, n);
                const uj2invBN = Utils.toBN(uj2inv);
                const Ljuj2 = Lj.mul(uj2BN);
                const Rjuj2inv = Rj.mul(uj2invBN);
                det = det.add(Ljuj2).add(Rjuj2inv);
            }
            const detinv = det.neg();

            const P0 =  G0.mul(a0BN).add(H0.mul(b0BN)).add(Q.mul(c0BN));
            assert(P_star.eq(P0.add(detinv)), 'What the verifier will check');
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
            intermediateTerms,
            Q,
            G,
            n
        );
    }
}

module.exports = UncompressedBulletproof;