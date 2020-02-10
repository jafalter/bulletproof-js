const EC = require('elliptic').ec;
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const cryptoutils = require('bigint-crypto-utils');

const Utils = require('../src/Utils');
const Maths = require('../src/Maths');
const BigIntVector = require('../src/BigIntVector');
const secp256k1 = require('../src/Constants').secp256k1;
const PointVector = require('../src/PointVector');

const fixtures_dir = path.join(__dirname, 'fixtures');

const ec = new EC('secp256k1');

describe('Tests for some of the crypto stuff', () => {

    it('Test for transmutated generator', () => {
        const G = ec.g;
        const vec = new BigIntVector(secp256k1.n);
        vec.addElem(2n);
        vec.addElem(3n);
        const vecInv = new BigIntVector(secp256k1.n);
        vecInv.addElem(cryptoutils.modInv(2n, secp256k1.n));
        vecInv.addElem(cryptoutils.modInv(3n, secp256k1.n));
        const vecG = PointVector.getVectorOfPoint(G, 2);

        const vecG2 = vecG.multWithBigIntVector(vecInv);
        const vecG3 = vecG2.multWithBigIntVector(vec);
        assert(G.eq(vecG3.get(0)));
        assert(G.eq(vecG3.get(1)));
    });

    it('sha256 of G should be the same H as used in libsec', () => {
        const H = Utils.getnewGenFromHashingGen(ec.g);
        assert(H.encode('hex') === '0450929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac031d3c6863973926e049e637cb1b5f40a36dac28af1766968c30c2313f3a38904');
    });

    it('Test for substraction on points', () => {
        const G = ec.g;
        const P3 = G.mul(Utils.toBN(3n));
        const P2 = G.mul(Utils.toBN(2n));
        const P5 = G.mul(Utils.toBN(5n));
        const P = P5.add(P2.neg());
        assert(P.eq(P3));
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
});