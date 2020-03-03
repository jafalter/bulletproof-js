const cryptoutils = require('bigint-crypto-utils');

var EC = require('elliptic').ec;

const constants = require('./Constants');
const RangeProof = require('./RangeProof');
const PointVector = require('./PointVector');
const Transcript = require('./Transcript');
const Utils = require('./Utils');
const Maths = require('./Maths');
const BigIntVector = require('./BigIntVector');
const ProofUtils = require('./ProofUtils');

const ec = new EC('secp256k1');
const secp256k1 = constants.secp256k1;

class CompressedBulletproof extends RangeProof {

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
            ec.keyFromPublic(obj.A, 'hex').pub,
            ec.keyFromPublic(obj.S, 'hex').pub,
            ec.keyFromPublic(obj.T1, 'hex').pub,
            ec.keyFromPublic(obj.T2, 'hex').pub,
            BigInt(obj.tx),
            BigInt(obj.txbf),
            BigInt(obj.e),
            BigInt(obj.a0),
            BigInt(obj.b0),
            BigInt(obj.a1),
            BigInt(obj.b1),
            intTerms,
            BigInt(obj.order)
        );
    }

    /**
     * Create an instance of CompressedBulletproof from a hex
     * encoded string (compatible with secp256k1-zkp)
     *
     * @param str {string}
     * @param nmbrRounds {int} the number of inner product rounds
     *
     * @return {CompressedBulletproof}
     */
    static fromByteString(str, nmbrRounds) {
        // First we parse two 32 byte scalars
        const tauhex = str.substr(0,64);
        const tau = BigInt('0x' + tauhex);
        const muhex = str.substr(64, 64);
        const mu = BigInt('0x' + muhex);

        // Now we parse the points A, S, T1 and T2 with one byte offset
        const offset = str.substr(128, 2);
        let binoffset = parseInt(offset, 16).toString(2);
        binoffset = binoffset.padStart(8, '0');

        const Ahex = str.substr(128 + 2, 64);
        const Aflag = binoffset.charAt(7) === '1' ? '03' : '02';
        const Acompr = Aflag + Ahex;
        const A = ec.keyFromPublic(Acompr, 'hex').pub;

        const Shex = str.substr(128 + 2 + 64, 64);
        const Sflag = binoffset.charAt(6) === '1' ? '03' : '02';
        const Scompr = Sflag + Shex;
        const S = ec.keyFromPublic(Scompr, 'hex').pub;

        const T1hex = str.substr(128 + 2 + 64 * 2, 64);
        const T1flag = binoffset.charAt(5) === '1' ? '03' : '02';
        const T1compr = T1flag + T1hex;
        const T1 = ec.keyFromPublic(T1compr, 'hex').pub;

        const T2hex = str.substr(128 + 2 + 64 * 3, 64);
        const T2flag = binoffset.charAt(4) === '1' ? '03' : '02';
        const T2compr = T2flag + T2hex;
        const T2 = ec.keyFromPublic(T2compr, 'hex').pub;

        // Now parse the dot product
        const dothex = str.substr(128 + 2 + 64*4, 64);
        const dot = BigInt('0x' + dothex);

        // Now parse the end vectors
        const a0hex = str.substr(128 + 2 + 64*4 + 64, 64);
        const b0hex = str.substr(128 + 2 + 64*4 + 64 + 64, 64);
        const a1hex = str.substr(128 + 2 + 64*4 + 64 + 64*2, 64);
        const b1hex = str.substr(128 + 2 + 64*4 + 64 + 64*3, 64);
        const a0 = BigInt('0x' + a0hex);
        const b0 = BigInt('0x' + b0hex);
        const a1 = BigInt('0x' + a1hex);
        const b1 = BigInt('0x' + b1hex);

        // Now we parse the commitments of the inner product proof
        const offsetbytes = Math.ceil((nmbrRounds * 2) / 8);
        const offsets = [];
        let startIndex = 128 + 2 + 64*4 + 64 + 64*4;
        for( let i = 0; i < offsetbytes * 2; i = i +2 ) {
            const offsethex = str.substr(startIndex + i, 2);
            const offsetbin = parseInt(offsethex, 16).toString(2);
            offsets.push(offsetbin.padStart(8, '0'));
        }
        let oindex = 0;
        let counter = 0;
        const terms = [];
        startIndex += offsetbytes * 2;
        for( let j = 0; j < nmbrRounds; j++ ) {
            if( counter >= 8 ) {
                oindex++;
                counter = 0;
            }
            const Lihex = str.substr(startIndex, 64);
            const Liflag = offsets[oindex].charAt(7 - counter) === '1' ? '03' : '02';
            const Licompr = Liflag + Lihex;
            const Li = ec.keyFromPublic(Licompr, 'hex').pub;
            counter++;
            const Rihex = str.substr(startIndex + 64, 64);
            const Riflag = offsets[oindex].charAt(7 - counter) === '1' ? '03' : '02';
            const Ricompr = Riflag + Rihex;
            const Ri = ec.keyFromPublic(Ricompr, 'hex').pub;
            startIndex += 64 * 2;
            counter++;
            terms.push( {
                L : Li,
                R : Ri
            })
        }

        return new CompressedBulletproof(A, S, T1, T2, tau, mu, dot, a0, b0, a1, b1, terms, secp256k1.n);
    }

    /**
     *
     * @param A {Point} Vector pedersen commitment committing to a_L and a_R the amount split into a vector which is the amount in binary and a vector containing exponents of 2
     * @param S {Point} Vector pedersen commitment committing to s_L and s_R the blinding vectors
     * @param T1 {Point} Pedersen commitment to tx
     * @param T2 {Point} Pedersen commitment to tx²
     * @param tx {BigInt} Polynomial t() evaluated with challenge x
     * @param txbf {BigInt} Opening blinding factor for t() to verify the correctness of t(x)
     * @param e {BigInt} Opening e of the combined blinding factors using in A and S to verify correctness of l(x) and r(x)
     * @param a0 {BigInt} The first element of the end vector a
     * @param b0 {BigInt} The first element of the end vector b
     * @param a1 {BigInt} The second element of the end vector a
     * @param b1 {BigInt} The second element of the end vector b
     * @param ind {{ L : Point, R : Point}[]} indeterminante variables
     * @param order {BigInt} curve order
     */
    constructor(A, S, T1, T2, tx, txbf, e, a0, b0, a1, b1, ind, order) {
        super();
        this.A = A;
        this.S = S;
        this.T1 = T1;
        this.T2 = T2;
        this.tx = tx;
        this.txbf = txbf;
        this.e = e;
        this.a = new BigIntVector(order);
        this.b = new BigIntVector(order);
        this.a.addElem(a0);
        this.a.addElem(a1);
        this.b.addElem(b0);
        this.b.addElem(b1);
        this.ind = ind;
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

    verify(V, low, up, blindGen=constants.gens.H, valueGen=constants.gens.G) {
        if(low !== 0n ) {
            throw new Error("Currenlty only range proofs from 0 to n are allowed");
        }

        const T1 = this.T.clone();

        // Indeterminate variable w
        const w = Utils.getFiatShamirChallengeTranscript(T1, this.order);
        const wBN = Utils.toBN(w);
        const Q = valueGen.mul(wBN);

        const y = this.y;
        const z = this.z;
        const x = this.x;

        // Now we verify that t() is the right polynomial
        const zsq = Maths.mod(z ** 2n, this.order);
        const y_n = BigIntVector.getVectorToPowerN( y, up, this.order );
        const xsq = Maths.mod(x ** 2n, this.order);

        const leftEq = Utils.getPedersenCommitment(this.tx, this.txbf, this.order, blindGen, valueGen);
        const rightEq = V.mul(Utils.toBN(zsq)).add(valueGen.mul(Utils.toBN(ProofUtils.delta(y_n, z, this.order)))).add(this.T1.mul(Utils.toBN(x))).add(this.T2.mul(Utils.toBN(xsq)));
        if( leftEq.eq(rightEq) === false ) { return false; }

        // Now prove validity of lx and rx
        // Now prove validity of lx and rx
        const y_ninv = BigIntVector.getVectorToPowerModInvN( y, up, this.order);
        const vecG = PointVector.getVectorShallueVanDeWoestijne('G', up);
        const vecH = PointVector.getVectorShallueVanDeWoestijne("H", up);
        const vecH2 = vecH.multWithBigIntVector(y_ninv);

        const E = blindGen.mul(Utils.toBN(this.e));
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
        while (Gsum.length() > constants.essentials.END_VECTOR_LENGTH) {
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
        const a0b0BN = Utils.toBN(Maths.mod(this.a.multVector(this.b).toScalar(), this.order));

        const detinv = det.neg();
        const rightSide = Gsum.multWithBigIntVector(this.a).toSinglePoint().add(Hsum.multWithBigIntVector(this.b).toSinglePoint()).add(Q.mul(a0b0BN)).add(detinv);
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
        return this.A.eq(e.A) &&
            this.S.eq(e.S) &&
            this.T1.eq(e.T1) &&
            this.T2.eq(e.T2) &&
            this.tx === e.tx &&
            this.txbf === e.txbf &&
            this.e === e.e &&
            this.a0 === e.a0 &&
            this.b0 === e.b0 &&
            this.order === e.order;
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
            A : this.A.encode('hex'),
            S : this.S.encode('hex'),
            T1 : this.T1.encode('hex'),
            T2 : this.T2.encode('hex'),
            tx : '0x' + this.tx.toString(16),
            txbf : '0x' + this.txbf.toString(16),
            e : '0x' + this.e.toString(16),
            a0 : '0x' + this.a.get(0).toString(16),
            b0 : '0x' + this.b.get(0).toString(16),
            a1 : '0x' + this.a.get(1).toString(16),
            b1 : '0x' + this.b.get(1).toString(16),
            ind : intTerms,
            order : '0x' + this.order.toString(16)
        };

        return pp ? JSON.stringify(obj, null, 2) : JSON.stringify(obj);
    }

    toBytes() {
        // First we have tx and tx_bf (negate?)
        let byteString = "";
        byteString += Utils.encodeBigIntScalar(this.tx);
        byteString += Utils.encodeBigIntScalar(this.txbf);
        // Now we encode commitments A,S,T1,T2
        byteString += Utils.encodePoints([this.A, this.S, this.T1, this.T2]);
        // e scalar
        byteString += Utils.encodeBigIntScalar(this.e);
        // End vector elements
        byteString += Utils.encodeBigIntScalar(this.a.get(0));
        byteString += Utils.encodeBigIntScalar(this.b.get(0));
        byteString += Utils.encodeBigIntScalar(this.a.get(1));
        byteString += Utils.encodeBigIntScalar(this.b.get(1));
        // Li, Ri
        const points = [];
        for( let elems of this.ind ) {
            points.push(elems.L);
            points.push(elems.R);
        }
        byteString += Utils.encodePoints(points);
        return byteString
    }
}

module.exports = CompressedBulletproof;