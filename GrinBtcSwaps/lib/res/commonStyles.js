import {StyleSheet} from "react-native";

const txtcol = '#717171';
const bgcol = '#fff';

const commonStyles = StyleSheet.create({
    defaultWidth : {
        width : '85%'
    },
    container : {
        flex: 6,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        backgroundColor: '#F5FCFF',
    },
    txth1 : {
        fontSize: 20,
        textAlign: 'center',
        marginBottom: '10%'
    },
    button : {
        width: '75%'
    },
    error : {
        color : 'red',
        textAlign : 'center',
        marginBottom: '2%'
    }
});

export default commonStyles;