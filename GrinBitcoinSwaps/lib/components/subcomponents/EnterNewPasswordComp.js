import React from "react";
import {Button, Text, TextInput, View} from "react-native";
import style from "../../res/styles";

const pass_label = "Choose a secure password";
const pass_desc = "Minimum 10 characters. Keep the password secure and save!";

class EnterNewPasswordComp extends React.Component {

    constructor(props) {
        super(props);
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
            <Button title="Submit" type="outline" onPress={() => { this.onSubmitClick(); } } />
        </View>;
    }

    onSubmitClick() {
        if( this.state.pass.length <= 10 ) {
            this.setState({ error : 'Minimum length of 10 characters required'});
        }
    }
}

const styles = {
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
      color : style.txtcolor
  },
  btn : {
      width : '50%'
  },
  error : {
      color : 'red'
  }
};

export default EnterNewPasswordComp;