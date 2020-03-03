const EC = require('elliptic').ec;
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const cryptoutils = require('bigint-crypto-utils');

const Factory = require('../src/ProofFactory');
const PointVector = require('../src/PointVector');
const UncompressedBulletproof = require('../src/UncompressedBulletproof');
const CompressedBulletproof = require('../src/CompressedBulletproof');
const Utils = require('../src/Utils');
const Maths = require('../src/Maths');
const BigIntVector = require('../src/BigIntVector');
const constants = require('../src/Constants');
const secp256k1 = constants.secp256k1;

const fixtures_dir = path.join(__dirname, 'fixtures');
const serUncProof = fs.readFileSync( fixtures_dir+ '/uncompressed_proof.json', 'utf-8');
const serComProof = fs.readFileSync( fixtures_dir+ '/compressed_proof.json', 'utf-8');
const tx = JSON.parse(fs.readFileSync(fixtures_dir + "/transaction.tx", 'utf-8'));

const testTimeout = 10000;

const ec = new EC('secp256k1');

describe('Tests for the rangeproof', () => {

    it('Should create an uncompressed Bulletproof which should verify', () => {
        // Blinding Factor (Should be choosed randomly)
        const x = 1897278917812981289198n;
        // value for which we prove its range
        const val = 25n;
        // Lower and upper bound of the range proof
        const low = 0n;
        const upper = 64n;

        // Curve generator
        const G = ec.g;
        // Orthogonal generator
        const H =  constants.gens.H;
        // Pedersen Commitment to our value
        const V = Utils.getPedersenCommitment(val, x, secp256k1.n, H);

        const prf = Factory.computeBulletproof(val, x, V, G, H, low, upper, secp256k1.n);
        assert(prf.verify(V, low, upper));
    }).timeout(testTimeout);

    it('Should create an uncompressed Bulletproof serialize and deserialize correctly', () => {
        const x = 1897278917812981289198n;
        const val = 25n;
        const low = 0n;
        const upper = 64n;

        const G = ec.g;
        const H = constants.gens.H;
        const V = Utils.getPedersenCommitment(val, x, secp256k1.n, H);

        const prf = Factory.computeBulletproof(val, x, V, G, H, low, upper, secp256k1.n);
        const ser = prf.toJson();
        const des = UncompressedBulletproof.fromJsonString(ser);
        des.equals(ser);
    }).timeout(testTimeout);

    it('Should fail to create a proof for a negative number', () => {
        const x = 1897278917812981289198n;
        const val = -25n;
        const low = 0n;
        const upper = 64n;

        const G = ec.g;
        const H = constants.gens.H;
        const V = Utils.getPedersenCommitment(val, x, secp256k1.n, H);

        let error = null;
        try {
            const prf = Factory.computeBulletproof(val, x, V, G, H, low, upper, secp256k1.n);
        } catch (e) {
            error = e;
        }
        assert(error !== null);
    });

    it('Should fail to create a proof for a too big number', () => {
        const x = 1897278917812981289198n;
        const low = 0n;
        const upper = 64n;
        const val = (2n ** upper) + 1n;

        const G = ec.g;
        const H = constants.gens.H;
        const V = Utils.getPedersenCommitment(val, x, secp256k1.n, H);

        let error = null;
        try {
            const prf = Factory.computeBulletproof(val, x, V, G, H, low, upper, secp256k1.n);
        } catch (e) {
            error = e;
        }
        assert(error !== null);
    });

    it('Should compress the UncompressedBulletproof into a compressed one, which should verify', () => {
        const x = 1897278917812981289198n;
        const val = 25n;
        const low = 0n;
        const upper = 64n;

        const G = ec.g;
        const H = constants.gens.H;
        const V = Utils.getPedersenCommitment(val, x, secp256k1.n, H);

        const prf = Factory.computeBulletproof(val, x, V, G, H, low, upper, secp256k1.n);
        const compr = prf.compressProof();
        assert(compr.verify(V, 0n, 64n));
    }).timeout(testTimeout);

    it('Should create a Proof with H as valueGen and G as blindingG (as it is done in Grin)', () => {
        const x = 1897278917812981289198n;
        const val = 25n;
        const low = 0n;
        const upper = 64n;

        const G = ec.g;
        const H = constants.gens.H;
        const V = Utils.getPedersenCommitment(val, x, secp256k1.n, G, H);

        const prf = Factory.computeBulletproof(val, x, V, H, G, low, upper, secp256k1.n);
        const compr = prf.compressProof(G, H, true);
        assert(compr.verify(V, 0n, 64n, G, H));
    }).timeout(testTimeout);

    it('Should fail when verifing a uncompressed proof with invalid ranges', () => {
        const x = 1897278917812981289198n;
        const val = 25n;
        const low = 0n;
        const upper = 64n;

        const G = ec.g;
        const H = constants.gens.H;
        const V = Utils.getPedersenCommitment(val, x, secp256k1.n, H);

        const prf = Factory.computeBulletproof(val, x, V, G, H, low, upper, secp256k1.n);
        assert(!prf.verify(V,0n, 63n));
    }).timeout(testTimeout);

    it('Should fail when verifing a compressed proof with invalid ranges', () => {
        const x = 1897278917812981289198n;
        const val = 25n;
        const low = 0n;
        const upper = 64n;

        const G = ec.g;
        const H = constants.gens.H;
        const V = Utils.getPedersenCommitment(val, x, secp256k1.n, H);

        const prf = Factory.computeBulletproof(val, x, V, G, H, low, upper, secp256k1.n);
        assert(!prf.verify(V,0n, 63n));
    }).timeout(testTimeout);

    it('Should serialize and deserialize a compressed proof correctly', () => {
        const prf = UncompressedBulletproof.fromJsonString(serUncProof);
        const compr = prf.compressProof();
        const ser = compr.toJson();
        const des = CompressedBulletproof.fromJsonString(ser);
        compr.equals(des);
    }).timeout(testTimeout);

    it('Should test point serialization', () => {
        const G = ec.g;
        const H = constants.gens.H;
        const V1 = Utils.getPedersenCommitment(89719823n, 8912738912n, secp256k1.n, H);
        const V2 = Utils.getPedersenCommitment(5452823n, 8912724n, secp256k1.n, H);
        const V3 = Utils.getPedersenCommitment(89231823n, 8912738912n, secp256k1.n, H);
        const V4 = Utils.getPedersenCommitment(89719122n, 112n, secp256k1.n, H);
        const bytes = Utils.encodePoints([V1,V2,V3,V4]);
        const offShouldBe = '0' + parseInt("1110", 2).toString(16);
        assert(bytes.length === 258);
        assert(bytes.substr(0,2) === offShouldBe);
    });

    it('Should test point serialization with more then 8 points', () => {
        const G = ec.g;
        const H = constants.gens.H;
        const V1 = Utils.getPedersenCommitment(89719823n, 8912738912n, secp256k1.n, H);
        const V2 = Utils.getPedersenCommitment(5452823n, 8912724n, secp256k1.n, H);
        const V3 = Utils.getPedersenCommitment(89231823n, 8912738912n, secp256k1.n, H);
        const V4 = Utils.getPedersenCommitment(89719122n, 112n, secp256k1.n, H);
        const V5 = Utils.getPedersenCommitment(89719823n, 8912738912n, secp256k1.n, H);
        const V6 = Utils.getPedersenCommitment(5452823n, 8912724n, secp256k1.n, H);
        const V7 = Utils.getPedersenCommitment(89231823n, 8912738912n, secp256k1.n, H);
        const V8 = Utils.getPedersenCommitment(89719122n, 112n, secp256k1.n, H);
        const V9 = Utils.getPedersenCommitment(5452823n, 8912724n, secp256k1.n, H);
        const bytes = Utils.encodePoints([V1,V2,V3,V4,V5,V6,V7,V8,V9]);
        assert(bytes.length === 64 * 9 + 4);
        assert(bytes.substr(0,4) === 'ee01');
    });

    it('Should serialize a compressed proof correctly to bytes', () => {
        const x = 1897278917812981289198n;
        const val = 25n;
        const low = 0n;
        const upper = 64n;

        const G = ec.g;
        const H = constants.gens.H;
        const V = Utils.getPedersenCommitment(val, x, secp256k1.n, H);

        const prf = Factory.computeBulletproof(val, x, V, G, H, low, upper, secp256k1.n);
        const compr = prf.compressProof();
        const byteString = compr.toBytes();
        assert(byteString.length === 1350);
    }).timeout(testTimeout);

    it('Should serialize compr proof to bytes and deserialize correctly', () => {
        const x = 1897278917812981289198n;
        const val = 25n;
        const low = 0n;
        const upper = 64n;

        const G = ec.g;
        const H = constants.gens.H;
        const V = Utils.getPedersenCommitment(val, x, secp256k1.n, H);

        const prf = Factory.computeBulletproof(val, x, V, G, H, low, upper, secp256k1.n);
        const compr = prf.compressProof();
        const bytes = compr.toBytes();
        const deser = CompressedBulletproof.fromByteString(bytes, 5);
        assert(compr.equals(deser));
    }).timeout(testTimeout);

    it('Should test the basis of the inner product compression', () => {
        // Setup

        const order = secp256k1.n;
        const G = ec.g;
        const H = constants.gens.H;

        const w = 2n;
        const wBN = Utils.toBN(w);
        const Q = G.mul(wBN);

        const Gs = BigIntVector.getVectorWithOnlyScalar(1n, 4, order);
        const Hs = BigIntVector.getVectorWithOnlyScalar(1n, 4, order);

        const a = new BigIntVector(order);
        const b = new BigIntVector(order);
        a.addElem(3n);
        a.addElem(4n);
        a.addElem(0n);
        a.addElem(2n);

        b.addElem(1n);
        b.addElem(3n);
        b.addElem(7n);
        b.addElem(6n);

        // Calculate P star (used later for verification)
        const aBN = Utils.toBN(a.toScalar());
        const bBN = Utils.toBN(b.toScalar());
        const P = G.mul(aBN).add(H.mul(bBN));
        const c = a.multVectorToScalar(b);
        const cBN = Utils.toBN(c);
        const P_star = P.add(Q.mul(cBN));


        // Seperate a, b, G and H into hi and low
        const a_lo = new BigIntVector(order);
        const a_hi = new BigIntVector(order);
        const b_lo = new BigIntVector(order);
        const b_hi = new BigIntVector(order);
        const G_lo = new BigIntVector(order);
        const H_lo = new BigIntVector(order);
        const G_hi = new BigIntVector(order);
        const H_hi = new BigIntVector(order);

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
        const G_sum = new BigIntVector(order);
        const H_sum = new BigIntVector(order);

        const a_lo_G_hi = Utils.toBN(a_lo.multVectorToScalar(G_hi));
        const b_hi_H_lo = Utils.toBN(b_hi.multVectorToScalar(H_lo));
        const a_lo_b_hi = Utils.toBN(a_lo.multVectorToScalar(b_hi));
        const a_hi_G_lo = Utils.toBN(a_hi.multVectorToScalar(G_lo));
        const b_lo_H_hi = Utils.toBN(b_lo.multVectorToScalar(H_hi));
        const a_hi_b_lo = Utils.toBN(a_hi.multVectorToScalar(b_lo));

        const Lk = G.mul(a_lo_G_hi).add(H.mul(b_hi_H_lo)).add(Q.mul(a_lo_b_hi));
        const Rk = G.mul(a_hi_G_lo).add(H.mul(b_lo_H_hi)).add(Q.mul(a_hi_b_lo));

        const uk = 2n;
        const ukinv = cryptoutils.modInv(uk, order);

        assert(Maths.mod(uk * ukinv, order) === 1n);
        assert(G.mul(Utils.toBN(uk * ukinv)).eq(G));

        for(let i = 0; i < a_lo.length(); i++ ) {
            a_sum.addElem(a_lo.get(i) * uk + ukinv * a_hi.get(i));
            b_sum.addElem(b_lo.get(i) * ukinv + uk * b_hi.get(i));
            G_sum.addElem( G_lo.get(i) * ukinv + uk * G_hi.get(i));
            H_sum.addElem(H_lo.get(i) * uk + ukinv * H_hi.get(i));
        }

        // Calculate the new P with the new compressed vectors
        const a_sum_G_sum = Utils.toBN(a_sum.multVectorToScalar(G_sum));
        const b_sum_H_sum = Utils.toBN(b_sum.multVectorToScalar(H_sum));
        const a_sum_b_sum = Utils.toBN(a_sum.multVectorToScalar(b_sum));
        const Pk = G.mul(a_sum_G_sum).add(H.mul(b_sum_H_sum)).add(Q.mul(a_sum_b_sum));

        // The new P should be P* + Lk * uk² + Rk * uk-²
        const uk2 = Maths.mod(uk ** 2n, order);
        const uk2inv = cryptoutils.modInv(uk2, order);

        assert(Maths.mod(uk2 * uk2inv, order) === 1n);
        assert(G.mul(Utils.toBN(uk2 * uk2inv)).eq(G));

        const uk2BN = Utils.toBN(uk2);
        const uk2invBN = Utils.toBN(uk2inv);
        const Lkuk2 = Lk.mul(uk2BN);
        const Rkuk2inv = Rk.mul(uk2invBN);

        const Pk_comp = P_star.add(Lkuk2).add(Rkuk2inv);
        assert(Pk_comp.eq(Pk));

        const det = Lkuk2.add(Rkuk2inv);
        assert(P_star.eq(Pk.add(det.neg())));
    });
});