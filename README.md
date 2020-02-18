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


Special thanks to Pedro Moreno Sanchez heavily assisting me with learning the cryptography around the Bulletproof protocol. 

Thank you to the [Dalek team](https://dalek.rs/), their [Rust Bulletproof implementation](https://doc-internal.dalek.rs/bulletproofs/notes/range_proof/index.html), and it's excellent documentation assisted me heavily in learning and implementing the protocol.

## Usage

### Installation
```cmd
npm install --save bulletproof-js
```

There are two versions of Bulletproofs you can create, uncompressed and a compressed version.
The uncompressed version will just contain the two vectors not running the inner product proof protocol.
It will be faster to compute but it's size will be (3 scalar + [4 + 2n] commitments).
The size of the compressed version in contrast is only (5 scalar + [4 + log(n)] commitments)

### Proof Creation and Verification
```javascript
const bulletproofs = require('bulletproof-js');
const EC = require('elliptic').ec;
const cryptoutils = require('bigint-crypto-utils');

const ProofFactory = bulletproofs.ProofFactory;
const ProofUtils = bulletproofs.ProofUtils;
const constants = bulletproofs.Constants;
const secp256k1 = constants.secp256k1;
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
const H = constants.gens.H;
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
Execution output:
```
{
  "V": "04c69c071facb315cfdf12c762566408fc2d29ba77adfbafc8cf29964f6912bf7816262c138a365742b26012ee0f855191edfdd30742bdd7ae98e1dfbd5442bf14",
  "A": "04136f81fd8032d9bfc8a017f7306987de3a69388e8d0ab18c2a65a1000b62ff4f67c50836e8fdab9c287d81170991f7da3b77296996e40892e7e4f98b865a9581",
  "S": "04d6c7de207f86a0e5d2dcf22d2c2b163aceab21d04fedea9c61f1249d169699cd0ec08bcd21a587670bf96d09525ea0a55d07214af4a2eae491a4be53632255c3",
  "T1": "0466c15d04ac056c732fc2e999ba8a3e31dc74531b6e5498c9e50413f43e89fb09e683cc2aeb268e599ee9a962560c54efba88034162e2994f1ebd93dc29d1d56c",
  "T2": "04f9b771aaa0aaceefa6fc85cdac5210ac4473e7a57cbcabf4ade22d4bc8cbe2a2873d8edfec1a1417b844995677064b4641f3b8542b7753937b3e968640288604",
  "tx": "0xb6189bf15c436e4cdc3205f17cdc0fe48456621ea64bd1b8da53a4e6a8459b79",
  "txbf": "0x7bed96815e1a06cb2c6e62b056268542fa72f366c012013cf2745f9410ce0277",
  "e": "0xf316fc8a2489e9a6a8ecb4d8891054a903496433dde6d0e5874b35244e13458d",
  "a0": "0x5c83faed6591dbbac72605c7acd57ee25e7caee216ba066098ee2f9adfe2430f",
  "b0": "0x30d6de7c0ed832716c0d03924d893bac4e1d665be0e208bdf0f033decaf56519",
  "ind": [
    {
      "L": "0418bb01745db3d007f41f79bcc1cabd3cc5341b904eec9ddc43ff88a03f7344172e493c431b311c012dd9270f1a50d6007bbad6f6e9557c4db2ad418f5f0cb69b",
      "R": "04b9040bcebbe1c8b49981b19a6943b7cce1782f6936f81ce6d220cc403228291696435fce39d9c5736b0c7e0490e59731bceeb8edff04d2c6ad59bb625018f50a"
    },
    {
      "L": "040c3e691e9edbfce09aa42ee43631cee0115fa93a3bd3738cf60c38cb8dd5d5639733d50db9b61b26735a7480973929e93379a1f25a2d17bc64b2a041007afb41",
      "R": "047e408eac33665358bbca5420ec3a1011abf5038d1ba153a7d1335e209a0137b6a5b766462ad5ed9a47c01b332b445a9677d55a6722804c07cad3cbb3f4673239"
    },
    {
      "L": "0498a56e54a2247c784d833766f51f7f2c7857a9f7363380d73872efc8612f535231b12a4a182b3858edf858a0123b67e2928e5186c1cca2c1f4ca697fe753c049",
      "R": "040e555a90f61468689a054f5fd7c5767fc026c05e8e0e057d63c6c9afaf58bbdd598cf0d9bfdf4ec09fc002c963b211faf7766d81e119dda0a295884e0d812db3"
    },
    {
      "L": "04566a6a1be8c019c4d65a5335d4f165d1b1e7316e92ee17bb6056cb93dcbdf28dc1002ec7d4c77acd8b72878bb17abe1f69a9fb795782d5e2c820d98aa12dd12f",
      "R": "04f0743c16ed95e95cc525ae42aff306548b69d5969786a194f0a71ee3b9ea28186526d2f705746f3ac3886db5485a1e7675933a8be09fd2d5c4c6a3d553a19e16"
    },
    {
      "L": "04f9e1ed3542a54598ead0a71077dcd87e2b55bc7a465ad438911684fafc71a6e5990a70cb3a424a58573da3c4905a8225e02c39a8556d13c14b39bd7d1a7956c6",
      "R": "047064b8eda9f09bb2e016cf593cbe4ac937737c69a9f387f0881d1874fbcee68a3e3d66a620f4cafc3f65e991eb7c1f672c4128ff4bde8b0af9494340271a3b65"
    },
    {
      "L": "04c254898ee410b46c7ba51825937a5844196824db8e59cb57ee33163d590c8d4d6f418b274c250521d4172d53bb0c5cb34454f829fc7ba3a8392db534acf69d50",
      "R": "04b980a377183f9ff89e676b52899e280f2ab589643a87b62ed3273b0a3749c5b25e045c78ec0221ae9ba37567ece81c54c3e749e4a704786f72372b1250abf982"
    }
  ],
  "G": "0479be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8",
  "order": "0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"
}
Valid proof
```

### Deserializing from JSON string

```javascript
const bulletproof = require('bulletproof-js');
const fs = require('fs');

const CompressedProofs = bulletproof.CompressedProofs;

const json = fs.readFileSync('./proof.json');
const prf = CompressedProofs.fromJsonString(json);
console.log(prf.verify(0n, 64n) ? 'Valid proof' : 'Invalid Proof');
```
Execution output:
```
Valid proof
```

