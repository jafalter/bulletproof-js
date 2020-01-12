# bulletproof-js

This library is a pure Javascript implementation of the Bulletproof range proof protocol on the 
secp256k1 curve using the [elliptic](https://www.npmjs.com/package/elliptic) libraray.
It was initially implemented as a university project at TU Vienna and has been made public after the project was finished.
Please note that this library is not battle-tested yet, and you should only use it after careful review.
For randomness [bigint-crypto-utils](bigint-crypto-utils) is used. You should be able to use this
library in any [Webview or Browser supporting BigInts](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#Browser_compatibility) and Node.js (>=10.4.0) 

Contribution and code reviews are always welcome.  Current TODOs:
* Getting the proofs compatible with other
 implementations such as secp256zk1.
* Support for other curves
* Writing more Tests
* Adding capabilities of creating proofs for arbitraray ranges. (Currently only 0 - n-1 supported)
* Mulitparty proof computation

If you are looking for a highly efficient implementation, this library might not be for you. 
Implementations in Rust or C will always be much more efficient than a Javascript implementation. 
Also, I focused on readable code over performance. For instance, Javascript BigInt is used for all computations, 
slowing down the code, but also making it easier to understand and write.

Thank you to the [Dalek team](https://dalek.rs/), their [Rust Bulletproof implementation](https://doc-internal.dalek.rs/bulletproofs/notes/range_proof/index.html), and it's excellent documentation assisted me heavily in learning and implementing the protocol.