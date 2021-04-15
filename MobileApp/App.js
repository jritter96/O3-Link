import 'react-native-gesture-handler';
import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from './components/TabNavigator'

export default class App extends React.Component {

	render() {
		return (
			<NavigationContainer>
				<TabNavigator />
			</NavigationContainer>
		);
	}
}
