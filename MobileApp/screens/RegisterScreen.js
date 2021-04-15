import React from 'react';
import { Keyboard, LogBox, View, Text, Image, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state', // ignores a warning that is not relevant to the project
]);

export default class RegisterScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password1: '',
            password2: '',
            error: ''
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.renderError = this.renderError.bind(this);
        this.renderRegisterButton = this.renderRegisterButton.bind(this);
        this.handleMapNav = this.handleMapNav.bind(this);
        this.checkPassword = this.checkPassword.bind(this);
        this.usernameTextInput;
        this.password1TextInput;
        this.password2TextInput;
    }

    handleSubmit() {
        Keyboard.dismiss();
        if (!this.checkPassword())
        {
            this.setState({
                password1: '',
                password2: '',
                error: 'Password must contain at least 8 characters and 1 number'
            });
            this.password1TextInput.clear();
            this.password2TextInput.clear();
        }
        else if (this.state.password1 != this.state.password2)
        {
            this.setState({
                password1:  '',
                password2: '',
                error: 'Passwords must match'
            });
            this.password1TextInput.clear();
            this.password2TextInput.clear();
        }
        else
        {
            const name = this.state.username;
            const username = this.state.username;
            const password = this.state.password1
            const body = JSON.stringify({name,username,password});
            const config = {headers: {"Content-type": "application/json"}};
            axios.post('https://capstonetestapi.herokuapp.com/api/users', body, config)
                .then(res => {
                    this.setState({
                        username: '',
                        password1: '',
                        password2: '',
                        error: ''
                    });
                    if (this.props.route.params.handler != undefined && this.props.route.params.handler != null)
                    {
                        this.props.route.params.handler();
                        this.props.route.params.handler = null;
                    }
                    this.props.navigation.navigate('Map', {
                        screen: 'Map',
                        handler: this.handleMapNav,
                        auth: {
                            key: res.data.user.key,
                            token: res.data.token
                        }
                    });
                })
                .catch(err => {
                    if (err.response.data.msg == "User already exists in the database")
                    {
                        this.setState({
                            username: '',
                            error: 'User already exists'
                        });
                        this.usernameTextInput.clear();
                    }
                    else if (err.response != undefined && err.response.data != undefined)
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
                });
        }
    }

    checkPassword()
    {
        if (this.state.password1.match(/\d+/) && this.state.password1.match(/\w{8,}/))
        {
            return true;
        }
        return false;
    }

    handleMapNav()
    {
        this.props.navigation.goBack();
    }

    renderError()
    {
        if (this.state.error)
        {
            if (this.state.error.length > 50)
            {
                return (
                    <View>
                        <Text style={styles.error}>{this.state.error}</Text>
                    </View>
                );
            }
            else return (<Text style={styles.error}>{this.state.error}</Text>);
        }
        else return null;
    }

    renderRegisterButton()
    {
        if (this.state.username && this.state.password1 && this.state.password2)
        {
            return (
                <TouchableOpacity style={styles.registerButton}
                    onPress={this.handleSubmit}>
                    <Text style={styles.registerText}>Register</Text>
                </TouchableOpacity>
            );
        }
        else
        {
            return (
                <View style={styles.unavailableRegisterButton}>
                    <Text style={styles.registerText}>Register</Text>
                </View>
            );
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.backButton}>
                    <Ionicons
                        name="arrow-back-outline"
                        color="black"
                        size={40}
                        onPress={() => { this.props.navigation.goBack() }}
                    />
                </View>
                <Image
                    style={styles.logo}
                    source={require('../assets/DeltaControls.jpg')}
                />
                <View style={styles.inputView}>
                    <TextInput
                        ref={input => {this.usernameTextInput = input}}
                        style={styles.inputText}
                        placeholder="Username"
                        secureTextEntry={(this.state.username.length <= 0) ? true : false}
                        placeholderTextColor="black"
                        onChangeText={text => this.setState({ username: text })} />
                </View>
                <View style={styles.inputView}>
                    <TextInput
                        ref={input => {this.password1TextInput = input}}
                        style={styles.inputText}
                        placeholder="Password"
                        secureTextEntry
                        placeholderTextColor="black"
                        onChangeText={text => this.setState({ password1: text })} />
                </View>
                <View style={styles.inputView}>
                    <TextInput
                        ref={input => {this.password2TextInput = input}}
                        style={styles.inputText}
                        placeholder="Confirm Password"
                        secureTextEntry
                        placeholderTextColor="black"
                        onChangeText={text => this.setState({ password2: text })} />
                </View>
                <this.renderError/>
                <this.renderRegisterButton/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center'
    },
    backButton:{
        position: 'absolute',
        top: 5,
        left: 5
    },
    logo: {
        position: 'relative',
        marginBottom: 30
    },
    inputView: {
        width: "80%",
        borderRadius: 10,
        height: 50,
        marginBottom: 20,
        justifyContent: "center",
        padding: 20,
        borderBottomColor: 'tomato',
        borderBottomWidth: 2,
        borderBottomEndRadius: 2
    },
    inputText: {
        height: 50,
        color: "black",
        fontWeight: 'bold'
    },
    forgot: {
        color: "black",
        fontSize: 11
    },
    registerButton: {
        width: "80%",
        backgroundColor: "tomato",
        borderRadius: 10,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 40,
        marginBottom: 15
    },
    unavailableRegisterButton: {
        width: "80%",
        backgroundColor: "grey",
        borderRadius: 10,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 40,
        marginBottom: 15
    },
    registerText: {
        color: 'white'
    },
    error: {
        color: "red",
        fontSize: 13
    },
});
