const cryptoutils = require('bigint-crypto-utils');
var EC = require('elliptic').ec;

const RangeProof = require('./RangeProof');
const PointVector = require('./PointVector');
const Transcript = require('./Transcript');
const Utils = require('./Utils');
const Maths = require('./Maths');
const BigIntVector = require('./BigIntVector');
const ProofUtils = require('./ProofUtils');

const ec = new EC('secp256k1');

class CompressedBulletproof extends RangeProof {

    /**
     * Create an instance of CompressedBulletproof from a hex
     * encoded string (compatible with secp256k1-zkp)
     *
     * secp256k1-zkp Proof format: t, tau_x, mu, a, b, A, S, T_1, T_2, {L_i}, {R_i}
     *               5 scalar + [4 + 2log(n)] ge
     *
     * @return {CompressedBulletproof}
     */
    static fromHexString(str) {
        return new CompressedBulletproof();
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
     * @param a0 {BigInt} The single element in a after compressing the lx vector
     * @param b0 {BigInt} The single element in b after compressing the rx vector
     * @param ind {{ L : Point, R : Point}[]} indeterminante variables
     * @param G {Point} Generator
     * @param order {BigInt} curve order
     */
    constructor(V, A, S, T1, T2, tx, txbf, e, a0, b0, ind,G, order) {
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

        const T1 = this.T.clone();

        // Orthogonal generator B
        const B = Utils.getnewGenFromHashingGen(H);
        // Indeterminate variable w
        const w = Utils.getFiatShamirChallengeTranscript(T1, this.order);
        const wBN = Utils.toBN(w);
        const Q = B.mul(wBN);

        const y = this.y;
        const z = this.z;
        const x = this.x;

        // Now we verify that t() is the right polynomial
        const zsq = Maths.mod(z ** 2n, this.order);
        const y_n = BigIntVector.getVectorToPowerN( y, up, this.order );
        const xsq = Maths.mod(x ** 2n, this.order);

        const leftEq = Utils.getPedersenCommitment(this.tx, this.txbf, this.order, H);
        const rightEq = this.V.mul(Utils.toBN(zsq)).add(this.G.mul(Utils.toBN(ProofUtils.delta(y_n, z, this.order)))).add(this.T1.mul(Utils.toBN(x))).add(this.T2.mul(Utils.toBN(xsq)));
        if( leftEq.eq(rightEq) === false ) { return false; }

        // Now prove validity of lx and rx
        // Now prove validity of lx and rx
        const y_ninv = BigIntVector.getVectorToPowerModInvN( y, up, this.order);
        const vecH = PointVector.getVectorOfPoint(H, up);
        const vecG = PointVector.getVectorOfPoint(this.G, up);
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

        if( P1.eq(P2) === false ) { return false; }

        // Now we prove the < lx, rx > = tx relation using the output of inner product proof
        const P = P1;
        const c = this.tx;
        const cBN = Utils.toBN(c);

        // Get challenges u_k via Fiat Shamir
        for( let i = 0; i < this.ind.length; i++ ) {
            T1.addPoint(this.ind[i].L);
            T1.addPoint(this.ind[i].R);
            this.ind[i].u = Utils.getFiatShamirChallengeTranscript(T1, this.order);
        }

        const leftSide = P.add(Q.mul(cBN));
        const L0 = this.ind[0].L;
        const R0 = this.ind[0].R;
        const u0 = this.ind[0].u;
        const u02 = Maths.mod(u0 ** 2n, this.order);
        const u02BN = Utils.toBN(u02);
        const u02inv = cryptoutils.modInv(u02, this.order);
        const u02invBN = Utils.toBN(u02inv);

        // Calculate G0 and H0
        let Gsum = vecG.clone();
        let Hsum = vecH2.clone();
        let i = 0;
        while (Gsum.length() > 1) {
            const Ghi = new PointVector();
            const Glo = new PointVector();
            const Hhi = new PointVector();
            const Hlo = new PointVector();

            const half = Gsum.length() / 2;
            for( let j = 0; j < Gsum.length(); j++ ) {
                if( j < half ) {
                    Glo.addElem(Gsum.get(j));
                    Hlo.addElem(Hsum.get(j));
                }
                else {
                    Ghi.addElem(Gsum.get(j));
                    Hhi.addElem(Hsum.get(j));
                }
            }

            Gsum = new PointVector();
            Hsum = new PointVector();

            const u = this.ind[i].u;
            const uinv = cryptoutils.modInv(u, this.order);
            const uBN = Utils.toBN(u);
            const uinvBN = Utils.toBN(uinv);

            for( let j = 0; j < Glo.length(); j++ ) {
                Gsum.addElem(Glo.get(j).mul(uinvBN).add(Ghi.get(j).mul(uBN)));
                Hsum.addElem(Hlo.get(j).mul(uBN).add(Hhi.get(j).mul(uinvBN)));
            }
            i++;
        }

        let det = L0.mul(u02BN).add(R0.mul(u02invBN));
        for( let j = 1; j < this.ind.length; j++ ) {
            const Lj = this.ind[j].L;
            const Rj = this.ind[j].R;
            const uj = this.ind[j].u;
            const uj2 = Maths.mod(uj ** 2n, this.order);
            const uj2BN = Utils.toBN(uj2);
            const uj2inv = cryptoutils.modInv(uj2, this.order);
            const uj2invBN = Utils.toBN(uj2inv);
            det = det.add(Lj.mul(uj2BN)).add(Rj.mul(uj2invBN));
        }
        const G0 = Gsum.get(0);
        const H0 = Hsum.get(0);
        const a0BN = Utils.toBN(this.a0);
        const b0BN = Utils.toBN(this.b0);
        const a0b0BN = Utils.toBN(Maths.mod(this.a0 * this.b0, this.order));

        const detinv = det.neg();
        const rightSide = G0.mul(a0BN).add(H0.mul(b0BN)).add(Q.mul(a0b0BN)).add(detinv);
        return leftSide.eq(rightSide);
    }

    equals(e) {
        if ( !(e instanceof CompressedBulletproof) ) {
            return false;
        }
        if( this.ind.length !== e.ind.length ) {
            return false;
        }
        for(let i = 0; i < this.ind.length; i++ ) {
            const t1 = this.ind[i];
            const t2 = e.ind[i];
            if( !t1.L.eq(t2.L) || !t1.R.eq(t2.R) ) {
                return false;
            }
        }
        return this.V.eq(e.V) &&
            this.A.eq(e.A) &&
            this.S.eq(e.S) &&
            this.T1.eq(e.T1) &&
            this.T2.eq(e.T2) &&
            this.tx === e.tx &&
            this.txbf === e.txbf &&
            this.e === e.e &&
            this.a0 === e.a0 &&
            this.b0 === e.b0 &&
            this.G.eq(e.G) &&
            this.order === e.order;
    }

    /**
     * Get CompressedBulletproof from serialzed
     * json string
     *
     * @param str {string}
     * @return {CompressedBulletproof}
     */
    static fromJsonString(str) {
        const obj = JSON.parse(str);

        const intTerms = [];
        for( let intT of obj.ind ) {
            intTerms.push({
                L : ec.keyFromPublic(intT.L, 'hex').pub,
                R : ec.keyFromPublic(intT.R, 'hex').pub,
            });
        }

        return new CompressedBulletproof(
            ec.keyFromPublic(obj.V, 'hex').pub,
            ec.keyFromPublic(obj.A, 'hex').pub,
            ec.keyFromPublic(obj.S, 'hex').pub,
            ec.keyFromPublic(obj.T1, 'hex').pub,
            ec.keyFromPublic(obj.T2, 'hex').pub,
            BigInt(obj.tx),
            BigInt(obj.txbf),
            BigInt(obj.e),
            BigInt(obj.a0),
            BigInt(obj.b0),
            intTerms,
            ec.keyFromPublic(obj.G, 'hex').pub,
            BigInt(obj.order)
        );
    }

    toJson(pp=false) {
        const intTerms = [];
        for( let intT of this.ind ) {
            intTerms.push({
                L : intT.L.encode('hex'),
                R: intT.R.encode('hex')
            });
        }

        const obj = {
            V : this.V.encode('hex'),
            A : this.A.encode('hex'),
            S : this.S.encode('hex'),
            T1 : this.T1.encode('hex'),
            T2 : this.T2.encode('hex'),
            tx : '0x' + this.tx.toString(16),
            txbf : '0x' + this.txbf.toString(16),
            e : '0x' + this.e.toString(16),
            a0 : '0x' + this.a0.toString(16),
            b0 : '0x' + this.b0.toString(16),
            ind : intTerms,
            G : this.G.encode('hex'),
            order : '0x' + this.order.toString(16)
        };

        return pp ? JSON.stringify(obj, null, 2) : JSON.stringify(obj);
    }

    /**
     * Structure as given in secp256k1-zkp
     * t, tau_x, mu, a, b, A, S, T_1, T_2, {L_i}, {R_i}
     *               5 scalar + [4 + 2log(n)] ge
     *
     * t
     *
     */
    toBytes() {
    }
}

module.exports = CompressedBulletproof;