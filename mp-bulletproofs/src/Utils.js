class Utils {

    /**
     * Substract a scalar from every element
     * of a vector
     *
     * @param vec {[]} Vector needs to contain only bigints
     * @param scalar {bigint} the scalar to substract from the vector
     * @return {[]} the new vector
     */
    static vecSubScalar(vec, scalar) {
        if( typeof scalar !== 'bigint' ) {
            throw new Error("Scalar must be bigint");
        }
        const retVec = [];
        for( let i = 0; i < vec.length; i++ ) {
            const val = vec[i];
            if( typeof val !== 'bigint' ) {
                throw new Error("Vector may only contain bigints");
            }
            retVec.push(val - scalar);
        }
        return retVec;
    }

    /**
     * Mulitply two vectors
     *
     * @param v1 {array} must only contain bigints
     * @param v2 {array} must only contain bigints
     */
    static vecMult(v1, v2) {
        let result = 0n;
        if( v1.length !== v2.length ) {
            throw new Error("Vectors to be multiplied must be same length");
        }
        for( let i = 0; i < v1.length; i++ ) {
            if( typeof v1[i] !== 'bigint' || typeof v2[i] !== 'bigint' ) {
                throw new Error("Vectors must only contain bigint values");
            }
            const nextVal = v1[i] * v2[i];
            result += nextVal;
        }
        return result;
    }
}

module.exports = Utils;