const RangeProof = require('./RangeProof');
const Utils = require('./Utils');
const BigIntVector = require('./BigIntVector');
const Maths = require('./Maths');
const PointVector = require('./PointVector');

/**
 * A bulletproof which can be verified or transformed into
 * a more compact InnerProductBulletproof
 */
class UncompressedBulletproof extends RangeProof {

    static delta(yn, z, mod=false) {
        if( mod && typeof mod !== 'bigint' ) {
            throw new Error("Please supply bigint as mod parameter");
        }
        const ones = BigIntVector.getVectorWithOnlyScalar(1n, yn.length(), mod);
        const twopown = BigIntVector.getVectorToPowerE(2n, BigInt(yn.length(), mod));
        const left = (z - z ** 2n) * ones.multVectorToScalar(yn);
        const right = z ** 3n * ones.multVectorToScalar(twopown);
        const result = left - right;
        if( mod ) { return Maths.mod(result, mod); }
        return result;
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
     * @param n {BigInt} curve order
     */
    constructor(V, A, S, T1, T2, tx, txbf, e, lx, rx, G, n) {
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
        this.n = n;

        // Calculate the challenges y, z, x by using Fiat Shimar
        this.y = Utils.getFiatShamirChallenge(this.V, this.n);
        this.z = Utils.getFiatShamirChallenge(Utils.scalarToPoint(y.toString(16)), this.n);
        this.x = Utils.getFiatShamirChallenge(Utils.scalarToPoint(z.toString(16)), this.n);
    }

    verify() {
        // Generator H
        const H = Utils.getHFromHashingG(this.G);

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
        const vTx = Maths.mod(this.lx.multVectorToScalar(this.rx, this.n), this.n);
        if( vTx !== this.tx ) { return false; }

        // Now we verify that t() is the right polynomial
        const zsq = Maths.mod(z ** 2n, this.n);
        const y_e = BigIntVector.getVectorToPowerE( y, BigInt(this.lx.length()), this.n );
        const xsq = Maths.mod(x ** 2n, this.n);

        const leftEq = Utils.getPedersenCommitment(this.tx, this.txbf, this.n, H);
        const rightEq = this.V.mul(Utils.toBN(zsq)).add(this.G.mul(Utils.toBN(UncompressedBulletproof.delta(y_e, z, this.n)))).add(this.T1.mul(Utils.toBN(x))).add(this.T2.mul(Utils.toBN(xsq)));
        if( leftEq.eq(rightEq) === false ) { return false; }

        // Now prove validity of lx and rx
        const y_nege = BigIntVector.getVectorToPowerE( -y, BigInt(this.lx.length()), this.n);
        const H2 = y_nege.multVectorWithPointToPoint(H);

        const nege = Maths.mod(-this.e, this.n);
        const Bnege = Utils.toBN(nege);
        const Bx = Utils.toBN(x);
        const vec_z = BigIntVector.getVectorWithOnlyScalar(z, y_e.length(), this.n);
        const twos_power_e  = BigIntVector.getVectorToPowerE(2n, BigInt(y_e.length()), this.n);
        const twos_times_zsq = twos_power_e.multWithScalar(zsq);

        const l1 = y_e.multWithScalar(z).addVector(twos_times_zsq);
        const l2 = vec_z.addVector(y_nege.multWithScalar(zsq).multVector(twos_power_e));

        const P1 = H.mul(Bnege).add(this.A).add(this.S.mul(Bx)).add(l1.multVectorWithPointToPoint(H2)).add(vec_z.multVectorWithPointToPoint(this.G).neg());
        const P2 = H.mul(Bnege).add(this.A).add(this.S.mul(Bx)).add(l2.multVectorWithPointToPoint(H)).add(vec_z.multVectorWithPointToPoint(this.G).neg());

        return P1.eq(P2);
    }

    /**
     * Use the inner product compression to
     * compress size of the vectors to log n
     */
    compressProof() {
        const H = Utils.getHFromHashingG(this.G);

        // Orthogonal generator B
        const B = Utils.getHFromHashingG(H);
        // Indeterminate variable w
        const w = Utils.getFiatShamirChallenge(Utils.scalarToPoint(this.x.toString(16)), this.n);

        const P = this.lx.multVectorWithPointToPoint(this.G).add(this.rx.multVectorWithPointToPoint(H));
        const c = this.lx.multVectorToScalar(this.rx, this.n);
        const Q = B.mul(w);
        const P_star = P.add(B.mul(w * c));
        const k = Math.ceil(Math.log(this.lx.length()));

        /* Now we need k iterations to half the vectors
           until we arrive at single element vectors
        */
        const len = this.lx.length();
        let a_tmp = this.lx.clone();
        let b_tmp = this.rx.clone();
        let Gs_tmp = PointVector.getVectorFullOfPoint(this.G, len);
        let Hs_tmp = PointVector.getVectorFullOfPoint(H, len);
        let u_k = Utils.getFiatShamirChallenge(Utils.scalarToPoint(w.toString(16)), this.n);

        const intermediateTerms = [];

        while (a_tmp.length() > 1) {
            const u_k_neg = Maths.mod(u_k ** -1, this.n);
            const a_lo = new BigIntVector(this.n);
            const b_lo = new BigIntVector(this.n);
            const G_lo = new PointVector();
            const H_lo = new PointVector();

            const a_hi = new BigIntVector(this.n);
            const b_hi = new BigIntVector(this.n);
            const G_hi = new PointVector();
            const H_hi = new PointVector();

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
            assert(a_lo.length() === a_hi.length(), "Length of those vectors needs to be the same when we start for a length which is a exponent of 2");
            assert(b_lo.length() === b_hi.length(), "Length of those vectors needs to be the same when we start for a length which is a exponent of 2");
            assert(G_lo.length() === G_hi.length(), "Length of those vectors needs to be the same when we start for a length which is a exponent of 2");
            assert(H_lo.length() === H_hi.length(), "Length of those vectors needs to be the same when we start for a length which is a exponent of 2");

            // Now we add up the vectors seperated by u_k
            a_tmp = new BigIntVector(this.n);
            b_tmp = new BigIntVector(this.n);
            Gs_tmp = new PointVector();
            Hs_tmp = new PointVector();
            for ( let i = 0; i < a_lo.length(); i++ ) {
                a_tmp.addElem(a_lo.get(i) * u_k + u_k_neg * a_hi.get(i));
                b_tmp.addElem(b_lo.get(i) * u_k_neg + u_k * b_hi.get(i));
                Gs_tmp.addElem(G_lo.get(i).mul(Utils.toBN(u_k_neg)).add(G_hi.get(i).mul(Utils.toBN(u_k))));
                Hs_tmp.addElem(H_lo.get(i).mul(Utils.toBN(u_k)).add(H_hi.get(i).mul(Utils.toBN(u_k_neg))));
            }

            const Lk = G_hi.multWithBigIntVectorToPoint(a_lo).add(H_lo.multWithBigIntVectorToPoint(b_hi)).add(Q.mul(Utils.toBN(a_lo.multVectorToScalar(b_hi, this.n))));
            const Rk = G_lo.multWithBigIntVectorToPoint(a_hi).add(H_hi.multWithBigIntVectorToPoint(b_lo)).add(Q.mul(Utils.toBN(a_hi.multVectorToScalar(b_lo, this.n))));
            intermediateTerms.push({
                L : Lk,
                R : Rk,
            });

            u_k = Utils.getFiatShamirChallenge(Utils.scalarToPoint(u_k.toString(16)), this.n);
        }
    }
}

module.exports = UncompressedBulletproof;