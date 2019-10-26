const Factory = require('../src/Factory');
const Utils = require('../src/Utils');
const secp256k1 = require('../src/Constants').secp256k1;

const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

describe('Tests for the rangeproof', () => {

    it('Should create a range proof', () => {
        const x = 1897278917812981289198n;
        const val = 25n;
        const low = 0n;
        const upper = 2n ** 64n;

        const comm = ec.keyFromPrivate(x + val).getPublic();
        const G = ec.g;
        const hashedG = Utils.sha256pointtohex(G);
        const H = Utils.scalarToPoint(hashedG);

        const prf = Factory.computeBulletproof(val, x, comm, G, H, low, upper, secp256k1.p);
    });
});