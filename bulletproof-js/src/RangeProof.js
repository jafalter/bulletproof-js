class RangeProof {

    /**
     * verify the Range Proof
     *
     * @param low {BigInt} the lower bound for which we verify the proof as an exponent of 2
     * @param up {BigInt} the upper bound for which we verify the proof as an exponent of 2
     * @return {boolean} true if it could be verified
     *                   false otherwise
     */
    verify(low, up) {
        return false;
    }

    toJson() {
        return null;
    }

    toBytes() {
        return null;
    }

    equals(e) {
        return false;
    }
}

module.exports = RangeProof;