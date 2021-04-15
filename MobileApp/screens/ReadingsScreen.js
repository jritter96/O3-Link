import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default class ReadingsScreen extends React.Component {

    render() {
        ///Add more cards
        const cards = [
            {
                iconName: 'thermometer-outline',
                unit: '\u00b0C',
                reading: this.props.temp
            },
            {
                iconName: 'mic-outline',
                unit: 'dB',
                reading: this.props.sound
            },
			{
                iconName: 'sunny-outline',
                unit: 'lx',
                reading: this.props.light
            },
            {
                iconName: 'water-outline',
                unit: '%',
                reading: this.props.humidity
            },
        ];

		const cardFlips = cards.map((card, index) => {
			return <View key={index} style={styles.readingsContainer}>
				<Ionicons name={card.iconName} size={40} color='white' />
				<Text style={styles.readingsText}>{card.reading} {card.unit}</Text>
			</View>
		})

        return (
            <View style={styles.container}>
                {cardFlips}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
		width: 255,
		borderRadius: 18,
		paddingTop: 3,
		paddingBottom: 3,
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: '#FEFEFE',
        justifyContent: 'center',
        alignContent: 'center'
    },
    readingsContainer: {
        flexDirection: 'row',
        width: 120,
        height: 120,
        marginTop: 2,
        marginBottom: 2,
        marginLeft: 2,
        marginRight: 2,
        borderRadius: 15,
        backgroundColor: 'tomato',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 2,  
        elevation: 5
    },
    readingsText: {
        paddingLeft: 1,
        color: 'white',
        fontSize: 18
    },

});