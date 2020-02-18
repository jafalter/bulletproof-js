const EC = require('elliptic').ec;
const { PerformanceObserver, performance } = require('perf_hooks');

const Utils = require('../src/Utils');
const Factory = require('../src/ProofFactory');

const constants = require('../src/Constants');
const secp256k1 = constants.secp256k1;

const ec = new EC('secp256k1');

const x = 1897278917812981289198n;
const val = 25n;
const low = 0n;
const upper = 64n;

const G = ec.g;
const H = constants.gens.H;
const V = Utils.getPedersenCommitment(val, x, secp256k1.n, H);

const prf = Factory.computeBulletproof(val, x, V, G, H, low, upper, secp256k1.n, false);
const compr = prf.compressProof(false);
const t0 = performance.now();
compr.verify(0n, 64n);
const t1 = performance.now();
console.log("Verification of compressed proof took " + (t1 - t0) + " milliseconds");