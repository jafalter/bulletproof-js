const fs = require('fs');
const path = require('path');
const EC = require('elliptic').ec;
const assert = require('assert');
const BigIntBuffer = require('bigint-buffer');

const CompressedBulletproof = require('../src/CompressedBulletproof');
const constants = require('../src/Constants');
const Utils = require('../src/Utils');
const Maths = require('../src/Maths');

const ec = new EC('secp256k1');

const fixtures_dir = path.join(__dirname, 'fixtures');
const tx = JSON.parse(fs.readFileSync(fixtures_dir + '/transaction.tx'), 'utf-8');
const serUncProof = fs.readFileSync( fixtures_dir+ '/uncompressed_proof.json', 'utf-8');

describe('Integration Tests with other bulletproof libraries', () => {

    it('Should be able to verify a proof created with secp256k1-zkp', () => {
        const hexproof = tx.tx.body.outputs[0].proof;
        const prf = CompressedBulletproof.fromByteString(hexproof, 5);

        const V = ec.keyFromPublic("02eb754605d4c5453788549d01583c79ebfcb3a5c0a48d5bdb6b52d3bc9eb8e0e0", 'hex').pub;
        assert(prf.verify(V, 0n, 64n, constants.gens.G, constants.gens.H));
    });

    it('Should create the pedersen commitment as libsec for same input', () => {
        const value = 1234n;
        const bfstr = "   i am not a blinding factor   ";
        const bfbytes = Buffer.from(bfstr);
        const bf = BigIntBuffer.toBigIntBE(bfbytes);
        //const bf = BigInt('0x2020206920616d206e6f74206120626c696e64696e6720666163746f72202020');

        const pc = Utils.getPedersenCommitment(value, bf, constants.secp256k1.n, constants.gens.G, constants.gens.H);
        const V = ec.keyFromPublic("0264c55f631b81fa2a968cbbafba5451105296fa8cee86206b3afe51d28b11e52c", 'hex').pub;
        assert(pc.eq(V));
    });
});