import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import IndexComponent from "./lib/components/IndexComponent";

export default class App extends Component {

  render() {
    return (
      <View style={styles.container}>
        <IndexComponent/>
      </View>
    );
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
