import React from 'react';
import { Image, Keyboard, LogBox, StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state', // ignores a warning that is not relevant to the project
]);

export default class LoginScreen extends React.Component {

    constructor(props)
    {
        super(props);
        this.state = {
            username: '',
            password: '',
            isInvalid: false,
            isLoggedIn: false
        };
        this.handleLogin = this.handleLogin.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
        this.handleRegister = this.handleRegister.bind(this);
        //this.handleReset = this.handleReset.bind(this);
        this.renderInvalidMsg = this.renderInvalidMsg.bind(this);
        this.renderLoginButton = this.renderLoginButton.bind(this);
        this.renderScreen = this.renderScreen.bind(this);
        this.passwordTextInput;
    }

    handleLogin()
    {
        Keyboard.dismiss();
        this.passwordTextInput.clear();
        const username = this.state.username;
        const password = this.state.password;
        const body = JSON.stringify({username,password});
        const config = {headers:{"Content-type": "application/json"}};
        axios.post('https://capstonetestapi.herokuapp.com/api/auth', body, config)
            .then(res => {
                this.setState({
                    username: '',
                    password: '',
                    isInvalid: false,
                    isLoggedIn: true,
                });
                this.props.navigation.navigate('Map', {
                    screen: 'Map',
                    auth: {
                        key: res.data.user.key,
                        token: res.data.token
                    }
                });
            })
            .catch(err => {
                if ((err != undefined && err.response != undefined && err.response.data != undefined) && (err.response.data.msg == "Incorrect username or password" || err.response.data.msg == "User does not exist.")) this.setState({ isInvalid:true });
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

    handleLogout()
    {
        this.setState({ isLoggedIn: false });
        this.props.navigation.navigate('Map', {
            screen: 'Map',
            auth: 'LOGOUT',
        });
    }

    handleRegister()
    {
        this.setState({ isLoggedIn: true });
    }
/*
    handleReset()
    {
        console.log("in handleReset");
    }
*/
    renderInvalidMsg()
    {
        if (this.state.isInvalid) return (<Text style={styles.invalid}>Invalid Username or Password</Text>);
        else return null;
    }

    renderLoginButton()
    {
        if (this.state.username && this.state.password)
        {
            return (
                <TouchableOpacity style={styles.loginButton}
                    onPress={this.handleLogin}>
                    <Text style={styles.loginText}>LOGIN</Text>
                </TouchableOpacity>
            );
        }
        else
        {
            return (
                <View style={styles.unavailableLoginButton}>
                    <Text style={styles.loginText}>LOGIN</Text>
                </View>
            );
        }
    }

    renderScreen()
    {
        if (this.state.isLoggedIn)
        {
            return (
                <View style={styles.container}>
                    <View style={styles.menu}>
                        <Ionicons
                            name="menu-outline"
                            color="black"
                            size={40}
                            onPress={() => { this.props.navigation.toggleDrawer() }}
                        />
                    </View>
                    <Image
                        style={styles.logo}
                        source={require('../assets/DeltaControls.jpg')}
                    />
                    <TouchableOpacity style={styles.loginButton}
                        onPress={this.handleLogout}>
                        <Text style={styles.loginText}>LOGOUT</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        else
        {
            return (
                <View style={styles.container}>
                    <View style={styles.menu}>
                        <Ionicons
                            name="menu-outline"
                            color="black"
                            size={40}
                            onPress={() => { this.props.navigation.toggleDrawer() }}
                        />
                    </View>
                    <Image
                        style={styles.logo}
                        source={require('../assets/DeltaControls.jpg')}
                    />
                    <View style={styles.inputView}>
                        <TextInput
                            style={styles.inputText}
                            placeholder="Username"
                            secureTextEntry={(this.state.username.length <= 0) ? true : false}
                            placeholderTextColor="black"
                            onChangeText={text => this.setState({ username: text })} />
                    </View>
                    <View style={styles.inputView}>
                        <TextInput
                            ref={input => {this.passwordTextInput = input}}
                            style={styles.inputText}
                            placeholder="Password"
                            secureTextEntry
                            placeholderTextColor="black"
                            onChangeText={text => this.setState({ password: text })} />
                    </View>
                    {/*
                    <TouchableOpacity
                        onPress={this.handleReset}>
                        <Text style={styles.forgot}>Forgot Password?</Text>
                    </TouchableOpacity>
                    */}
                    <this.renderInvalidMsg/>
                    <this.renderLoginButton/>
                    <TouchableOpacity
                        onPress={() => {this.props.navigation.navigate('Register', {
                            screen: 'Register',
                            handler: this.handleRegister
                        })}}>
                        <Text style={styles.registerText}>Signup</Text>
                    </TouchableOpacity>
                </View>
            );
        }
    }

    render() {
        return (
            <this.renderScreen/>
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
    menu:{
        position: 'absolute',
        top: 5,
        right: 5
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
    invalid: {
        color: "red",
        fontSize: 13
    },
    loginButton: {
        width: "80%",
        backgroundColor: "tomato",
        borderRadius: 10,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 40,
        marginBottom: 15
    },
    unavailableLoginButton: {
        width: "80%",
        backgroundColor: "grey",
        borderRadius: 10,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 40,
        marginBottom: 15
    },
    loginText: {
        color: 'white'
    },
    registerText: {
        color: 'black'
    }
});
