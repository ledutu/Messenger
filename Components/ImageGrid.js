import React, { Component } from 'react';
import { View, Text, StyleSheet, PermissionsAndroid, TouchableOpacity, Image } from 'react-native';
import CameraRoll from "@react-native-community/cameraroll";
import Grid from './Grid';
import PropTypes from 'prop-types';

const keyExtractor = ({ uri }) => uri;

export default class ImageGrid extends Component {

    static propTypes = {
        onPressImage: PropTypes.func,
    };

    static defaultProps = {
        onPressImage: () => { },
    };

    // eslint-disable-next-line react/sort-comp
    loading = false;
    cursor = null;

    state = {
        images: [],
    };

    componentDidMount() {
        this.getImages();
    }

    getImages = async after => {
        if (this.loading) return;

        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                {
                    title: 'Cool Photo App Camera Permission',
                    message: 'a',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                },
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                this.loading = true;

                const results = await CameraRoll.getPhotos({
                    first: 20,
                    after,
                });

                const { edges, page_info: { has_next_page, end_cursor } } = results;

                const loadedImages = edges.map(item => item.node.image);

                this.setState(
                    {
                        images: this.state.images.concat(loadedImages),
                    },
                    () => {
                        this.loading = false;
                        this.cursor = has_next_page ? end_cursor : null;
                    },
                );
            } else {
                console.log('Camera permission denied');
            }
        } catch (err) {
            console.warn(err);
        }

    };

    renderItem = ({ item: { uri }, size, marginTop, marginLeft }) => {
        const { onPressImage } = this.props;

        const style = {
            width: size,
            height: size,
            marginLeft,
            marginTop,
        };

        return (
            <TouchableOpacity
                key={uri}
                activeOpacity={0.75}
                onPress={() => onPressImage(uri)}
                style={style}
            >
                <Image source={{ uri }} style={styles.image} />
            </TouchableOpacity>
        );
    };

    render() {
        const { images } = this.state;

        return (
            <View style={styles.container}>
                <Grid
                    data={images}
                    renderItem={this.renderItem}
                    keyExtractor={this.getNextImages}
                    keyExtractor={keyExtractor}
                />
            </View>
        );
    }
};

const styles = StyleSheet.create({
    container: {
        height: 300
    },
    image: {
        flex: 1,
    }
});
