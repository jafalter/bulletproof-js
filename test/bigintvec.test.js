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

describe('Unit Tests for the BigIntVector class', () => {

    it('Should test result of getVectorWithOnlyScalar', () => {
        const v = BigIntVector.getVectorWithOnlyScalar(5n, 10);
        assert(v.length() === 10);
        for( let i = 0; i < v.length(); i++ ) {
            const sc = v.get(i);
            assert(sc === 5n);
        }
    });

    it('Should test result of getVectorWithOnlyScalar with mod', () => {
        const v = BigIntVector.getVectorWithOnlyScalar(5n, 10, 3n);
        assert(v.length() === 10);
        for( let i = 0; i < v.length(); i++ ) {
            const sc = v.get(i);
            assert(sc === 2n);
        }
    });

    it('Should test result of getVectorWithOnlyScalar with invalid param', () => {
       let error = null;
       try {
           const v = BigIntVector.getVectorWithOnlyScalar(4, 10);
       } catch (e) {
           error = e;
       }
       assert(error !== null);
    });

    it('Should test result of getVectorToPowerN', () => {
        const v = BigIntVector.getVectorToPowerN(5n, 3n);
        assert(v.length() === 3);
        let exp = 0n;
        for( let i of v.elems ) {
            assert(i === 5n ** exp);
            exp++;
        }
    });

    it('Should test result of getVectorToPowerN invalid param', () => {
        let err = false;
        try {
            const v = BigIntVector.getVectorToPowerN(5, 3);
        } catch (e) {
            err = e;
        }
        assert(err);
    });

    it('Should test result of getVectorToPowerN with mod', () => {
        const v = BigIntVector.getVectorToPowerN(5n, 3n, 3n);
        assert(v.length() === 3);
        let exp = 0n;
        for( let i of v.elems ) {
            assert(i === Maths.mod(5n ** exp, 3n));
            exp++;
        }
    });

    it('Should test result of getVectorToPowerModInvN', () => {
        const v = BigIntVector.getVectorToPowerN(5n, 3n, 3n);
        assert(v.length() === 3);
        let exp = 0n;
        for( let i of v.elems ) {
            assert(i === cryptoutils.modInv( 5n ** exp, 3n) );
            exp++;
        }
    });

    it('Should test result of getVectorToPowerModInvN invalid param', () => {
        let err = false;
        try {
            const v = BigIntVector.getVectorToPowerN(5, 3);
        } catch (e) {
            err = e;
        }
        assert(err);
    });

    it('Should convert a array of hex strings into BigIntVector', () => {
        const a = 12412n;
        const b = 135134n;
        const c = 151231n;

        const arr = [
            '0x' + a.toString(16),
            '0x' + b.toString(16),
            '0x' + c.toString(16)
        ];

        const obj = {
            elems : arr,
        };

        const vec = BigIntVector.getFromObject(obj);

        assert(vec.length() === 3);
        assert(vec.get(0) === a);
        assert(vec.get(1) === b);
        assert(vec.get(2) === c);
    });

    it('Should convert a array of hex strings into BigIntVector with order', () => {
        const a = 12412n;
        const b = 135134n;
        const c = 151231n;
        const order = 3n;

        const arr = [
            '0x' + a.toString(16),
            '0x' + b.toString(16),
            '0x' + c.toString(16)
        ];

        const obj = {
            elems : arr,
            n: order.toString(16)
        };

        const vec = BigIntVector.getFromObject(obj);

        assert(vec.length() === 3);
        assert(vec.get(0) === Maths.mod(a, order));
        assert(vec.get(1) === Maths.mod(b, order));
        assert(vec.get(2) === Maths.mod(c, order));
    });

    it('Should clone the vector and they should be the same', () => {
        const a = 789798n;
        const b = 89798798n;
        const c = 78798123n;
        const d = 751237891237n;

        const v1 = new BigIntVector();
        v1.addElem(a);
        v1.addElem(b);
        v1.addElem(c);
        v1.addElem(d);

        const v2 = v1.clone();
        assert(v1.equals(v2));
    });

    it('Should clone the vector and they should be the same with order', () => {
        const a = 789798n;
        const b = 89798798n;
        const c = 78798123n;
        const d = 751237891237n;
        const order = 7897987n;

        const v1 = new BigIntVector(order);
        v1.addElem(a);
        v1.addElem(b);
        v1.addElem(c);
        v1.addElem(d);

        const v2 = v1.clone();
        assert(v1.equals(v2));
    });

    it('Should fail to instantiate a BigIntVector with just a number', () => {
        let err = false;
        try {
            const v = new BigIntVector(123);
        } catch (e) {
            err = e;
        }
        assert(err);
    });

    it('Should fail to add a number which is not a bigint', () => {
        let err = false;

        const v1 = new BigIntVector();
        try {
            v1.addElem(43);
        } catch (e) {
            err = e;
        }

        assert(err);
    });

    it('Two Vectors with different elems should not be the same', () => {
        const a = 789798n;
        const b = 89798798n;
        const c = 78798123n;
        const d1 = 751237891237n;
        const d2 = 751237891236n;
        const order = 7897987n;

        const v1 = new BigIntVector(order);
        const v2 = new BigIntVector(order);
        v1.addElem(a);
        v2.addElem(a);
        v1.addElem(b);
        v2.addElem(b);
        v1.addElem(c);
        v2.addElem(c);
        v1.addElem(d1);
        v2.addElem(d2);

        assert(!v1.equals(v2));
    });

    it('Two vectors with same numbers but different order should not be the same', () => {
        const a = 789798n;
        const b = 89798798n;
        const c = 78798123n;
        const d = 751237891237n;
        const order1 = 7897987n;
        const order2 = 7897988n;

        const v1 = new BigIntVector(order1);
        const v2 = new BigIntVector(order2);
        v1.addElem(a);
        v2.addElem(a);
        v1.addElem(b);
        v2.addElem(b);
        v1.addElem(c);
        v2.addElem(c);
        v1.addElem(d);
        v2.addElem(d);

        assert(!v1.equals(v2));
    });

    it('Two vectors with same numbers but one with an order the other without should not be same', () => {
        const a = 789798n;
        const b = 89798798n;
        const c = 78798123n;
        const d = 751237891237n;
        const order = 7897987n;

        const v1 = new BigIntVector(order);
        const v2 = new BigIntVector();
        v1.addElem(a);
        v2.addElem(a);
        v1.addElem(b);
        v2.addElem(b);
        v1.addElem(c);
        v2.addElem(c);
        v1.addElem(d);
        v2.addElem(d);

        assert(!v1.equals(v2));
    });

    it('Vector should serialize and deserialize correctly', () => {
        const a = 789798n;
        const b = 89798798n;
        const c = 78798123n;
        const d = 751237891237n;
        const order = 7897987n;

        const v1 = new BigIntVector(order);
        const ser = v1.toObject();
        const des = BigIntVector.getFromObject(ser);

        assert(des.equals(v1));
    });

    it('Set method should set element of vector', () => {
        const v1 = new BigIntVector();
        v1.addElem(123n);
        v1.addElem(5123n);
        v1.set(0, 124n);
        assert(v1.get(0) === 124n);
    });

    it('Set method should do modulos', () => {
        const v1 = new BigIntVector(5n);
        v1.addElem(14n);
        v1.addElem(15n);
        v1.set(0, 13n);
        assert(v1.get(0), 3n);
    });

    it('Set should fail with non bigint value', () => {
        const v1 = new BigIntVector();
        v1.addElem(123n);
        v1.addElem(5123n);
        let err = false;
        try {
            v1.set(0, 124);
        } catch (e) {
            err = e;
        }
        assert(err);
    });

    it('Set should fail with a out of range index', () => {
        const v1 = new BigIntVector();
        v1.addElem(123n);
        v1.addElem(5123n);
        let err = false;
        try {
            v1.set(5, 124n);
        } catch (e) {
            err = e;
        }
        assert(err);
    });

    it('Mult Vector to scalar should work as expected', () => {
        const v1 = new BigIntVector();
        const v2 = new BigIntVector();

        v1.addElem(5n);
        v2.addElem(3n);
        v1.addElem(10n);
        v2.addElem(2n);

        assert(v1.multVectorToScalar(v2) === 5n * 3n + 10n * 2n);
    });

    it('Mult Vector to scalar should work as expected with mod', () => {
        const v1 = new BigIntVector(3n);
        const v2 = new BigIntVector(3n);

        v1.addElem(5n);
        v2.addElem(3n);
        v1.addElem(10n);
        v2.addElem(2n);

        assert(v1.multVectorToScalar(v2) ===  Maths.mod(5n * 3n + 10n * 2n, 3n));
    });

    it('Mult Vector with Point should work as expected', () => {
        const G = ec.g;
        const v1 = new BigIntVector(3n);

        v1.addElem(5n);
        v1.addElem(3n);
        v1.addElem(10n);

        const G5 = G.mul(Utils.toBN(2n));
        const G3 = G.mul(Utils.toBN(0n));
        const G10 = G.mul(Utils.toBN(1n));

        assert(v1.multVectorWithPointToPoint(G).eq(G5.add(G3).add(G10)));
    });

    it('Should mulitply two vectors', () => {
        const v1 = new BigIntVector(3n);
        const v2 = new BigIntVector(3n);

        v1.addElem(5n);
        v2.addElem(1n);
        v1.addElem(6n);
        v2.addElem(66n);

        const v3 = v1.multVector(v2);

        assert(v3.length() === 2);
        assert(v3.get(0) === Maths.mod(5n * 1n, 3n));
        assert(v3.get(1) === Maths.mod(6n * 66n, 3n));

        assert(v3.toScalar() === Maths.mod(5n * 1n + 6n * 66n, 3n));
    });

    it('Should fail to multiply vectors with different lenght', () => {
        const v1 = new BigIntVector();
        const v2 = new BigIntVector();

        v1.addElem(5123n);
        v2.addElem(2234n);
        v2.addElem(451n);

        let err = false;
        try {
            v1.multVector(v2);
        } catch (e) {
            err = e;
        }

        assert(err);
    });

    it('Should fail to multiply two different vectors', () => {
        const v1 = new BigIntVector();
        const v2 = new PointVector();

        v1.addElem(781234n);
        v1.addElem(5719834n);
        v2.addElem(ec.g);
        v2.addElem(ec.g);

        let err = false;
        try {
            v1.multVector(v2);
        } catch (e) {
            err = e;
        }
        assert(err);
    });

    it('Should multiply vector with a scalar', () => {
        const v1 = new BigIntVector();
        const a = 781234n;
        const b = 5719834n;

        v1.addElem(a);
        v1.addElem(b);

        const v2 = v1.multWithScalar(3n);
        assert(v2.get(0) === a * 3n);
        assert(v2.get(1) === b * 3n);
    });

    it('Should multiply vector with a scalar and do mod calculations', () => {
        const v1 = new BigIntVector(3n);
        const a = 781234n;
        const b = 5719834n;

        v1.addElem(a);
        v1.addElem(b);

        const v2 = v1.multWithScalar(3n);
        assert(v2.get(0) === Maths.mod(a * 3n, 3n));
        assert(v2.get(1) === Maths.mod(b * 3n,3n));
    });

    it('Should fail to mulitply with a non bigint scalar', () => {
        const v1 = new BigIntVector();
        const a = 781234n;
        const b = 5719834n;

        v1.addElem(a);
        v1.addElem(b);

        let err = false;
        try {
            v1.multWithScalar(3523);
        } catch (e) {
            err = e;
        }

        assert(err);
    });

    it('MultiplytoScalar should work as expected', () => {
        const v1 = new BigIntVector();
        const a = 781234n;
        const b = 5719834n;

        v1.addElem(a);
        v1.addElem(b);

        const v2 = v1.multWithScalar(3n);
        assert(v2.toScalar() === v1.multWithScalarToScalar(3n));
    });

    it('Sustract scalar method should work as expected', () => {
        const v1 = new BigIntVector();

        const a = 5781n;
        const b = 796234n;
        const f = 81212n;

        v1.addElem(a);
        v1.addElem(b);

        const v2 = v1.subScalar(f);
        assert(v2.get(0) === a - f);
        assert(v2.get(1) === b - f);
    });

    it('Sustract scalar method should work as expected with order', () => {
        const v1 = new BigIntVector(3n);

        const a = 5781n;
        const b = 796234n;
        const f = 81212n;

        v1.addElem(a);
        v1.addElem(b);

        const v2 = v1.subScalar(f);
        assert(v2.get(0) === Maths.mod(a - f, 3n));
        assert(v2.get(1) === Maths.mod(b - f, 3n));
    });

    it('Sustract scalar method should fail if a non Bigint is provided', () => {
        const v1 = new BigIntVector(3n);

        const a = 5781n;
        const b = 796234n;
        const f = 81212;

        v1.addElem(a);
        v1.addElem(b);

        let err = false;
        try {
            const v2 = v1.subScalar(f);
        } catch (e) {
            err = e;
        }
        assert(err);
    });

    it('Add scalar method should work as expected', () => {
        const v1 = new BigIntVector();

        const a = 5781n;
        const b = 796234n;
        const f = 81212n;

        v1.addElem(a);
        v1.addElem(b);

        const v2 = v1.addScalar(f);
        assert(v2.get(0) === a + f);
        assert(v2.get(1) === b + f);
    });

    it('Add scalar method should work as expected with order', () => {
        const v1 = new BigIntVector(3n);

        const a = 5781n;
        const b = 796234n;
        const f = 81212n;

        v1.addElem(a);
        v1.addElem(b);

        const v2 = v1.addScalar(f);
        assert(v2.get(0) === Maths.mod(a + f, 3n));
        assert(v2.get(1) === Maths.mod(b + f, 3n));
    });

    it('Add scalar method should fail if a non Bigint is provided', () => {
        const v1 = new BigIntVector(3n);

        const a = 5781n;
        const b = 796234n;
        const f = 81212;

        v1.addElem(a);
        v1.addElem(b);

        let err = false;
        try {
            const v2 = v1.addScalar(f);
        } catch (e) {
            err = e;
        }
        assert(err);
    });

    it('Should add up two vectors as expected', () => {
        const v1 = new BigIntVector();
        const v2 = new BigIntVector();

        v1.addElem(5n);
        v1.addElem(12n);

        v2.addElem(51n);
        v2.addElem(13n);

        const v3 = v1.addVector(v2);

        assert(v3.get(0) === 5n + 51n);
        assert(v3.get(1) === 12n + 13n);
    });

    it('Should add up two vectors as expected with mod', () => {
        const v1 = new BigIntVector(3n);
        const v2 = new BigIntVector(3n);

        v1.addElem(5n);
        v1.addElem(12n);

        v2.addElem(51n);
        v2.addElem(13n);

        const v3 = v1.addVector(v2);

        assert(v3.get(0) === Maths.mod(5n + 51n, 3n));
        assert(v3.get(1) === Maths.mod(12n + 13n, 3n));
    });

    it('Should fail to add a vector with a differnt length', () => {
        const v1 = new BigIntVector(3n);
        const v2 = new BigIntVector(3n);

        v1.addElem(5n);
        v1.addElem(12n);

        v2.addElem(51n);

        let err = false;
        try {
            const v3 = v1.addVector(v2);
        } catch (e) {
            err = e;
        }
        assert(err);
    });

    it('Should fail to add a vector which doesnt have bigints', () => {
        const v1 = new BigIntVector(3n);
        const v2 = new PointVector();

        v1.addElem(5n);
        v1.addElem(12n);

        v2.addElem(ec.g);
        v2.addElem(ec.g);

        let err = false;
        try {
            const v3 = v1.addVector(v2);
        } catch (e) {
            err = e;
        }
        assert(err);
    });

    it('Test the Vector function multVectorWithPointToPoint', () => {
        const v = new BigIntVector(secp256k1.n);
        v.addElem(2n);
        v.addElem(3n);
        v.addElem(4n);
        v.addElem(6n);
        v.addElem(1n);

        const G = ec.g;

        const P1 = v.multVectorWithPointToPoint(G);
        const P2 = G.mul(Utils.toBN(v.toScalar()));
        const P3 = G.mul(Utils.toBN(16n));
        const P4 = G.mul(Utils.toBN(2n)).add(G.mul(Utils.toBN(3n))).add(G.mul(Utils.toBN(4n))).add(G.mul(Utils.toBN(6n))).add(G.mul(Utils.toBN(1n)))

        assert(P1.eq(P2));
        assert(P2.eq(P3));
        assert(P3.eq(P4));
    });
});