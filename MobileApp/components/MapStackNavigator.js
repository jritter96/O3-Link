import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from '../components/TabNavigator';
import ReadingsScreen from '../screens/ReadingsScreen';

const Stack = createStackNavigator();

export default class MapStackNavigator extends React.Component {
    render() {
        return (
            <Stack.Navigator
                screenOptions={{
                    headerShown: false
                }}>
                <Stack.Screen name="TabNavigator" component={TabNavigator} />
                <Stack.Screen name="Readings" component={ReadingsScreen} />
            </Stack.Navigator>
        );
    }
}