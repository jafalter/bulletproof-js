import React from "react";
import {StyleSheet, Text, View} from 'react-native';
import Factory from "../Factory";
import EnterNewPasswordComp from "./subcomponents/EnterNewPasswordComp";
import UnlockScreen from "./UnlockScreen";
import SeedScreen from "./SeedScreen";
import commonStyles from "../res/commonStyles";

const logger = Factory.getLogger();

class IndexScreen extends React.Component {

    constructor(props) {
        super(props);
        this.userDao = Factory.getUserDao();
        this.state = {
            status: 'initializing',
            unlocked: false
        };
    }

    /**
     * Function to change state by child components
     *
     * @param key {string} state key
     * @param val {string} state value
     */
    handler(key, val) {
        this.setState({
            [key] : val
        })
    }

    async componentDidMount() {
        try {
            const user = await this.userDao.getUserData();
            const setupNeeded = user === null;
            if( setupNeeded ) {
                this.setState({
                    status : 'setup'
                });
            }
            else {
                this.setState({
                    status : 'ready'
                })
            }
        } catch (e) {
            logger.error("Error during db query", e);
            this.setState({
                status: 'corrupted'
            });
        }
    }

    render() {
        let msg = "initializing";

        switch (this.state.status) {
            case 'initializing':
                msg = 'initializing';
                break;
            case 'corrupted':
            default:
                msg = 'corrupted';
                break;
            case 'ready':
                if( this.state.unlocked ) {
                    return <View style={commonStyles.container}><SeedScreen /></View>
                }
                else {
                    return <View style={commonStyles.container}><UnlockScreen handler={this.handler.bind(this)} /></View>
                }
            case 'setup':
                return <View style={commonStyles.container}><EnterNewPasswordComp handler={this.handler.bind(this)} /></View>
        }

        return <Text>{msg}</Text>
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    }
});

export default IndexScreen;