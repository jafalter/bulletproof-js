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
    }

    verify() {
        // Generator H
        const H = Utils.getHFromHashingG(this.G);

        // First we calculate the challenges y, z, x by using Fiat Shimar
        const y = Utils.getFiatShamirChallenge(this.V, this.n);
        const z = Utils.getFiatShamirChallenge(Utils.scalarToPoint(y.toString(16)), this.n);
        const x = Utils.getFiatShamirChallenge(Utils.scalarToPoint(z.toString(16)), this.n);
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

        // Final verification
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
}

module.exports = UncompressedBulletproof;