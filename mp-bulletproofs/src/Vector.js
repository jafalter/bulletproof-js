class Vector {

    /**
     * Get a vector from a single scalar with the
     * length len
     *
     * @param sc {bigint} the scalar
     * @param len {number} how many elements the vector should have
     * @return {Vector} vector
     */
    static getFromSingleScalar(sc, len) {
        if( typeof sc !== 'bigint' ) {
            throw new Error("Scalar i has to be a bigint");
        }
        const v = new Vector();
        for( let i = 0; i < len; i++ ) {
            v.addElem(sc);
        }
        return v;
    }

    constructor() {
        this.elems = [];
    }

    /**
     * Add an element to the vector
     *
     * @param e {bigint} BigInt value
     */
    addElem(e) {
        if( typeof e !== 'bigint' ) {
            throw new Error("Please only use BigInt values for the vector");
        }
        this.elems.push(e);
    }

    /**
     * Returns the length of a vector
     *
     * @return {number}
     */
    length() {
        return this.elems.length;
    }

    /**
     * Returns the element at index i of a vector
     *
     * @param i {number} the index we want to retrieve
     * @return {bigint} the value at index i
     */
    get(i) {
        if( i > this.length() ) {
            throw new Error("Invalid index " + i + " supplied to get function in vector");
        }
        return this.elems[i];
    }

    /**
     * Mulitply two vectors with a bigint result
     *
     * @param v2 {Vector}
     * @return {bigint}
     */
    multVector(v2) {
        let result = 0n;
        if( this.length() !== v2.length() ) {
            throw new Error("Vectors to be multiplied must be same length");
        }
        for( let i = 0; i < this.length(); i++ ) {
            if( typeof this.get(i) !== 'bigint' || v2.get(i) !== 'bigint' ) {
                throw new Error("Vectors must only contain bigint values");
            }
            result += this.get(i) * v2.get(i);
        }
        return result;
    }

    /**
     * Multiply vector with scalar
     *
     * @param sc {bigint} the scalar to multiply the vector with
     * @return {bigint} result of the multiplication
     */
    multScalar(sc) {
        let result = 0n;
        if( typeof sc !== 'bigint') {
            throw new Error("Scalar sc has to be of type bigint");
        }
        for( let i = 0; i < this.length(); i++ ) {
            result += this.get(i) * sc;
        }
        return result;
    }

    /**
     * Substract a single scalar from
     * a vector
     *
     * @param sc {bigint}
     * @return {Vector}
     */
    substract(sc) {
        if( typeof sc !== 'bigint' ) {
            throw new Error("Scalar must be bigint");
        }
        const retVec = new Vector();
        for( let i = 0; i < this.length(); i++ ) {
            const val = this.get(i);
            if( typeof val !== 'bigint' ) {
                throw new Error("Vector may only contain bigints");
            }
            retVec.addElem(val - sc);
        }
        return retVec;
    }

    add(sc) {
        if( typeof sc !== 'bigint' ) {
            throw new Error("Scalar must be bigint");
        }
        for( let i = 0; i < this.length(); i++ ) {
            this.elems[i] += sc;
        }
    }

    /**
     * Sum upt the vector into a scalar
     *
     * @return {bigint}
     */
    toScalar() {
        let result = 0;
        for( let i = 0; i < this.length(); i++ ) {
            result = result + this.get(i);
        }
        return result;
    }
}

module.exports = Vector;