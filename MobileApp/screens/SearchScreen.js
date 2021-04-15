import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default class SearchScreen extends React.Component {
    
    state = { //Initial values for search screen
        temp: [0, 40],
        sound: [0, 100],
		light: [0, 300],
		humidity: [0, 100]
    };
    

    render() {
        //Add more sliders
        const sliders = [
            {
                iconName: 'thermometer-outline',
                unit: '\u00b0C',
                range: this.state.temp,
                function: values => this.setState({temp: values}),
                minValue: 0,
                maxValue: 40,
                step: 0.5
            },
            {
                iconName: 'mic-outline',
                unit: 'dB',
                range: this.state.sound,
                function: values => this.setState({sound: values}),
                minValue: 0,
                maxValue: 100,
                step: 0.5
            },
			{
                iconName: 'sunny-outline',
                unit: 'lx',
                range: this.state.light,
                function: values => this.setState({light: values}),
                minValue: 0,
                maxValue: 300,
                step: 0.5
            },
            {
                iconName: 'water-outline',
                unit: '%',
                range: this.state.humidity,
                function: values => this.setState({humidity: values}),
                minValue: 0,
                maxValue: 100,
                step: 0.5
            }
        ];

        const rangeSlider = sliders.map((slider, index) =>
            <View key = {index}>
                <View style={styles.sliderContainer}>
                    <Ionicons name={slider.iconName} size={42} color='#555555' />
                    <MultiSlider
                        values={[slider.range[0], slider.range[1]]}
                        sliderLength={Dimensions.get('window').width - 55}
                        onValuesChange={slider.function}
                        min={slider.minValue}
                        max={slider.maxValue}
                        step={slider.step}
                        allowOverlap={false}
                        snapped
                        selectedStyle={{
                            backgroundColor: 'tomato'
                        }}
                        markerStyle={{
                            backgroundColor: 'tomato'
                        }}
                    />
                </View>
                <Text style={styles.searchText}>{slider.range[0]} {slider.unit} - {slider.range[1]} {slider.unit}</Text>
            </View>
        )

        return (
            <View style={styles.container}>

                {rangeSlider}

                <TouchableOpacity
                    style={styles.button}
                    title='Search'
                    color='tomato'
                    onPress={() => {
                        this.props.navigation.navigate('Map',
                            {
                                screen: 'Map', 
                                params: {
                                    temp: this.state.temp, 
                                    sound: this.state.sound,
									light: this.state.light,
									humidity: this.state.humidity,
                                }
                            }
                        )
                    }}>

                    <Text style={styles.buttonText}>Search</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fbfbf8',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    sliderContainer: {
        flexDirection: 'row',
        paddingTop: 10,
        paddingRight: 15,
		paddingLeft: 10
    },
    searchText: {
        color: 'gray',
        fontSize: 15,
        textAlign: 'center'
    },
    button: {
        width: '100%',
        alignItems: 'stretch',
        justifyContent: 'center',
        backgroundColor: 'tomato',
        height: 60
    },
    buttonText: {
        textAlign: 'center',
        fontSize: 18,
        color: 'white'
    }
});