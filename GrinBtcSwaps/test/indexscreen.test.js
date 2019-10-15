import React from 'react';

import renderer from 'react-test-renderer';
import IndexScreen from "../lib/components/IndexScreen";
import MockDB from "./mocks/MockDB";
import UserDao from "../lib/service/UserDao";
import Factory from "../lib/Factory";

const mockdb = new MockDB();
const mockdao = new UserDao(mockdb, Factory.getLogger());
Factory.getUserDao = () => mockdao;

jest.mock('react-native-bip39', () => "bip39");
jest.mock('react-native-sqlite-storage', () => "sqlite");

describe('tests for the IndexScreen component', () => {

     test('Should render SetNewPasswordScreen', (done) => {
         const tree = renderer.create(<IndexScreen/>);
         setTimeout(() => {
             const json = tree.toJSON();
             console.log(tree);
             done();
         }, 5000);
     });

    test('Should render SetNewPasswordScreen', async () => {
        const tree = await renderer.create(<IndexScreen/>);
        const json = tree.toJSON();
        // expect stuff
    });
});