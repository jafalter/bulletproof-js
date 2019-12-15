const cryptoutils = require('bigint-crypto-utils');

const RangeProof = require('./RangeProof');
const Transcript = require('./Transcript');
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
     * @param ind {{ L : Point, R : Point}[]} indeterminante variables
     * @param Q {Point} orthogonal Generator multiplied with indeterminate variable w
     * @param G {Point} Generator
     * @param order {BigInt} curve order
     */
    constructor(V, A, S, T1, T2, tx, txbf, e, a0, b0, ind, Q, G, order) {
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
        this.ind = ind;
        this.Q = Q;
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

    verify(low, up) {
        if(low !== 0n ) {
            throw new Error("Currenlty only range proofs from 0 to n are allowed");
        }
        // Generator H
        const H = Utils.getnewGenFromHashingGen(this.G);

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
        const y_n = BigIntVector.getVectorToPowerN( y, up, this.order );
        const xsq = Maths.mod(x ** 2n, this.order);

        const leftEq = Utils.getPedersenCommitment(this.tx, this.txbf, this.order, H);
        const rightEq = this.V.mul(Utils.toBN(zsq)).add(this.G.mul(Utils.toBN(ProofUtils.delta(y_n, z, this.order)))).add(this.T1.mul(Utils.toBN(x))).add(this.T2.mul(Utils.toBN(xsq)));
        if( leftEq.eq(rightEq) === false ) { return false; }

        // Now prove validity of lx and rx
        const y_nInv = BigIntVector.getVectorToPowerN( -y, up, this.order);
        const H2 = y_nInv.multVectorWithPointToPoint(H);

        const eInv = cryptoutils.modInv(this.e, this.order);
        const eInvBN = Utils.toBN(eInv);
        const Bx = Utils.toBN(x);
        const vec_z = BigIntVector.getVectorWithOnlyScalar(z, y_n.length(), this.order);
        const twos_power_n  = BigIntVector.getVectorToPowerN(2n, BigInt(y_n.length()), this.order);
        const twos_times_zsq = twos_power_n.multWithScalar(zsq);

        const l1 = y_n.multWithScalar(z).addVector(twos_times_zsq);
        const l2 = vec_z.addVector(y_nInv.multWithScalar(zsq).multVector(twos_power_n));

        const P1 = H.mul(eInvBN).add(this.A).add(this.S.mul(Bx)).add(l1.multVectorWithPointToPoint(H2)).add(vec_z.multVectorWithPointToPoint(this.G).neg());
        const P2 = H.mul(eInvBN).add(this.A).add(this.S.mul(Bx)).add(l2.multVectorWithPointToPoint(H)).add(vec_z.multVectorWithPointToPoint(this.G).neg());

        if( P1.eq(P2) === false ) { return false; }

        // Now we prove the < lx, rx > = tx relation using the output of inner product proof
        const P = P1;
        const c = this.tx;
        const cBN = Utils.toBN(c);

        const leftSide = P.add(this.Q.mul(cBN));
        const L0 = this.ind[0].L;
        const R0 = this.ind[0].R;
        const u0 = this.ind[0].u;
        const u02 = Maths.mod(u0 ** 2n, this.order);
        const u02BN = Utils.toBN(u02);
        const u02inv = cryptoutils.modInv(u02, this.order);
        const u02invBN = Utils.toBN(u02inv);

        let s = 1n;
        let i = 0;
        let tmp = up;
        while (tmp > 1) {
            // TODO proper fiat shamir
            let u = this.ind[i].u;
            let uinv = cryptoutils.modInv(u, this.order);
            s = Maths.mod(s * uinv + u * s, this.order);
            tmp = tmp / 2n;
            i++;
        }
        const sinv = cryptoutils.modInv(s, this.order);
        console.log("s " + s);
        console.log("sinv " + sinv);

        let det = L0.mul(u02BN).add(R0.mul(u02invBN));
        for( let j = 1; j < this.ind.length; j++ ) {
            const Lj = this.ind[j].L;
            const Rj = this.ind[j].R;
            // TODO proper Fiat Shamir
            const uj = this.ind[j].u;
            const uj2 = Maths.mod(uj ** 2n, this.order);
            const uj2BN = Utils.toBN(uj2);
            const uj2inv = cryptoutils.modInv(uj2, this.order);
            const uj2invBN = Utils.toBN(uj2inv);
            det = det.add(Lj.mul(uj2BN)).add(Rj.mul(uj2invBN));
        }
        const a0s = Utils.toBN(Maths.mod(this.a0 * s, this.order));
        const b0s = Utils.toBN(Maths.mod(this.b0 * s, this.order));
        const a0b0 = Utils.toBN(Maths.mod(this.a0 * this.b0, this.order));
        const detinv = det.neg();
        const rightSide = this.G.mul(a0s).add(H.mul(b0s)).add(this.Q.mul(a0b0)).add(detinv);
        return leftSide.eq(rightSide);
    }
}

module.exports = CompressedBulletproof;