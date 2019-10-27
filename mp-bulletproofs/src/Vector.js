class Vector {

    /**
     * Get a vector from a single scalar with the
     * length len
     *
     * @param sc {BigInt} the scalar
     * @param len {number} how many elements the vector should have
     * @return {Vector} vector
     */
    static getVectorWithOnlyScalar(sc, len) {
        if( typeof sc !== 'bigint' ) {
            throw new Error("Scalar i has to be a bigint");
        }
        const v = new Vector();
        for( let i = 0; i < len; i++ ) {
            v.addElem(sc);
        }
        return v;
    }

    /**
     * Generate a Vector with y^n
     * while y^n = (1,y,y^2,...,y^n-1)
     *
     * @param y
     * @param n
     * @return {Vector}
     */
    static getVectorToPowerN(y, n) {
        if( typeof y !== 'bigint' || typeof n !== 'bigint' ) {
            throw new Error("Please provide y and n as bigints");
        }

        const vec = new Vector();
        for( let i = 0n; i < n; i++ ) {
            vec.addElem(y ** i);
        }
        return vec;
    }

    constructor() {
        this.elems = [];
    }

    /**
     * Add an element to the vector
     *
     * @param e {BigInt} BigInt value
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
     * @return {BigInt} the value at index i
     */
    get(i) {
        if( i > this.length() ) {
            throw new Error("Invalid index " + i + " supplied to get function in vector");
        }
        return this.elems[i];
    }

    /**
     * Set element on index i with
     * value val.
     * If the index is out of bounds an
     * error will be thrown
     *
     * @param i {number}
     * @param val {BigInt}
     */
    set(i, val) {
        if( this.length() < i ) {
            throw new Error("Index out of bounds");
        }
        if( typeof val !== 'bigint' ) {
            throw new Error("Can only set bigint values in the vector");
        }
        this.elems[i] = val;
    }

    /**
     * Mulitply two vectors with a bigint result
     *
     * @param v2 {Vector}
     * @param mod {BigInt} optional modulus
     * @return {BigInt}
     */
    multVectorToScalar(v2, mod=false) {
        return this.multVector(v2, mod).toScalar();
    }

    /**
     * Multiply two vectors with a vector as result
     *
     * @param v2 {Vector} the other vector to muliply with
     * @param mod {BigInt} optional modulus for multiplication
     * @return {Vector} the resulting vector
     */
    multVector(v2, mod=false) {
        if( this.length() !== v2.length() ) {
            throw new Error("Vectors to be multiplied must be same length");
        }
        const v = new Vector();
        for( let i = 0; i < this.length(); i++ ) {
            if( typeof this.get(i) !== 'bigint' || typeof v2.get(i) !== 'bigint' ) {
                throw new Error("Vectors must only contain bigint values");
            }
            const result = this.get(i) * v2.get(i);
            v.addElem(mod ? result % mod : result);
        }
        return v;
    }

    /**
     * Multipy vector with a scalar
     *
     * @param sc {BigInt} the scalar to multiply every element of the vector with
     * @return {Vector} result vector
     */
    multWithScalar(sc) {
        const v = new Vector();
        if( typeof sc !== 'bigint') {
            throw new Error("Scalar sc has to be of type bigint");
        }
        for( let i = 0; i < this.length(); i++ ) {
            v.addElem(this.get(i) * sc);
        }
        return v;
    }

    /**
     * Multiply vector with scalar
     *
     * @param sc {BigInt} the scalar to multiply the vector with
     * @return {BigInt} result of the multiplication
     */
    multWithScalarToScalar(sc) {
        return this.multWithScalar(sc).toScalar();
    }

    /**
     * Substract a single scalar from
     * a vector
     *
     * @param sc {BigInt}
     * @return {Vector}
     */
    subScalar(sc) {
        if( typeof sc !== 'bigint' ) {
            throw new Error("Scalar must be bigint");
        }
        const v = new Vector();
        for( let i = 0; i < this.length(); i++ ) {
            const val = this.get(i);
            if( typeof val !== 'bigint' ) {
                throw new Error("Vector may only contain bigints");
            }
            v.addElem(val - sc);
        }
        return v;
    }

    /**
     * Add a scalar to all elements of the
     * vector
     *
     * @param sc {BigInt}
     */
    addScalar(sc) {
        const v = new Vector();
        if( typeof sc !== 'bigint' ) {
            throw new Error("Scalar must be bigint");
        }
        for( let i = 0; i < this.length(); i++ ) {
            v.addElem(this.get(i) + sc);
        }
        return v;
    }

    /**
     * Add two vectors to get a new vector
     *
     * @param vec {Vector}
     * @return {Vector}
     */
    addVector(vec) {
        const v = new Vector();
        if( !(vec instanceof Vector) ) {
            throw new Error("Need to pass another Vector");
        }
        if( this.length() !== vec.length() ) {
            throw new Error("Added vectors need to be same length");
        }
        for( let i = 0; i < this.length(); i++ ) {
            v.addElem(this.get(i) + vec.get(i));
        }
        return v;
    }

    /**
     * Sum upt the vector into a scalar
     *
     * @return {BigInt}
     */
    toScalar() {
        let result = 0n;
        for( let i = 0; i < this.length(); i++ ) {
            result = result + this.get(i);
        }
        return result;
    }
}

module.exports = Vector;