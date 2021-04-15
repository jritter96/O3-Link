import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DrawerNavigator from './DrawerNavigator';
import SearchScreen from '../screens/SearchScreen';

const Tab = createBottomTabNavigator();

export default class TabNavigator extends React.Component {
    render() {
        return (
            <Tab.Navigator
                screenOptions={({ route }) => (
                    {
                        tabBarIcon: ({ focused, color, size }) => {
                            let iconName;

                            if (route.name === 'Map') {
                                iconName = 'map-outline';
                            } else if (route.name === 'Readings') {
                                iconName = 'reader-outline';
                            } else if (route.name === 'Search') {
                                iconName = 'search-outline';
                            } else {
                                iconName = 'help-outline';
                            }
                            return <Ionicons name={iconName} size={size} color={color} />;
                        },
                    }
                )}
                tabBarOptions={
                    {
                        activeTintColor: 'tomato',
                        inactiveTintColor: 'gray',
                    }
                }
            >
                <Tab.Screen name="Map" component={DrawerNavigator} />
                <Tab.Screen name="Search" component={SearchScreen} />
            </Tab.Navigator>
        )
    }
}
