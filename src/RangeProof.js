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

    toJson(pp=false) {
        throw new Error("toJson not implemented");
    }

    toBytes() {
        throw new Error("toBytes not implemented");
    }

    equals(e) {
        return false;
    }
}

module.exports = RangeProof;