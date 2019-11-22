const RangeProof = require('./RangeProof');
const Utils = require('./Utils');
const Vector = require('./Vector');
const Maths = require('./Maths');

/**
 * A bulletproof which can be verified or transformed into
 * a more compact InnerProductBulletproof
 */
class UncompressedBulletproof extends RangeProof {

    static delta(yn, z, mod=false) {
        if( mod && typeof mod !== 'bigint' ) {
            throw new Error("Please supply bigint as mod parameter");
        }
        const ones = Vector.getVectorWithOnlyScalar(1n, yn.length(), mod);
        const twopown = Vector.getVectorToPowerE(2n, BigInt(yn.length(), mod));
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
     * @param lx {Vector} left side of the blinded vector product
     * @param rx {Vector} right side of the blinded vector prduct
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

        // First we calculate the challenges y, z, x by using Fiat Shimar
        const y = this.y;
        const z = this.z;
        const x = this.x;
        console.log(`
        Challenges:
        y : ${y}
        z : ${z}
        x : ${x}
        `);

        const vTx = Maths.mod(this.lx.multVectorToScalar(this.rx, this.n), this.n);
        if( vTx !== this.tx ) { return false; }

        // Now we verify that t() is the right polynomial
        const zsq = Maths.mod(z ** 2n, this.n);
        const y_e = Vector.getVectorToPowerE( y, BigInt(this.lx.length()), this.n );
        const xsq = Maths.mod(x ** 2n, this.n);

        const leftEq = Utils.getPedersenCommitment(this.tx, this.txbf, this.n, H);
        const rightEq = this.V.mul(Utils.toBN(zsq)).add(this.G.mul(Utils.toBN(UncompressedBulletproof.delta(y_e, z, this.n)))).add(this.T1.mul(Utils.toBN(x))).add(this.T2.mul(Utils.toBN(xsq)));
        if( leftEq.eq(rightEq) === false ) { return false; }

        // Now prove validity of lx and rx
        const y_nege = Vector.getVectorToPowerE( -y, BigInt(this.lx.length()), this.n);
        const H2 = y_nege.multVectorWithPointToPoint(H);

        const nege = Maths.mod(-this.e, this.n);
        const Bnege = Utils.toBN(nege);
        const Bx = Utils.toBN(x);
        const vec_z = Vector.getVectorWithOnlyScalar(z, y_e.length(), this.n);
        const twos_power_e  = Vector.getVectorToPowerE(2n, BigInt(y_e.length()), this.n);
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
        let a_tmp = this.lx.clone();
        let b_tmp = this.rx.clone();
        let u_k = Utils.getFiatShamirChallenge(Utils.scalarToPoint(w.toString(16)), this.n);
        while (a_tmp.length() > 1) {
            const u_k_neg = Maths.mod(u_k ** -1, this.n);
            const a_lo = new Vector(this.n);
            const a_hi = new Vector(this.n);
            const half = a_tmp.length() / 2;
            for( let i = 0; i < a_tmp.length(); i++ ) {
                if( i < half ) {
                    a_lo.addElem(a_tmp.get(i));
                }
                else {
                    a_hi.addElem(a_tmp.get(i));
                }
            }
            assert(a_lo.length() === a_hi.length(), "Length of those vectors needs to be the same when we start for a length which is a exponent of 2");
            // Now we add the vectors seperated by u_k
            a_tmp = new Vector(this.n);
            for ( let i = 0; i < a_lo.length(); i++ ) {
                a_tmp.addElem(a_lo.get(i) * u_k + u_k_neg * a_hi.get(i));
            }

            // TODO commitments Lk and Rk and add them to P_0
        }
    }
}

module.exports = UncompressedBulletproof;