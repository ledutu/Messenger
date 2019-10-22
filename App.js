import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableHighlight,
  Image,
  PermissionsAndroid,
  BackHandler
} from 'react-native';
import {
  createImageMessage,
  createLocationMessage,
  createTextMessage
} from './utils/MessageUtils'
import MessageList from './Components/MessageList';
import Toolbar from './Components/Toolbar';
import Geolocation from '@react-native-community/geolocation';
import ImageGrid from './Components/ImageGrid';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [
        createImageMessage('https://unsplash.it/300/300'),
        createTextMessage('Le Duc Tung'),
        createLocationMessage({
          latitude: 10,
          longitude: 106,
        })
      ],
      fullScreenImageId: null,
      isInputFocus: false,
      isCamera: false,
    };
  };

  renderMessageList = () => {
    const { messages } = this.state;
    return (
      <View style={styles.content}>
        <MessageList
          messages={messages}
          onPressMessage={this.handlePressMessage}
        />
      </View>
    )
  };

  handlePressMessage = ({ id, type }) => {
    switch (type) {
      case 'text':
        Alert.alert(
          'Delete Message?',
          'Are you sure?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                const { messages } = this.state;
                this.setState({
                  messages: messages.filter(message => message.id !== id),
                });
              },
            },
          ],
        );
        break;
      case 'image':
        this.setState({
          fullScreenImageId: id,
          isInputFocus: false,
        })
        break;
      default:
        break;
    }
  };

  renderFullMessageImage = () => {
    const { messages, fullScreenImageId } = this.state;

    if (!fullScreenImageId) return;

    const image = messages.find(message => message.id === fullScreenImageId);

    if (!image) return null;

    const { uri } = image;

    return (
      <TouchableHighlight
        style={styles.fullscreenOverlay}
        onPress={this.dismissFullScreenImage}
      >
        <Image style={styles.image} source={{ uri }} />
      </TouchableHighlight>
    )
  };

  dismissFullScreenImage = () => {
    this.setState({
      fullScreenImageId: null,
    })
  };

  handleSubmit = text => {
    this.setState({
      messages: [createTextMessage(text), ...this.state.messages],
    })
  };

  handlePressToolbarLocation = async () => {
    const { messages } = this.state;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Access Locatino?',
          message: 'App needs to access your location!',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        Geolocation.getCurrentPosition(position => {
          const { coords: { latitude, longitude } } = position;

          this.setState({
            messages: [
              createLocationMessage({
                latitude,
                longitude,
              }),
              ...messages,
            ],
          })
        })
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  handleChangeFocus = isFocused => {
    this.setState({
      isInputFocus: isFocused,
      isCamera: false,
    })
  };

  handlePressToolbarCamera = () => {
    const { isCamera } = this.state;
    this.setState({
      isInputFocus: false,
      isCamera: !isCamera,
    })
  };

  dismissCamera = () => {
    this.setState({ isCamera: false, })
  }

  renderToolBar = () => {
    const { isInputFocus } = this.state;
    return (
      <View style={styles.toolbar}>
        <Toolbar
          isFocused={isInputFocus}
          onSubmit={this.handleSubmit}
          onPressLocation={this.handlePressToolbarLocation}
          onChangeFocus={this.handleChangeFocus}
          onPressCamera={this.handlePressToolbarCamera}
        />
      </View>
    )
  };

  componentWillMount() {
    this.subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        const { fullScreenImageId, isCamera } = this.state;

        if (fullScreenImageId || isCamera) {
          this.dismissCamera();
          this.dismissFullScreenImage();
          return true;
        }
        return false;
      }
    )
  };

  componentWillUnmount() {
    this.subscription.remove();
  };

  handlePressImage = uri => {
    const { messages } = this.state;
    this.setState({
      messages: [createImageMessage(uri), ...messages],
    })
  }

  render() {
    const { isCamera } = this.state;
    return (
      <View style={styles.container}>
        {this.renderMessageList()}
        {this.renderToolBar()}
        {isCamera && (
          <ImageGrid
            onPressImage={this.handlePressImage}
          />
        )}
        {this.renderFullMessageImage()}
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
  },
  inputMethodEditor: {
    flex: 1,
    backgroundColor: 'white',
  },
  toolbar: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
    backgroundColor: 'white',
  },
  fullscreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    zIndex: 2,
  },
  image: {
    flex: 1,
    resizeMode: 'contain',
  },
});
