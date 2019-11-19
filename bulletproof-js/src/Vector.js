const Maths = require('./Maths.js');
const Utils = require('./Utils');

class Vector {

    /**
     * Get a vector from a single scalar with the
     * length len
     *
     * @param sc {BigInt} the scalar
     * @param len {number} how many elements the vector should have
     * @param n {BigInt} optional group order
     * @return {Vector} vector
     */
    static getVectorWithOnlyScalar(sc, len, n=false) {
        if( typeof sc !== 'bigint' ) {
            throw new Error("Scalar i has to be a bigint");
        }
        const v = new Vector(n);
        for( let i = 0; i < len; i++ ) {
            v.addElem(sc);
        }
        return v;
    }

    /**
     * Generate a Vector with y^n
     * while y^e = (1,y,y^2,...,y^e-1)
     *
     * @param y {BigInt} initial number
     * @param e {BigInt} the last exponent
     * @param n {BigInt} optional number if calculations should be mod n
     * @return {Vector}
     */
    static getVectorToPowerE(y, e, n = false) {
        if( typeof y !== 'bigint' || typeof e !== 'bigint' ) {
            throw new Error("Please provide y and n as bigints");
        }

        const vec = new Vector(n);
        for( let i = 0n; i < e; i++ ) {
            if( typeof  n === 'bigint' ) {
                vec.addElem(Maths.mod(y ** i, n))
            }
            else {
                vec.addElem(y ** i);
            }
        }
        return vec;
    }

    /**
     * Optional parameter
     * If passed, all operations will
     * be calculated in the group n
     *
     * @param n {BigInt} Optional group order
     */
    constructor(n=false) {
        this.elems = [];
        this.mod = n !== false;
        this.n = n;
    }

    /**
     * Create a new Vector object
     * with the same value
     *
     * @return {Vector}
     */
    clone() {
        const v = new Vector();
        for( let i = 0; i < this.length(); i++ ) {
            v.addElem(this.get(i));
        }
        return v;
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
        if( this.mod ) {
            this.elems.push(Maths.mod(e, this.n))
        }
        else {
            this.elems.push(e);
        }
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
        if( this.mod ) {
            this.elems[i] = Maths.mod(val, this.n);
        }
        else {
            this.elems[i] = val;
        }
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
     * Mulitply vector with a ec Point
     * and receive another Point
     *
     * @param G {Point}
     * @return {Point}
     */
    multVectorWithPointToPoint(G) {
        let P = G.mul(Utils.toBN(this.get(0)));
        for( let i = 1; i < this.length(); i++ ) {
            P.add(G.mul(Utils.toBN(this.get(i))));
        }
        return P;
    }

    /**
     * Multiply two vectors with a vector as result
     *
     * @param v2 {Vector} the other vector to muliply with
     * @return {Vector} the resulting vector
     */
    multVector(v2) {
        if( this.length() !== v2.length() ) {
            throw new Error("Vectors to be multiplied must be same length");
        }
        const v = new Vector(this.n);
        for( let i = 0; i < this.length(); i++ ) {
            if( typeof this.get(i) !== 'bigint' || typeof v2.get(i) !== 'bigint' ) {
                throw new Error("Vectors must only contain bigint values");
            }
            const result = this.get(i) * v2.get(i);
            if( this.mod ) {
                v.addElem(Maths.mod(result, this.n));
            }
            else {
                v.addElem(result);
            }
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
            if( this.mod ) {
                v.addElem(Maths.mod(this.get(i) * sc, this.n));
            }
            else {
                v.addElem(this.get(i) * sc);
            }
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
            if( this.mod ) {
                v.addElem(Maths.mod(val - sc, this.n));
            }
            else {
                v.addElem(val - sc);
            }
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
            if( this.mod ) {
                v.addElem(Maths.mod(this.get(i) + sc, this.n));
            }
            else {
                v.addElem(this.get(i) + sc);
            }
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
            if( this.mod ) {
                v.addElem(Maths.mod(this.get(i) + vec.get(i), this.n));
            }
            else {
                v.addElem(this.get(i) + vec.get(i));
            }

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
            if( this.mod ) {
                result = Maths.mod(result + this.get(i), this.n);
            }
            else {
                result = result + this.get(i);
            }
        }
        return result;
    }
}

module.exports = Vector;