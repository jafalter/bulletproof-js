import React from 'react';
import IndexScreen from "./lib/components/IndexScreen";
import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import SeedScreen from "./lib/components/SeedScreen";
import './shim.js'

const MainNavigator = createStackNavigator({
    IndexScreen: { screen: IndexScreen },
    SeedScreen: { screen: SeedScreen }
});

const App = createAppContainer(MainNavigator);

export default App;