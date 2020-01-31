# bulletproof-js

[![Coverage Status](https://coveralls.io/repos/github/jafalter/bulletproof-js/badge.svg?branch=jafalter-patch-1)](https://coveralls.io/github/jafalter/bulletproof-js?branch=jafalter-patch-1)

This library is a pure Javascript implementation of the [Bulletproof range proof](https://eprint.iacr.org/2017/1066.pdf) protocol on the 
secp256k1 curve using the [elliptic](https://www.npmjs.com/package/elliptic) libraray.
It was initially implemented as a university project at TU Vienna and has been made public after the project was finished.
Please note that this library is not battle-tested yet, and you should only use it after careful review.
For randomness [bigint-crypto-utils](bigint-crypto-utils) is used. You should be able to use this
library in any [Webview or Browser supporting BigInts](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#Browser_compatibility) and Node.js (>=10.4.0) 

Contribution and code reviews are always welcome.  

Current open points:
* Getting the proofs compatible with other
 implementations ([secp2561-zkp](https://github.com/mimblewimble/secp256k1-zkp/blob/master/libsecp256k1.pc.in))
* Implementing optimization on verifier side
* Support for other curves
* Adding capabilities of creating proofs for arbitraray ranges. (Currently only 0 - n-1 supported)
* Mulitparty proof computation

If you are looking for a highly efficient implementation, this library might not be for you. 
Implementations in other languages such as Rust, Java or C will always be much more efficient than a Javascript implementation. 
Also, I focused on readable code over performance. For instance, Javascript BigInt is used for all computations, 
slowing down the code, but also making it easier to understand and write. Furthermore there are some opitmizations on the
verifier side which I couldn't get to work yet, which is why verification is much slower compared to other
libraries then proof creation.

Here are the measurement and comparisons. I took measurements for bulletproof-js with an Intel Core i5-4690 3.5GHz on NodeJS 12. You can do them yourself executing the scripts
in the measurements folder. Comparisons are taken from [Dalek Rust Bulletproof implementation](https://doc-internal.dalek.rs/bulletproofs/notes/range_proof/index.html)

|                | proof creation (μs) | rel     | verification (μs) | rel     | curve        |
|----------------|---------------------|---------|-------------------|---------|--------------|
| dalek (avx2)   | 7300                | 1.00x   | 1040              | 1.00x   | ristretto255 |
| dalek (u64)    | 11300               | 1.54x   | 1490              | 1.43x   | ristretto255 |
| libsecp+endo   | 14300               | 1.96x   | 1900              | 1.83x   | secp256k1    |
| libsecp-endo   | 16800               | 2.30x   | 2080              | 2.00x   | secp256k1    |
| Monero         | 53300               | 7.30x   | 4810              | 4.63x   | ed25519      |
| bulletproof-js | 1195240             | 163.73x | 732170            | 704.00x | secp256k1    |

Thank you to the [Dalek team](https://dalek.rs/), their [Rust Bulletproof implementation](https://doc-internal.dalek.rs/bulletproofs/notes/range_proof/index.html), and it's excellent documentation assisted me heavily in learning and implementing the protocol.

## Usage

### Installation
```cmd
npm install --save bulletproof-js
```

There are two versions of Bulletproofs you can create and uncompressed and a compressed version.
The uncompressed version will just contain the two vectors not running the inner product proof protocol.
It will be faster to compute but it's size will be (3 scalar + [4 + 2n] commitments).
The size of the compressed version in contrast is only (5 scalar + [4 + log(n)] commitments)

#### Proof Creation and Verification
```javascript
const bulletproofs = require('bulletproof-js');
const EC = require('elliptic').ec;
const cryptoutils = require('bigint-crypto-utils');

const ProofFactory = bulletproofs.ProofFactory;
const ProofUtils = bulletproofs.ProofUtils;
const secp256k1 = bulletproofs.Constants.secp256k1;
const ec = new EC('secp256k1');

// Random blinding factor
const x = cryptoutils.randBetween(secp256k1.n);

// Amount to which we commit
const a = 25003n;

// Lower and upper bound of range proof (this will be treated as exponents of 2)
const low = 0n;
const upper = 64n;

// Generator
const G = ec.g;
// Orthogonal Generator
const H = ProofUtils.getnewGenFromHashingGen(G);
// Pedersen Commitment to our amount
const V = ProofUtils.getPedersenCommitment(a, x, secp256k1.n, H);

// Compute an uncompressed proof first. Note the last parameter will switch off asserts improving performance
const uncompr_proof = ProofFactory.computeBulletproof(a, x, V, G, H, low, upper, secp256k1.n, false);
// Compress proof using the inner product protocol (Again pass false to switch off asserts)
const compr_proof = uncompr_proof.compressProof(false);

// Proofs can be serialized and deserialized to and from JSON.
console.log(compr_proof.toJson(true));
// Verify a proof calling the verify function on the proof object (works on both uncompressed and compressed version)
console.log(compr_proof.verify(low, upper) ? 'Valid proof' : 'Invalid Proof');
```
```
