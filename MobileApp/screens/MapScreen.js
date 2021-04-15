import React from 'react';
import { Platform, PermissionsAndroid, StyleSheet, View, Text } from 'react-native';
import ReadingsScreen from './ReadingsScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MapView, { Marker, Callout, Heatmap, PROVIDER_GOOGLE } from 'react-native-maps';
import { TouchableOpacity } from 'react-native-gesture-handler';
import axios from 'axios';
import { BleManager, ScanMode } from 'react-native-ble-plx';

const PositionTracker = require('../components/PositionTracking.js');
var positionTracker = new PositionTracker()

export default class MapScreen extends React.PureComponent {

	state = {
		sensors: [],
		userLocation: { latitude: 49.19476, longitude: -123.18142 },
		levels: [],
		selectedLevel: 0,
		manager: new BleManager(),
		tracking: false,
		key: '',
		token: ''
	}

	componentDidMount() {
		if (Platform.OS === 'android' && Platform.Version >= 23) {
			PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
				if (result) {
				  console.log("Permission is OK");
				} else {
				  PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
					if (result) {
					  console.log("User accept");
					} else {
					  console.log("User refuse");
					}
				  });
				}
		  });
		}
		
		this.timerID = setInterval(
			() => this.updateSensors(),
			2000
		);
	}

	componentWillUnmount() {
		clearInterval(this.timerID);
	}

	/**
	 * Manages device bluetooth scanning startup and logic associated 
	 * with found devices
	 * 
	 * Compares retrieved signals to hubs obtained from database to decide
	 * whether a user position should be calculated from the signal or not
	 * This ensures only O3 sensor hubs are used for position tracking
	 */
	 scanAndConnect() {
		const {manager} = this.state;
		let scanOptions = { scanMode: ScanMode.LowLatency };	// Use highest frequency scanning mode

		console.log('------------------------ STARTING SCAN ------------------------');

		manager.startDeviceScan(null, scanOptions, (error, device) => {
			if (error) {
				console.log("------------------------ BLUETOOTH SCAN ERROR ------------------------");
				console.log(error);
				// Handle error (scanning will be stopped automatically)
				return
			}

			// Reference device id with each hub id
			this.state.sensors.forEach( (hub) => {
				if (hub.mac == device.id) {
					console.log('\n');
					console.log('PROCESSING DEVICE ID: ' + device.id);
					
					var newPosition = positionTracker.Update(device.id, device.rssi, hub.location, hub.measured_power);

					if (newPosition) {
						console.log('NEW USER POSITION IS: lat ' + newPosition.latitude + ' long ' + newPosition.longitude + '\n');
						
						// Update user location and state information
						this.setState({
							userLocation: { 
								latitude: newPosition.latitude,
								longitude: newPosition.longitude
							}
						});
					}
				}
			});
		});
		this.setState({
			tracking: true
		});
	}

	/**
	 * Stops device bluetooth scanning
	 */
	stopScanning() {
		console.log('------------------------ STOPPING SCAN ------------------------');

		const {manager} = this.state;
		manager.stopDeviceScan();
		this.setState({
			tracking: false
		});
	}

	toggleTracking() {
		if(this.state.tracking) {
			this.stopScanning();
		} 
		else {
			this.scanAndConnect();
			this.map.animateToRegion({
				latitude: this.state.userLocation.latitude,
				longitude: this.state.userLocation.longitude,
				latitudeDelta: 0.001,
				longitudeDelta: 0.0004
			})
		}
	}

	/**
	 * Gets all protected and non-protected hubs and sets their state data to the present values from the sensors
	 */
	async updateSensors() {
		var sensors = [];
		try {
            if (this.props.route.params != undefined && this.props.route.params.auth != undefined && this.props.route.params.auth != null)
            {
                if (this.props.route.params.auth == 'LOGOUT')
                {
                    this.setState({
                        key: '',
                        token: ''
                    })
					this.props.route.params.loginHandler(false);
                }
                else
                {
                    this.setState({
                        key: this.props.route.params.auth.key,
                        token: this.props.route.params.auth.token
                    });
                    this.props.route.params.auth = null;
					this.props.route.params.loginHandler(true);
                }
                this.props.route.params.auth = null;
                if (this.props.route.params.handler != undefined && this.props.route.params.handler != null)
                {
                    this.props.route.params.handler();
                    this.props.route.params.handler = null;
                }
            }
			const nonprotectedhubs = await axios.get('https://capstonetestapi.herokuapp.com/api/hub_info');
            var hubList = nonprotectedhubs.data;
            if (this.state.token && this.state.key)
            {
                const token = this.state.token;
                const key = this.state.key;
                const config = {
                    headers: {
                        "Content-type": "application/json",
                        "x-auth-token": token
                    }
                };
                const body = JSON.stringify({key});
                const protectedhubs = await axios.post('https://capstonetestapi.herokuapp.com/api/restricted_hubs', body, config);
                if (protectedhubs.data != "User has no additional access...")
                {
                    if (hubList.length != 0)
                    {
                        hubList = hubList.concat(protectedhubs.data);
                    }
                    else hubList = protectedhubs.data;
                }
            }
			for (var i = 0; i < hubList.length; i++) {
				var sensor = {};

				const hubinfo = hubList[i];
				const readings = await axios.get('https://capstonetestapi.herokuapp.com/api/readings/' + hubinfo.hub_id);
				if (readings == undefined || readings.data == undefined || readings.data.readings == undefined) continue;
				sensor.hub_id = hubinfo.hub_id;
				sensor.location = hubinfo.location;
				sensor.temp = readings.data.readings.irTemperature.Present_Value;
				sensor.sound = readings.data.readings.soundLevel.Present_Value;
				sensor.light = readings.data.readings.lightLevel.Present_Value;
				sensor.humidity = readings.data.readings.occupantHumidity.Present_Value;
				sensor.mac = hubinfo.mac;
				sensor.measured_power = hubinfo.measured_power;

				sensors.push(sensor);
			};
			this.setState({sensors: sensors});
		} catch (err) {
            if (err.response != undefined && err.response.data != undefined)
            {
                const errMsg = err.response.data.msg;
                console.log(errMsg);
                alert("Error: " + errMsg);
            }
            else
            {
                console.log(err);
                alert('Network error');
            }
		}
	}

	handleIndoorFocus(event) {
		const { IndoorBuilding } = event.nativeEvent;
		const { activeLevelIndex, levels } = IndoorBuilding;
		const levelNames = levels.map(lv => lv.name || '');
		this.setState({
			levels: levelNames,
			selectedLevel: levelNames.length - activeLevelIndex
		})
	}

	setIndoorLevel(level) {
		this.map.setIndoorActiveLevelIndex(level);
	}

	handleLevelFocus(event) {
		const { IndoorLevel } = event.nativeEvent;
		const selectedLevel = IndoorLevel.name;
		this.setState({selectedLevel: selectedLevel})
	}

	render() {
		let temp = [0, 40]; //initial Min to Max temp value
		let sound = [0, 100]; //initial Min to Max sound intensity
		let light = [0, 300]; //initial Min to Max light value
		let humidity = [0, 100]; //initial Min to Max humidity intensity
		if (this.props.route.params != undefined && this.props.route.params.temp != undefined) {
            temp = this.props.route.params.temp;
            sound = this.props.route.params.sound;
            light = this.props.route.params.light;
            humidity = this.props.route.params.humidity;
		}
		const markers = this.state.sensors.map((sensor, index) => {
			if (
				this.state.selectedLevel == sensor.location.level &&
				sensor.temp >= temp[0] && sensor.temp <= temp[1] &&
				sensor.sound >= sound[0] && sensor.sound <= sound[1] &&
				sensor.light >= light[0] && sensor.light <= light[1] &&
				sensor.humidity >= humidity[0] && sensor.humidity <= humidity[1]
			)
				return <Marker
					key={index}
					style={styles.marker}
					coordinate={sensor.location}>
					<Callout tooltip style={styles.callout}>
						<ReadingsScreen
							temp={sensor.temp}
							sound={sensor.sound}
							light={sensor.light}
							humidity={sensor.humidity}>
						</ReadingsScreen>
					</Callout>
				</Marker>
		});

		const heatmarkers = this.state.sensors.map((sensor, index) => {
			if (this.state.selectedLevel == sensor.location.level)
				return <Heatmap
					key={index}
					points={[{
						latitude: sensor.location.latitude,
						longitude: sensor.location.longitude,
						weight: 1
					}]}
					radius={sensor.temp < 10 ? 10 : sensor.temp > 40 ? 40 : sensor.temp}
				>
				</Heatmap>
		});

		var position = null;
		if (this.state.tracking){
			position =  <Marker
				style={styles.marker}
				coordinate={this.state.userLocation}>
				<Ionicons name={'ellipse'} size={20} color='#4A89F3' />
			</Marker>
		}

		const levels = this.state.levels.map((level, index) =>
			<TouchableOpacity
				key={index}
				style={this.state.selectedLevel == level ? {backgroundColor: 'rgba(255,99,71,0.7)', borderRadius: 15, paddingTop: 5, paddingBottom: 5} : {borderRadius: 15, paddingTop: 5, paddingBottom: 5}}
				onPress={() => this.setIndoorLevel(this.state.levels.length - level)}>
				<Text style={styles.level}>
					{level}
				</Text>
			</TouchableOpacity>
		);

		return (
			<View style={styles.container}>
				<MapView
					ref={map => this.map = map}
					provider={PROVIDER_GOOGLE}
					style={styles.map}
					initialRegion={{
						latitude: 49.1967,
						longitude: -123.1815,
						latitudeDelta: 0.009,
						longitudeDelta: 0.009,
					}}
					
					showsCompass={true} //Enable compass
					showsIndoorLevelPicker={false} //Enable indoor level picker
					showsBuildings={true} //Shows buildings in 3d
					onIndoorBuildingFocused={event => this.handleIndoorFocus(event)}
					onIndoorLevelActivated={event => this.handleLevelFocus(event)}
					//showsUserLocation={true}
					//showsMyLocationButton={true}
					>
					
					{position}
					{markers}
					{heatmarkers}
				</MapView>

				<View style={styles.menu}>

					<TouchableOpacity
						onPress={() => this.props.navigation.toggleDrawer()}>
						<Ionicons
							name="menu-outline"
							color="black"
							size={40}
						/>
					</TouchableOpacity>

					<View style={styles.levelContainer}>
						{levels}
					</View>
				</View>

				<View style={styles.ble}>
					<TouchableOpacity
						onPress={() => this.toggleTracking()}>
						<Ionicons
							name="navigate-circle"
							color={this.state.tracking == true ? 'tomato' : 'silver'}
							size={65}
						/>
					</TouchableOpacity>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		height: '100%',
		width: '100%',
		flexDirection: 'row-reverse',
		justifyContent: 'flex-start'
	},
	map: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	menu: {
		top: 5
	},
	ble: {
		position: 'absolute',
		justifyContent: 'flex-end',
		top: 50,
		bottom: 5
	},
	levelContainer: {
		marginTop: 10,
		right: 2,
		backgroundColor: 'rgba(232, 236, 241, 0.8)',
		borderRadius: 15,
		zIndex: 10, // works on ios
  		elevation: 10, // works on android
	},
	level: {
		fontSize: 20,
		alignSelf: 'center'
	},
	marker: {
		alignItems: 'center'
	},
	callout: {
		borderRadius: 18
	}
});