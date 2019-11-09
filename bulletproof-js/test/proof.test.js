const EC = require('elliptic').ec;
const assert = require('assert');

const Factory = require('../src/ProofFactory');
const Utils = require('../src/Utils');
const secp256k1 = require('../src/Constants').secp256k1;

const ec = new EC('secp256k1');

describe('Tests for the rangeproof', () => {

    it('Test additive homomorphic quality of pedersen commitments', () => {
        const v1 = 9018549012398012093n;
        const x1 = 89124798129839871987249812n;
        const c1 = Utils.getPedersenCommitment(x1, v1);

        const v2 = 90172589102478901273n;
        const x2 = 509867892649082376409171892n;
        const c2 = Utils.getPedersenCommitment(x2, v2);

        const c3 = Utils.getPedersenCommitment(x1 + x2, v1 + v2);
        assert(c1.add(c2).eq(c3));
    });

    it('Test mult properties of pedersen commitments', () => {
        const sc = 8091561783246108246301n;

        const t1 = 78689278935479823809745892304n;
        const r = 89124798129839871987249812n;
        const T1 = Utils.getPedersenCommitment(r, t1);

        const T2 = Utils.getPedersenCommitment(r * sc, t1 * sc);

        assert(T1.mul(Utils.toBN(sc)).eq(T2));
    });

    it('Should create a range proof', () => {
        const x = 1897278917812981289198n;
        const val = 25n;
        const low = 0n;
        const upper = 2n ** 64n;

        const comm = ec.keyFromPrivate(x + val).getPublic();
        const G = ec.g;
        const H = Utils.getHFromHashingG(G);

        const prf = Factory.computeBulletproof(val, x, comm, G, H, low, upper, secp256k1.p);
    });
});