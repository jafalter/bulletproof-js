import React from "react";
import {Button, View} from "react-native";
import Factory from "../Factory";

class SeedScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            status : 'init',
            phrase : null
        };
        this.userDao = Factory.getUserDao();
    }

    onClickActionBtn(type) {
        if( "recover" === type ) {
            this.setState({
                status : 'recover'
            });
        }
        else if( "generate" === type ) {
            this.setState({
                status : 'generate'
            });
        }
    }

    generateSeedPhrase() {
        const phrase = Crypto.genereteMnemonic();
        this.setState({
            phrase : phrase
        });
    }

    render() {
        let main = "";

        switch (this.state.status) {
            default:
            case "init" :
                main = <Button title='Recover from Seedphrase' onpress={() => { this.onClickActionBtn('recover') }} />
                    + <Button title='Generate new Seedphrase' onpress={() => { this.onClickActionBtn('recover') }} />;
                break;
            case "recover":
                main = `<Text>Lets go </Text>`;
                break;
            case "generate":
                main = <Button title='Generate' onpress={() => { this.generateSeedPhrase() }} />
                    + <Text>{this.state.phrase}</Text>;
                break;
        }


        return <View>
            {main}
        </View>
    }
}

export default SeedScreen;