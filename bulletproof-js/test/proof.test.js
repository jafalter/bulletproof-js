const EC = require('elliptic').ec;
const assert = require('assert');

const Factory = require('../src/ProofFactory');
const Utils = require('../src/Utils');
const Maths = require('../src/Maths');
const Vector = require('../src/Vector');
const secp256k1 = require('../src/Constants').secp256k1;

const ec = new EC('secp256k1');

describe('Tests for the rangeproof', () => {

    it('Test for exponent vectors', () => {
        const y = 897109873401987290187239812793n;
        const n = secp256k1.n;
        const e = 64n;
        const y_n = Vector.getVectorToPowerE(y, e, n);
        const y_negn = Vector.getVectorToPowerE(-y, e, n);
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

    it('Should create a range proof', () => {
        const x = 1897278917812981289198n;
        const val = 25n;
        const low = 0n;
        const upper = 2n ** 64n;

        const G = ec.g;
        const H = Utils.getHFromHashingG(G);
        const V = Utils.getPedersenCommitment(val, x, secp256k1.n, H);

        const prf = Factory.computeBulletproof(val, x, V, G, H, low, upper, secp256k1.n);
    });
});