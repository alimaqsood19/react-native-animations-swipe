import React, { Component } from 'react';
import {
  View,
  Animated,
  PanResponder,
  Dimensions,
  LayoutAnimation,
  UIManager
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width; //grabs width of screen
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH; //1/4 of the screen, minimum distance that needs to be dragged
const SWIPE_COIN_DURATION = 250;

class Deck extends Component {
  //Whenever the Deck component is created, it will look at the props provided, if the prop
  //is not provided it will be added for us automatically by this defaultProps and will use it
  static defaultProps = {
    onSwipeRight: () => {},
    onSwipeLeft: () => {}
  };

  constructor(props) {
    super(props);

    const position = new Animated.ValueXY(); //No given starting point, since we dont know where it'l start from no assumptions
    const panResponder = PanResponder.create({
      //Creates gesture handling
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        //event is the event itself
        position.setValue({ x: gesture.dx, y: gesture.dy }); //gesture is the obj that has all the panhandler object fields on it
        //setValue updates the value of position, breaks convention of state objects
        //Thats why makes more sense to do this.position = position; instead of assigning it to state obj
      },
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          this.forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          this.forceSwipe('left');
        } else {
          this.resetPosition();
        }
      }
    });

    this.state = {
      panResponder: panResponder,
      position: position,
      index: 0
    };
  }

  componentWillReceiveProps(nextProps) {
    //By convention refered to as nextProps
    //Whenever the component is to be rendered with a new set of props
    if (nextProps.data !== this.props.data) {
      //asks the question hey is this the exact same array
      this.setState({ index: 0 });
    }
  }

  componentWillUpdate() {
    //Compatibility code for android
    UIManager.setLayoutAnimationEnabledExperimental &&
      UIManager.setLayoutAnimationEnabledExperimental(true);
    LayoutAnimation.spring(); //Whenever the component updates, animate the change of 10 pixels up
  }

  forceSwipe(direction) {
    const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(this.state.position, {
      toValue: { x: x, y: 0 },
      duration: SWIPE_COIN_DURATION
    }).start(() => {
      this.onSwipeComplete(direction);
    });
  }

  onSwipeComplete(direction) {
    const { onSwipeLeft, onSwipeRight, data } = this.props;
    const item = data[this.state.index];
    direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);
    //Position object and programatically reset the values back to 0,0 - doesnt go with state conventions
    this.state.position.setValue({ x: 0, y: 0 });
    this.setState({ index: this.state.index + 1 });
  }

  resetPosition() {
    Animated.spring(this.state.position, {
      toValue: { x: 0, y: 0 }
    }).start();
  }

  getCardStyle() {
    const { position } = this.state;
    const rotate = position.x.interpolate({
      //screens with different widths so need to use Dimensions from react-native
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-120deg', '0deg', '120deg']
    });

    return {
      ...position.getLayout(), //getLayout has info about the x,y position
      transform: [{ rotate: rotate }]
    };
  }

  renderCards() {
    if (this.state.index >= this.props.data.length) {
      return this.props.renderNoMoreCards();
    }

    return this.props.data
      .map((item, i) => {
        if (i < this.state.index) {
          return null;
        }
        if (i === this.state.index) {
          return (
            <Animated.View
              key={item.id}
              style={[this.getCardStyle(), styles.cardStyle]}
              {...this.state.panResponder.panHandlers}
            >
              {this.props.renderCard(item)}
            </Animated.View>
          );
        }

        return (
          <Animated.View
            key={item.id}
            style={[styles.cardStyle, { top: 10 * (i - this.state.index) }]}
          >
            {this.props.renderCard(item)}
          </Animated.View>
        );
      })
      .reverse();
  }

  render() {
    return <View>{this.renderCards()}</View>;
  }
}

//Position absolute, shrinks the minimum width required to display the element
//It also goes to the top left
const styles = {
  cardStyle: {
    position: 'absolute',
    width: SCREEN_WIDTH
  }
};
//left: 0 same as saying width: SCREEN_WIDTH, fill the full width
//right: 0

export default Deck;
