import React from "react";
import {StyleSheet, Text, View} from 'react-native';
import Factory from "../Factory";
import EnterNewPasswordComp from "./subcomponents/EnterNewPasswordComp";

const logger = Factory.getLogger();

class IndexScreen extends React.Component {

    constructor(props) {
        super(props);
        this.userDao = Factory.getUserDao();
        this.state = {
            status: 'initializing'
        }
    }

    async componentDidMount() {
        try {
            const pass = await this.userDao.getPasswordChecksum();
            logger.info(pass);
            const setupNeeded = pass === null;
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
                msg = 'ready';
                break;
            case 'setup':
                return <View style={styles.container}><EnterNewPasswordComp /></View>
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