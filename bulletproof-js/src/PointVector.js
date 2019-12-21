const Vector = require('./Vector');
const Utils = require('./Utils');

class PointVector extends Vector {

    /**
     * @param p {Point}
     * @param len {number}
     * @return {PointVector}
     */
    static getVectorOfPoint(p, len) {
        const v = new PointVector();
        for(let i = 0; i < len; i++) {
            v.addElem(p);
        }
        return v;
    }

    constructor() {
        super();
        this.elems = [];
    }

    /**
     * @param e {Point}
     */
    addElem(e) {
        this.elems.push(e);
    }

    /**
     * Add two point vectors together
     *
     * @param v {PointVector}
     */
    addPointVector(v) {
        if( v.length() !== this.length() ) {
            throw new Error("Vectors have to be same length");
        }
        const vec = new PointVector();
        for(let i = 0; i < this.length(); i++ ) {
            vec.addElem(this.get(i).add(v.get(i)));
        }
        return vec;
    }

    /**
     * Multiply the Vector elements with a BigInt Vector
     * of the same length
     *
     * @param v {BigIntVector}
     */
    multWithBigIntVector(v) {
        if( v.length() !== this.length() ) {
            throw new Error("Vectors need to be same length for multiplication");
        }
        const newVec = new PointVector();
        for(let i = 0; i < v.length(); i++) {
            newVec.addElem(this.get(i).mul(Utils.toBN(v.get(i))));
        }
        return newVec;
    }

    /**
     * @return {Point}
     */
    toSinglePoint() {
        let P = this.get(0);
        for( let i = 1; i < this.length(); i++ ) {
            P = P.add(this.get(i));
        }
        return P;
    }

    /**
     * @return {PointVector}
     */
    clone() {
        const pV = new PointVector();
        for(let i = 0; i < this.length(); i++) {
            pV.addElem(this.get(i));
        }
        return pV;
    }

    /**
     * @return {number}
     */
    length() {
        return this.elems.length;
    }

    /**
     * @param i {number}
     * @return {Point}
     */
    get(i) {
        return this.elems[i];
    }

    set(i, val) {
        this.elems[i] = val;
    }
}

module.exports = PointVector;