import React from 'react';
import { StyleSheet } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import StackNavigator from './LoginStackNavigator';
import MapScreen from '../screens/MapScreen';
import Ionicons from 'react-native-vector-icons/Ionicons'

const Drawer = createDrawerNavigator();
export default class DrawerNavigator extends React.Component {
	state = {
		isLoggedIn: false
	}

	loginHandler = ((status => {
		this.setState({
			isLoggedIn: status
		});
	}).bind(this));

    render() {
        return(
            <Drawer.Navigator
                drawerPosition={'right'}
                drawerContentOptions={{
                    activeTintColor: 'white',
                    activeBackgroundColor: 'tomato',
                    inactiveTintColor: '#ae1a00'
                }}
                drawerStyle={{
                    backgroundColor: '#fbfbf8'
                }}>
                <Drawer.Screen name='Map' component={MapScreen} initialParams={{ loginHandler: this.loginHandler }} options={{
                    title: 'Navigate',
                    drawerIcon: ({ focused, size }) => (
                        <Ionicons
                            name="navigate-outline"
                            color={focused ? 'white':'#ae1a00'}
                            size={size}
                            style={styles.icon}
                        />
                    )
                }}/>
                <Drawer.Screen name='Login' component={StackNavigator} options={{
                    title: this.state.isLoggedIn ? 'Logout' : 'Login',
                    drawerIcon: ({ focused, size }) => (
                        <Ionicons
                            name={this.state.isLoggedIn ? "log-out-outline" : "log-in-outline"}
                            color={focused ? 'white':'#ae1a00'}
                            size={size}
                            style={styles.icon}
                        />
                    )
                }}/>
            </Drawer.Navigator>
        )
    }
}

const styles = StyleSheet.create({
    icon: {
        marginRight: -15
    }
})