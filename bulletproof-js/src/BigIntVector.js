const Maths = require('./Maths.js');
const Utils = require('./Utils');
const Vector = require('./Vector');

const cryptoutils = require('bigint-crypto-utils');

class BigIntVector extends Vector {

    /**
     * Get a vector from a single scalar with the
     * length len
     *
     * @param sc {BigInt} the scalar
     * @param len {number} how many elements the vector should have
     * @param n {BigInt} optional group order
     * @return {BigIntVector} vector
     */
    static getVectorWithOnlyScalar(sc, len, n=false) {
        if( typeof sc !== 'bigint' ) {
            throw new Error("Scalar i has to be a bigint");
        }
        const v = new BigIntVector(n);
        for( let i = 0; i < len; i++ ) {
            v.addElem(sc);
        }
        return v;
    }

    /**
     * Generate a Vector with y^order
     * while y^e = (1,y,y^2,...,y^e-1)
     *
     * @param y {BigInt} initial number
     * @param e {BigInt} the last exponent
     * @param n {BigInt} optional number if calculations should be mod order
     * @return {BigIntVector}
     */
    static getVectorToPowerN(y, e, n = false) {
        if( typeof y !== 'bigint' || typeof e !== 'bigint' ) {
            throw new Error("Please provide y and order as bigints");
        }

        const vec = new BigIntVector(n);
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
     * Generate a Vector with y^order
     * while y^e = (1,y,y^2,...,y^e-1)
     *
     * @param y {BigInt} initial number
     * @param e {BigInt} the last exponent
     * @param n {BigInt} optional number if calculations should be mod order
     * @return {BigIntVector}
     */
    static getVectorToPowerMinusN(y, e, n = false) {
        if( typeof y !== 'bigint' || typeof e !== 'bigint' ) {
            throw new Error("Please provide y and order as bigints");
        }

        const vec = new BigIntVector(n);
        for( let i = 0n; i < e; i++ ) {
            if( typeof  n === 'bigint' ) {
                vec.addElem(cryptoutils.modInv(y ** i, n));
            }
            else {
                vec.addElem(y ** i);
            }
        }
        return vec;
    }

    /**
     * Construct BigInt Vector from array
     * of hex strings
     *
     * @param a {{order : string, elems : []}}
     */
    static getFromObject(a) {
        const n = a.n ? BigInt(a.n) : false;
        const v = new BigIntVector(n);
        for( let e of a.elems ) {
            v.addElem(BigInt(e));
        }
        return v;
    }

    /**
     * Optional parameter
     * If passed, all operations will
     * be calculated in the group order
     *
     * @param n {BigInt} Optional group order
     */
    constructor(n=false) {
        super();
        this.elems = [];
        this.mod = n !== false;
        this.order = n;
    }

    /**
     * Create a new Vector object
     * with the same value
     *
     * @return {BigIntVector}
     */
    clone() {
        const v = new BigIntVector(this.order);
        for( let i = 0; i < this.length(); i++ ) {
            v.addElem(this.get(i));
        }
        return v;
    }

    /**
     * Return an array of hex encoded values
     *
     * @return {[]}
     */
    toObject() {
        const hex = [];
        for(let e of this.elems) {
            hex.push('0x' + e.toString(16));
        }
        return {
            n : this.order ? '0x' + this.order.toString(16) : null,
            elems : hex
        };
    }

    /**
     *
     * @param v2 {BigIntVector}
     * @return {boolean}
     */
    equals(v2) {
        if( !(v2 instanceof BigIntVector) ) {
            return false;
        }
        if( v2.length() !== this.length() ) {
            return false;
        }
        for( let i = 0; i < this.length(); i++ ) {
            if( this.get(i) !== v2.get(i) ) {
                return false;
            }
        }
        return true;
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
            this.elems.push(Maths.mod(e, this.order))
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
            this.elems[i] = Maths.mod(val, this.order);
        }
        else {
            this.elems[i] = val;
        }
    }

    /**
     * Mulitply two vectors with a bigint result
     *
     * @param v2 {BigIntVector}
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
            P = P.add(G.mul(Utils.toBN(this.get(i))));
        }
        return P;
    }

    /**
     * Multiply two vectors with a vector as result
     *
     * @param v2 {BigIntVector} the other vector to muliply with
     * @return {BigIntVector} the resulting vector
     */
    multVector(v2) {
        if( this.length() !== v2.length() ) {
            throw new Error("Vectors to be multiplied must be same length");
        }
        const v = new BigIntVector(this.order);
        for( let i = 0; i < this.length(); i++ ) {
            if( typeof this.get(i) !== 'bigint' || typeof v2.get(i) !== 'bigint' ) {
                throw new Error("Vectors must only contain bigint values");
            }
            const result = this.get(i) * v2.get(i);
            if( this.mod ) {
                v.addElem(Maths.mod(result, this.order));
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
     * @return {BigIntVector} result vector
     */
    multWithScalar(sc) {
        const v = new BigIntVector(this.order);
        if( typeof sc !== 'bigint') {
            throw new Error("Scalar sc has to be of type bigint");
        }
        for( let i = 0; i < this.length(); i++ ) {
            if( this.mod ) {
                v.addElem(Maths.mod(this.get(i) * sc, this.order));
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
     * @return {BigIntVector}
     */
    subScalar(sc) {
        if( typeof sc !== 'bigint' ) {
            throw new Error("Scalar must be bigint");
        }
        const v = new BigIntVector(this.order);
        for( let i = 0; i < this.length(); i++ ) {
            const val = this.get(i);
            if( typeof val !== 'bigint' ) {
                throw new Error("Vector may only contain bigints");
            }
            if( this.mod ) {
                v.addElem(Maths.mod(val - sc, this.order));
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
        const v = new BigIntVector(this.order);
        if( typeof sc !== 'bigint' ) {
            throw new Error("Scalar must be bigint");
        }
        for( let i = 0; i < this.length(); i++ ) {
            if( this.mod ) {
                v.addElem(Maths.mod(this.get(i) + sc, this.order));
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
     * @param vec {BigIntVector}
     * @return {BigIntVector}
     */
    addVector(vec) {
        const v = new BigIntVector(this.order);
        if( !(vec instanceof BigIntVector) ) {
            throw new Error("Need to pass another Vector");
        }
        if( this.length() !== vec.length() ) {
            throw new Error("Added vectors need to be same length");
        }
        for( let i = 0; i < this.length(); i++ ) {
            if( this.mod ) {
                v.addElem(Maths.mod(this.get(i) + vec.get(i), this.order));
            }
            else {
                v.addElem(this.get(i) + vec.get(i));
            }

        }
        return v;
    }

    /**
     * Sum upt the vector into a scalar
     * @param bn {boolean} if we want a bn.js number returned
     *
     * @return {BigInt}
     */
    toScalar(bn=false) {
        let result = 0n;
        for( let i = 0; i < this.length(); i++ ) {
            if( this.mod ) {
                result = Maths.mod(result + this.get(i), this.order);
            }
            else {
                result = result + this.get(i);
            }
        }
        return bn? Utils.toBN(result) : result;
    }
}

module.exports = BigIntVector;