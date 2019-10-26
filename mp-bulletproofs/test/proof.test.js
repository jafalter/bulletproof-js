const Factory = require('../src/Factory');

describe('Tests for the rangeproof', () => {

    it('Should create a range proof', () => {
        const x = 1897278917812981289198n;
        const val = 25n;
        const low = 0n;
        const upper = 2n ** 64n;
        const p = Factory.computeBulletproof(val, x, null, null, null, low, upper);
    });
});