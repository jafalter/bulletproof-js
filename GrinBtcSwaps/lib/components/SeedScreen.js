import React from "react";
import {Button, View} from "react-native";
import Factory from "../Factory";

class SeedScreen extends React.Component {

    constructor(props) {
        super(props);
        this.userDao = Factory.getUserDao();
    }

    render() {
        return <View>
            <Button title='Recover from Seedphrase' />
            <Button title='Generate Seedphrase' />
        </View>
    }
}

export default SeedScreen;