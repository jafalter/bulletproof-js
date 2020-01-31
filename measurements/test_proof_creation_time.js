const EC = require('elliptic').ec;
const { PerformanceObserver, performance } = require('perf_hooks');

const Utils = require('../src/Utils');
const Factory = require('../src/ProofFactory');

const secp256k1 = require('../src/Constants').secp256k1;

const ec = new EC('secp256k1');

const x = 1897278917812981289198n;
const val = 25n;
const low = 0n;
const upper = 2n ** 64n;

const G = ec.g;
const H = Utils.getnewGenFromHashingGen(G);
const V = Utils.getPedersenCommitment(val, x, secp256k1.n, H);

const t0 = performance.now();
const prf = Factory.computeBulletproof(val, x, V, G, H, low, upper, secp256k1.n, false);
const compr = prf.compressProof(false);
const t1 = performance.now();
console.log("Creation of compressed proof took " + (t1 - t0) + " milliseconds");