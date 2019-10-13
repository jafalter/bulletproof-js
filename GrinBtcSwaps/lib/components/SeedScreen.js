import React from "react";
import {Button, View, Text} from "react-native";
import Factory from "../Factory";
import GBCrypto from "../GBCrypto";

class SeedScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            status: 'init',
            phrase: ''
        };
        this.userDao = Factory.getUserDao();
    }

    onClickActionBtn(type) {
        if ("recover" === type) {
            this.setState({
                status: 'recover'
            });
        }
        else if ("generate" === type) {
            this.setState({
                status: 'generate'
            });
        }
    }

    async generateSeedPhrase() {
        const phrase = await GBCrypto.genereteMnemonic();
        const seed = GBCrypto.seedFromMnemonic(phrase);
        console.log(phrase);
        console.log(seed);
        await this.userDao.setSeed(seed);
        this.setState({
            phrase: phrase
        });
    }

    render() {
        switch (this.state.status) {
            default:
            case "init" :
                return <View>
                    <Button title='Recover from Seedphrase' onPress={() => {
                        this.onClickActionBtn('recover')
                    }}/>
                    <Button title='Generate new Seedphrase' onPress={() => {
                        this.onClickActionBtn('generate')
                    }}/>
                </View>;
            case "recover":
                return <View>
                    <Text>Lets go</Text>
                </View>;
            case "generate":
                return <View><Button title='Generate' onPress={async () => {
                    await this.generateSeedPhrase()
                }}/><Text>{this.state.phrase}</Text>
                </View>;
        }
    }
}

export default SeedScreen;