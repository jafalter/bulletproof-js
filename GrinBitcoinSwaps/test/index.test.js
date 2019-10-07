import React from 'react';

import renderer from 'react-test-renderer';
import IndexScreen from "../lib/components/IndexScreen";
import * as jest from "jest";

jest.mock('./../lib/Db.js', () =>
)

test('When no password is set, should render the EnterNewPasswordComp component', () => {
    const tree = renderer.create(<IndexScreen/>).toJSON();
    console.log("hey babe");
});