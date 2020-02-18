const fs = require('fs');
const path = require('path');

const CompressedBulletproof = require('../src/CompressedBulletproof');

const fixtures_dir = path.join(__dirname, 'fixtures');
const tx = JSON.parse(fs.readFileSync(fixtures_dir + '/transaction.tx'), 'utf-8');
const serUncProof = fs.readFileSync( fixtures_dir+ '/uncompressed_proof.json', 'utf-8');

describe('Integration Tests with other bulletproof libraries', () => {

    /*
    it('Should be able to verify a proof created with secp256k1-zkp', () => {
        const hexproof = tx.tx.body.outputs[0].proof;
        const prf = CompressedBulletproof.fromHexString(hexproof);
        assert(prf.verify(0n, 64n));
    });

     */
});