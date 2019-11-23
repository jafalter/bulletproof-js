const Vector = require('./Vector');
const Utils = require('./Utils');

class PointVector extends Vector {

    /**
     * Get a Point vector with length len
     * containin only p
     *
     * @param p {Point}
     * @param len {number}
     */
    static getVectorFullOfPoint(p, len) {
        const v = new PointVector();
        for( let i = 0; i < len; i++ ) {
            v.addElem(p);
        }
        return v;
    }

    constructor() {
        super();
        this.elems = [];
    }

    /**
     *
     * @param e {Point}
     */
    addElem(e) {
        this.elems.push(e);
    }

    clone() {
        const v = new PointVector();
        for( let i = 0; i < this.length(); i++ ) {
            v.addElem(this.get(i));
        }
        return v;
    }

    length() {
        return this.elems.length;
    }

    get(i) {
        if( i >= this.length() ) {
            throw new Error("Out of Bounds Error");
        }
        return this.elems[i];
    }

    set(i, val) {
        if( i >= this.length() ) {
            throw new Error("Out of Bounds Error");
        }
        this.elems[i] = val;
    }

    /**
     * Multiply this point Vector with a
     * Vector of BigInt scalars and receive a
     * final point
     *
     * @param v {BigIntVector}
     */
    multWithBigIntVectorToPoint(v) {
        if( v.length() !== this.length() ) {
            throw new Error("Can only multiply Vectors with same length");
        }
        const p = this.get(0).mul(Utils.toBN(v.get(0)));
        for( let i = 1; i < this.length(); i++ ) {
            p.add(this.get(i).mul(Utils.toBN(v.get(i))));
        }
        return p;
    }
}

module.exports = PointVector;