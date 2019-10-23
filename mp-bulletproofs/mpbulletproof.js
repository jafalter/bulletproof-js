const Factory = require('src/Factory');

/**
 * Compute a Bulletproof
 *
 * @param val {number} the value of the commitment. Please use BigInt not number
 * @param x {number} blinding factor used in the commitment
 * @param com {point} pedersen commitment for which we want to compute the rangeproof
 * @param G {point} generator G used in pedersen
 * @param H {point} generator H used in pedersen
 * @param lowBound {number} the lower bound of the rangeproof. Please use BigInt not number
 * @param upBound {number} the upper bound of the rangeproof. Please use BigInt not number
 * @return {RangeProof} Final rangeproof
 */
module.exports.computeBulletproof = (val, x, com, G, H, lowBound, upBound) => {
    return null;
};

/**
 * Verify a Rangeproof
 *
 * @param proof {RangeProof} the compute proof
 * @param com {point} pedersen commitment for which we want to validate the rangeproof for
 * @param lowBound {number} the lower bound of the rangeproof. Please use BigInt not number
 * @param upBound {number} the upper bound of the rangeproof. Please use BigInt not number
 * @return {boolean}
 */
module.exports.verifyRangeProof = (proof, com, lowBound, upBound) => {
    return false;
};