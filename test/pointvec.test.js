const EC = require('elliptic').ec;
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const cryptoutils = require('bigint-crypto-utils');

const Utils = require('../src/Utils');
const BigIntVector = require('../src/BigIntVector');
const PointVector = require('../src/PointVector');
const Maths = require('../src/Maths');
const secp256k1 = require('../src/Constants').secp256k1;

const ec = new EC('secp256k1');

describe('Tests for some of the crypto stuff', () => {

    it('Should test that getVectorOfPoint behaves as expected', () => {
        const points = PointVector.getVectorOfPoint(ec.g, 10);
        assert(points.length() === 10);
        for( let i = 0; i < points.length(); i++ ) {
            const p = points.get(i);
            assert(p.eq(ec.g));
        }
    });

    it('Should test that adding of two PointVectors works as expected', () => {
       const v1 = new PointVector();
       const v2 = new PointVector();

       v1.addElem(ec.g);
       v1.addElem(ec.g);
       v2.addElem(ec.g);
       v2.addElem(ec.g);

       const v3 = v1.addPointVector(v2);
       assert(v3.get(0).eq(ec.g.mul(Utils.toBN(2n))));
       assert(v3.get(1).eq(ec.g.mul(Utils.toBN(2n))));
    });

    it('Should test that adding of two PointVectors fails with different length vectors', () => {
        const v1 = new PointVector();
        const v2 = new PointVector();

        v1.addElem(ec.g);
        v1.addElem(ec.g);
        v2.addElem(ec.g);
        let err = false;
        try {
            v1.addPointVector(v2);
        } catch (e) {
            err = e;
        }
        assert(err);
    });

    it('Should test that multiplication of Point and BigIntVector works as expected', () => {
        const v1 = new PointVector();
        const v2 = new BigIntVector();

        v1.addElem(ec.g);
        v1.addElem(ec.g);
        v2.addElem(12315n);
        v2.addElem(551231n);

        const v3 = v1.multWithBigIntVector(v2);
        assert(v3.length() === 2);
        assert(v3.get(0).eq(ec.g.mul(Utils.toBN(12315n))));
        assert(v3.get(1).eq(ec.g.mul(Utils.toBN(551231n))));
    });

    it('Should fail to multiply with BigIntVector when different length', () => {
        const v1 = new PointVector();
        const v2 = new BigIntVector();

        v1.addElem(ec.g);
        v1.addElem(ec.g);
        v2.addElem(12315n);

        let err = false;
        try {
            const v3 = v1.multWithBigIntVector(v2);
        } catch (e) {
            err = e;
        }
        assert(err);
    });

    it('Should test that to singlepoint works as expected', () => {
       const v1 = new PointVector();

       v1.addElem(ec.g);
       v1.addElem(ec.g);
       v1.addElem(ec.g);
       v1.addElem(ec.g);

       assert(v1.toSinglePoint().eq(ec.g.mul(Utils.toBN(4n))))
    });

    it('Test that the clone method works as expected', () => {
        const v1 = new PointVector();

        v1.addElem(ec.g);
        v1.addElem(ec.g);
        v1.addElem(ec.g);
        v1.addElem(ec.g);

        const v2 = v1.clone();

        assert(v1.equals(v2));
    });

    it('Should test that two vectors with diff length are not the same', () => {
       const v1 = new PointVector();
       const v2 = new PointVector();

       v1.addElem(ec.g);
       v2.addElem(ec.g);
       v1.addElem(ec.g);

       assert(!v1.equals(v2));
    });

    it('Should test that two vectors are not the same if one is a different vector', () => {
       const v1 = new PointVector();
       const v2 = new BigIntVector();

       v1.addElem(ec.g);
       v1.addElem(ec.g);

       v2.addElem(3n);
       v2.addElem(3n);

       assert(!v1.equals(v2));
    });

    it('Should test that two vectors with one different element are not the same', () => {
       const v1 = new PointVector();
       const v2 = new PointVector();

       v1.addElem(ec.g);
       v1.addElem(ec.g);

       v2.addElem(ec.g);
       v2.addElem(ec.g.mul(Utils.toBN(2n)));

       assert(!v1.equals(v2));
    });

    it('Should test that set function works as expected', () => {
        const v1 = new PointVector();
        const G2 = ec.g.mul(Utils.toBN(2n));

        v1.addElem(ec.g);
        v1.addElem(ec.g);

        v1.set(0, G2);
        assert(v1.get(0).eq(G2))
    });
});