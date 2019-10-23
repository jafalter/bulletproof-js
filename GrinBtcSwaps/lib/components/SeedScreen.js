import React from "react";
import {Button, View, Text, StyleSheet, ActivityIndicator, TextInput, Clipboard} from "react-native";
import Factory from "../Factory";
import GBCrypto from "../GBCrypto";
import commonStyles from "../res/commonStyles";
import DoubleClick from "react-native-double-tap";

class SeedScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            status: 'init',
            phrase: '',
            processing: false,
            seed: null,
            error: false
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
        this.setState({
            processing : true
        });
        const phrase = await GBCrypto.genereteMnemonic();
        const seed = GBCrypto.seedFromMnemonic(phrase);
        await this.userDao.setSeed(seed);
        this.setState({
            phrase: phrase,
            seed: seed,
            processing: false
        });
    }

    async recoverSeedPhrase() {
        const phrase = this.state.phrase;
        if( GBCrypto.validateSeed(phrase) ) {
            const seed = GBCrypto.seedFromMnemonic(phrase);
            await this.userDao.setSeed(seed);
            this.setState({
                seed: seed,
                processing: false
            });
            this.onClickActionBtn('done');
        }
        else {
            this.setState({
                error : 'Your seedphrase is invalid!',
                processing : false
            });
        }
    }

    render() {
        switch (this.state.status) {
            default:
            case "init" :
                return <View style={{...commonStyles.defaultWidth, height : '100%', display : 'flex', justifyContent : 'center'}}>
                    <View style={styles.btn}>
                    <Button title='Recover from Seedphrase' onPress={() => {
                        this.onClickActionBtn('recover')
                    }}/>
                    </View>
                    <View style={styles.btn}>
                    <Button style={styles.btn} title='Generate new Seedphrase' onPress={() => {
                        this.onClickActionBtn('generate')
                    }}/>
                    </View>
                </View>;
            case "recover":
                return <View style={commonStyles.defaultWidth}>
                    <TextInput multiline={true} placeholder="Enter Seedphrase" value={this.state.phrase} onChangeText={(txt) => {this.setState({phrase: txt});}}/>
                    { this.state.error && <Text style={commonStyles.error}>{this.state.error}</Text>}
                    {this.state.processing && <ActivityIndicator size="large" />}
                    <Button title='Done' onPress={async () => {
                        this.setState({
                            processing: true
                        });
                        await this.recoverSeedPhrase();
                    }}/>
                </View>;
            case "generate":
                return <View style={commonStyles.defaultWidth}>
                    {this.state.phrase === '' && !this.state.processing && <Button title='Generate' onPress={async () => { await this.generateSeedPhrase()} }/>}
                    {this.state.processing && <ActivityIndicator size="large" />}
                    {this.state.phrase !== '' && <Text style={commonStyles.txth1}>Write down this backup phrase in a save location!</Text>}
                    <DoubleClick doubleTap={() => {
                        Clipboard.setString(this.state.phrase);
                    }}>
                        <Text style={styles.txtBox}>{this.state.phrase}</Text>
                    </DoubleClick>
                    {this.state.phrase !== '' && <Button title='Done' onPress={async () => { this.onClickActionBtn('done')} }/>}
                </View>;
        }
    }
}

const styles = StyleSheet.create({
    btn : {
        margin: '2%'
    },
    txtBox : {
        margin : '5%',
        fontSize : 16,
        textAlign: 'center'
    }
});

export default SeedScreen;