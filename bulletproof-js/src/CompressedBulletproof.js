const cryptoutils = require('bigint-crypto-utils');

const RangeProof = require('./RangeProof');
const Utils = require('./Utils');
const Maths = require('./Maths');
const BigIntVector = require('./BigIntVector');
const ProofUtils = require('./ProofUtils');

class CompressedBulletproof extends RangeProof {

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
     * @param a0 {BigInt} The single element in a after compressing the lx vector
     * @param b0 {BigInt} The single element in b after compressing the rx vector
     * @param G0 {Point} the single element in G after compressing the Gs vector
     * @param H0 {Point} the single element in H after compressing the Hs vector
     * @param ind {{ L : Point, R : Point}[]} indeterminante variables
     * @param Q {Point} orthogonal Generator multiplied with indeterminate variable w
     * @param G {Point} Generator
     * @param order {BigInt} curve order
     */
    constructor(V, A, S, T1, T2, tx, txbf, e, a0, b0, G0, H0, ind, Q, G, order) {
        super();
        this.V = V;
        this.A = A;
        this.S = S;
        this.T1 = T1;
        this.T2 = T2;
        this.tx = tx;
        this.txbf = txbf;
        this.e = e;
        this.a0 = a0;
        this.b0 = b0;
        this.G0 = G0;
        this.H0 = H0;
        this.ind = ind;
        this.Q = Q;
        this.G = G;
        this.order = order;

        // Calculate the challenges y, z, x by using Fiat Shimar
        this.y = Utils.getFiatShamirChallenge(this.V, this.order);
        this.z = Utils.getFiatShamirChallenge(Utils.scalarToPoint(this.y.toString(16)), this.order);
        this.x = Utils.getFiatShamirChallenge(Utils.scalarToPoint(this.z.toString(16)), this.order);
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

        if( P1.eq(P2) === false ) { return false; }

        // Now we prove the < lx, rx > = tx relation using the output of inner product proof
        const P = P1;
        const c = this.tx;

        const leftSide = P.add(this.Q.mul(Utils.toBN(c)));
        const L0 = this.ind[0].L;
        const R0 = this.ind[0].R;
        const u0 = this.ind[0].u;
        const u0_2 = Maths.mod(u0 ** 2n, this.order);
        const u0_2_inv = cryptoutils.modInv(u0_2, this.order);
        const det = (L0.mul(u0_2).add(R0.mul(u0_2_inv)));
        for( let j = 1; j < this.ind.length; j++ ) {
            const Lj = this.ind[j].L;
            const Rj = this.ind[j].R;
            // TODO proper Fiat Shamir
            const uj = this.ind[j].u;
            const uj_2 = Maths.mod(uj ** 2, this.order);
            const uj_2_inv = cryptoutils.modInv(uj_2, this.order);
            det.add(Lj.mul(uj_2).add(Rj.mul(uj_2_inv)));
        }
        const rightSide = this.G0.mul(Utils.toBN(this.a0)).add(this.H0.mul(Utils.toBN(this.b0))).add(this.Q.mul(Utils.toBN(Maths.mod(this.a0 * this.b0, this.order)))).add(det.neg());
        return leftSide.eq(rightSide);
    }
}

module.exports = CompressedBulletproof;