import React from "react";
import {Button, Text, TextInput, View} from "react-native";
import {StyleSheet} from "react-native";
import commonStyles from "../../res/commonStyles";

import Factory from "../../Factory";
import Crypto from "../../Crypto";

const pass_label = "Choose a secure password";
const pass_desc = "Minimum 10 characters. Keep the password secure and save!";

const logger = Factory.getLogger();

class EnterNewPasswordComp extends React.Component {

    constructor(props) {
        super(props);
        this.userDao = Factory.getUserDao();
        this.state = {
            pass : '',
            error : false
        }
    }

    render() {
        return <View>
            <Text style={styles.label}>{pass_label}</Text>
            {this.state.error ? <Text style={styles.error}>{this.state.error}</Text> : null}
            <TextInput placeholder="Password" autoCompleteType="password" secureTextEntry={true} value={this.state.pass} onChangeText={(txt) => { this.setState({pass : txt}); }} />
            <Text style={styles.note}>{pass_desc}</Text>
            <Button style={commonStyles.button} title="Submit"onPress={async () => { await this.onSubmitClick(); } } />
        </View>;
    }

    /**
     * Onclick handler for the submit button
     *
     * @return {Promise<void>}
     */
    async onSubmitClick() {
        if( this.state.pass.length < 10 ) {
            logger.info("Password did not fullfill requirements " + this.state.pass);
            this.setState({ error : 'Minimum length of 10 characters required'});
        }
        else {
            await this.userDao.setPasswordChecksum(this.state.pass);
            Crypto.setPassphrase(this.state.pass);
            this.props.handler('status', 'ready');
        }
    }
}

const styles = StyleSheet.create({
  container : {
      textAlign : 'center',
  },
  label : {
      fontSize: 20,
      textAlign: 'center'
  },
  note : {
      fontSize: 12,
      marginBottom: 20,
      textAlign: 'center'
  },
  input : {
      padding: 5
  },
  error : {
      color : 'red'
  }
});

export default EnterNewPasswordComp;