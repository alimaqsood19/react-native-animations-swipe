import React, { Component } from 'react';
import { View, StyleSheet, Text, Animated } from 'react-native';

class Ball extends Component {
  componentWillMount() {
    this.position = new Animated.ValueXY(0, 0); //Coordinate pair, setting off at X: 0, Y:0
    Animated.spring(this.position, {
      //Initial position to x:200, y:400, in default 1000ms
      toValue: { x: 200, y: 400 }
    }).start(); //starts off animation can pass in callback here
  }

  render() {
    return (
      <Animated.View style={this.position.getLayout()}>
        <View style={styles.ball} />
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  ball: {
    height: 60,
    width: 60,
    borderRadius: 30,
    borderWidth: 30,
    borderColor: 'black'
  }
});

export default Ball;
