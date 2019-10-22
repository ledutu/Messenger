import React, { Component } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MessageShape } from '../utils/MessageUtils';
import PropTypes from 'prop-types';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

const keyExtractor = item => item.id.toString();

export default class MessageList extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    };

    static propTypes = {
        messages: PropTypes.arrayOf(MessageShape).isRequired,
        onPressMessage: PropTypes.func
    }

    renderMessageBody = ({ type, text, uri, coordinate }) => {
        switch (type) {
            case 'text':
                return (
                    <View style={styles.messageBubble}>
                        <Text style={styles.text}>{text}</Text>
                    </View>
                );
            case 'image':
                return (
                    <Image source={{ uri }} style={styles.image} />
                )

            case 'location':
                return (
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            ...coordinate,
                            latitudeDelta: 0.08,
                            longitudeDelta: 0.04,
                        }}
                    >
                        <MapView.Marker coordinate={coordinate} />
                    </MapView>
                );

            default:
                return null;
        }
    }

    renderMessageItem = ({ item }) => {
        const { onPressMessage } = this.props;
        return (
            <View key={item.id} style={styles.messageRow}>
                <TouchableOpacity
                    onPress={() => onPressMessage(item)}
                    activeOpacity={0.7}
                >
                    {this.renderMessageBody(item)}
                </TouchableOpacity>
            </View>
        )
    }

    render() {
        const { messages } = this.props;

        return (
            <FlatList
                style={styles.container}
                data={messages}
                inverted
                renderItem={this.renderMessageItem}
                keyExtractor={keyExtractor}
                keyboardShouldPersistTaps={'handled'}
            />
        );
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'visible',
    },

    messageRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 4,
        marginTop: 10,
        marginLeft: 60,
    },

    messageBubble: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        backgroundColor: 'rgb(16,135,255)',
        borderRadius: 20,
    },

    text: {
        fontSize: 18,
        color: 'white',
    },

    image: {
        width: 150,
        height: 150,
        borderRadius: 10,
    },

    map: {
        width: 250,
        height: 250,
        borderRadius: 10,
    }
})
