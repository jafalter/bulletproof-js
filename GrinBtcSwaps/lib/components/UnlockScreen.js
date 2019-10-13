import React from "react";
import {Button, StyleSheet, Text, TextInput, View} from "react-native";
import Factory from "../Factory";
import commonStyles from "../res/commonStyles";

class UnlockScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            pass : '',
            error : null
        };
        this.userDao = Factory.getUserDao();
    }

    async onSubmitClick() {
        const verifes = await this.userDao.checkChecksum(this.state.pass);
        if( verifes ) {
            this.props.handler('unlocked', true);
        }
        else {
            this.setState({
                error : 'Invalid Password provided'
            });
        }
    }

    render() {
        return <View style={commonStyles.container}>
            <Text>Unlock your application</Text>
            { this.state.error ? <Text style={styles.error}>{this.state.error}</Text> : null}
            <TextInput placeholder="Password" autoCompleteType="password" secureTextEntry={true} value={this.state.pass} onChangeText={(txt) => { this.setState({pass : txt}); }} />
            <Button title="Submit" style={commonStyles.button} onPress={async () => { await this.onSubmitClick(); } } />
        </View>
    }
}

const styles = StyleSheet.create({
    error : {
        color: 'red'
    },
});

export default UnlockScreen;