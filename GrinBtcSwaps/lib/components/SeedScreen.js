import React from "react";
import {Button, View, Text} from "react-native";
import Factory from "../Factory";
import GBCrypto from "../GBCrypto";

class SeedScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            status: 'init',
            phrase: '',
            seed: null
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
        else if ("done" === type) {
            this.props.handler('seed', this.state.seed);
        }
    }

    async generateSeedPhrase() {
        const phrase = await GBCrypto.genereteMnemonic();
        const seed = GBCrypto.seedFromMnemonic(phrase);
        await this.userDao.setSeed(seed);
        this.setState({
            phrase: phrase,
            seed: seed
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
                return <View>
                    {this.state.phrase === '' && <Button title='Generate' onPress={async () => { await this.generateSeedPhrase()} }/>}
                    {this.state.phrase !== '' && <Text>Write down this backup phrase in a save location!</Text>}
                    <Text>{this.state.phrase}</Text>
                    {this.state.phrase !== '' && <Button title='Done' onPress={async () => { this.onClickActionBtn('done')} }/>}
                </View>;
        }
    }
}

export default SeedScreen;