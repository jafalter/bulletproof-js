const EC = require('elliptic').ec;
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const cryptoutils = require('bigint-crypto-utils');

const Factory = require('../src/ProofFactory');
const UncompressedBulletproof = require('../src/UncompressedBulletproof');
const Utils = require('../src/Utils');
const Maths = require('../src/Maths');
const BigIntVector = require('../src/BigIntVector');
const PointVector = require('../src/PointVector');
const secp256k1 = require('../src/Constants').secp256k1;

const ec = new EC('secp256k1');

describe('Tests for the rangeproof', () => {

    it('Test for exponent vectors', () => {
        const y = 897109873401987290187239812793n;
        const n = secp256k1.n;
        const e = 64n;
        const y_n = BigIntVector.getVectorToPowerN(y, e, n);
        const y_negn = BigIntVector.getVectorToPowerN(-y, e, n);
        const P = ec.g.mul(Utils.toBN(98712398123n));
        const Pt1 = y_n.multVectorWithPointToPoint(P);
        const Pt2 = y_negn.multVectorWithPointToPoint(Pt1);
        assert(Pt2.eq(P));
    });

    it('Test additive homomorphic quality of pedersen commitments', () => {
        const v1 = 9018549012398012093n;
        const x1 = 89124798129839871987249812n;
        const c1 = Utils.getPedersenCommitment(v1, x1);

        const v2 = 90172589102478901273n;
        const x2 = 509867892649082376409171892n;
        const c2 = Utils.getPedersenCommitment(v2, x2);

        const c3 = Utils.getPedersenCommitment(v1 + v2, x1 + x2,);
        assert(c1.add(c2).eq(c3));
    });

    it('Test modulos Function', () => {
       const a = 1512312512n;
       const b = -1512312512n;
       const n = 10n;
       assert(Maths.mod(a,n) === 2n);
       assert(Maths.mod(b,n) === 8n);
    });

    it('Test mult properties of pedersen commitments', () => {
        const sc = 8091561783246108246301n;

        const t1 = 78689278935479823809745892304n;
        const r = 89124798129839871987249812n;
        const T1 = Utils.getPedersenCommitment(t1, r);

        const T2 = Utils.getPedersenCommitment(t1 * sc, r * sc);

        assert(T1.mul(Utils.toBN(sc)).eq(T2));
    });

    it('Test mult property of commitments', () => {
        const n = secp256k1.n;
        const T1 = ec.g.mul(Utils.toBN(n + 5n));
        const T2 = ec.g.mul(Utils.toBN(Maths.mod(n + 5n, n)));
        const T3 = ec.g.mul(Utils.toBN(5n));
        assert(T1.eq(T2));
        assert(T2.eq(T3));
    });

    it('Test mult properties of pedersen with negative num 1', () => {
        const n = secp256k1.n;
        const t1 = Maths.mod(-4424687248756834944667496427199067151987779098219282389160949909025658367322n, n);
        const x = Maths.mod(38659561957554344830346811456777626115164894886626759056962864666140509109118n, n);
        const xBN  = Utils.toBN(x);
        const r = Maths.mod(206032474729127474062261152183333172264689698899312462254655119185748812599n, n);

        const T1 = Utils.getPedersenCommitment(t1, r);
        const T1cmp = Utils.getPedersenCommitment(t1 * x, r * x);

        assert(T1.mul(xBN).eq(T1cmp));
    });

    it('Test mult properties of pedersen with negative num with order', () => {
        const n = secp256k1.n;
        const t1 = Maths.mod(-4424687248756834944667496427199067151987779098219282389160949909025658367322n, n);
        const x = Maths.mod(38659561957554344830346811456777626115164894886626759056962864666140509109118n, n);
        const xBN  = Utils.toBN(x);
        const r = Maths.mod(206032474729127474062261152183333172264689698899312462254655119185748812599n, n);

        const T1 = Utils.getPedersenCommitment(t1, r);
        const T1cmp = Utils.getPedersenCommitment(Maths.mod(t1 * x, n), Maths.mod(r * x, n));

        assert(T1.mul(xBN).eq(T1cmp));
    });

    it('Should create an uncompressed Bulletproof which should verify', () => {
        const x = 1897278917812981289198n;
        const val = 25n;
        const low = 0n;
        const upper = 2n ** 64n;

        const G = ec.g;
        const H = Utils.getnewGenFromHashingGen(G);
        const V = Utils.getPedersenCommitment(val, x, secp256k1.n, H);

        const prf = Factory.computeBulletproof(val, x, V, G, H, low, upper, secp256k1.n);
        assert(prf.verify(0n, 64n));
    }).timeout(5000);

    it('Should create an uncompressed Bulletproof serialize and deserialize correctly', () => {
        const x = 1897278917812981289198n;
        const val = 25n;
        const low = 0n;
        const upper = 2n ** 64n;

        const G = ec.g;
        const H = Utils.getnewGenFromHashingGen(G);
        const V = Utils.getPedersenCommitment(val, x, secp256k1.n, H);

        const prf = Factory.computeBulletproof(val, x, V, G, H, low, upper, secp256k1.n);
        const ser = prf.toJson();
        const des = UncompressedBulletproof.fromJsonString(ser);
        des.equals(ser);
    }).timeout(5000);

    it('Should compress the UncompressedBulletproof into a compressed one, which should verify', () => {
        const serProof = fs.readFileSync(path.join(__dirname, 'fixtures') + '/uncompressed_proof.json', 'utf-8');
        const prf = UncompressedBulletproof.fromJsonString(serProof);
        const compr = prf.compressProof(true);
        assert(compr.verify(0n, 64n));
    }).timeout(5000);

    it('Should test the basis of the inner product compression', () => {
        // Setup

        const order = secp256k1.n;
        const G = ec.g;
        const H = Utils.getnewGenFromHashingGen(G);
        const B = Utils.getnewGenFromHashingGen(H);

        const w = 2n;
        const Q = B.mul(Utils.toBN(w));

        const Gs = PointVector.getVectorFullOfPoint(G, 4);
        const Hs = PointVector.getVectorFullOfPoint(H, 4);

        const a = new BigIntVector(order);
        const b = new BigIntVector(order);
        a.addElem(7n);
        a.addElem(8n);
        a.addElem(2n);
        a.addElem(1n);

        b.addElem(1n);
        b.addElem(8n);
        b.addElem(3n);
        b.addElem(5n);

        // Calculate P star (used later for verification)
        const P = a.multVectorWithPointToPoint(G).add(b.multVectorWithPointToPoint(H));
        const c = a.multVectorToScalar(b);
        const P_star = P.add(Q.mul(Utils.toBN(c)));


        // Seperate a, b, G and H into hi and low
        const a_lo = new BigIntVector(order);
        const a_hi = new BigIntVector(order);
        const b_lo = new BigIntVector(order);
        const b_hi = new BigIntVector(order);
        const G_lo = new PointVector();
        const H_lo = new PointVector();
        const G_hi = new PointVector();
        const H_hi = new PointVector();

        const half = a.length() / 2;
        for( let i = 0; i < a.length(); i++ ) {
            if( i < half ) {
                a_lo.addElem(a.get(i));
                b_lo.addElem(b.get(i));
                G_lo.addElem(Gs.get(i));
                H_lo.addElem(Hs.get(i));
            }
            else {
                a_hi.addElem(a.get(i));
                b_hi.addElem(b.get(i));
                G_hi.addElem(Gs.get(i));
                H_hi.addElem(Hs.get(i));
            }
        }

        assert(a_lo.length() === 2);
        assert(a_hi.length() === 2);
        assert(b_lo.length() === 2);
        assert(b_hi.length() === 2);
        assert(G_lo.length() === 2);
        assert(G_hi.length() === 2);
        assert(H_lo.length() === 2);
        assert(H_hi.length() === 2);

        // Do one round of the protocol
        const a_sum = new BigIntVector(order);
        const b_sum = new BigIntVector(order);
        const G_sum = new PointVector();
        const H_sum = new PointVector();

        const Lk = G_hi.multWithBigIntVectorToPoint(a_lo).add(H_lo.multWithBigIntVectorToPoint(b_hi)).add(Q.mul(Utils.toBN(a_lo.multVectorToScalar(b_hi))));
        const Rk = G_lo.multWithBigIntVectorToPoint(a_hi).add(H_hi.multWithBigIntVectorToPoint(b_lo)).add(Q.mul(Utils.toBN(a_hi.multVectorToScalar(b_lo))));

        const uk = 3n;
        const ukinv = cryptoutils.modInv(uk, order);

        for(let i = 0; i < a_lo.length(); i++ ) {
            a_sum.addElem(a_lo.get(i) * uk + ukinv * a_hi.get(i));
            b_sum.addElem(b_lo.get(i) * ukinv + uk * b_hi.get(i));
            G_sum.addElem(G_lo.get(i).mul(Utils.toBN(ukinv)).add(G_hi.get(i).mul(Utils.toBN(uk))));
            H_sum.addElem(H_lo.get(i).mul(Utils.toBN(uk)).add(H_hi.get(i).mul(Utils.toBN(ukinv))));
        }

        // Calculate the new P with the new compressed vectors
        const Pk = G_sum.multWithBigIntVectorToPoint(a_sum).add(H_sum.multWithBigIntVectorToPoint(b_sum)).add(Q.mul( Utils.toBN(a_sum.multVectorToScalar(b_sum)) ));

        // The new P should be P* + Lk * uk² + Rk * uk-²
        const uk2 = Maths.mod(3n ** 2n, order);
        const uk2inv = cryptoutils.modInv(uk2, order);

        const Pk_comp = P_star.add(Lk.mul(Utils.toBN(uk2))).add(Rk.mul(Utils.toBN(uk2inv)));
        assert(Pk_comp.eq(Pk));

        //const det = Lk.mul(Utils.toBN(uk2)).add(Rk.mul(Utils.toBN(uk2inv)));
        //assert(P_star.eq(Pk.add(det.neg())));
    });
});