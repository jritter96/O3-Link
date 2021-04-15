Folder Structure:
	
    ./CloudServer
    	All code and dependencies associated with the cloud server exist within this folder
    ./MobileApp
    	All code and dependencies associated with the application exist within this folder
		./components contains Classes used by the display
		./screens contains all the main top level code for the application display

Build Tools:
    
    React Native version 7.6.0
    Gradle 3.5.3
    buildToolsVersion = "29.0.2"
    minSdkVersion = 18
    compileSdkVersion = 29
    targetSdkVersion = 29
    supportLibVersion = "28.0.0"
    googlePlayServicesVersion = "11.8.0"
    androidMapsUtilsVersion = "0.5+"
    See ./MobileApp/android/build.gradle for more info

Packages Used:
    
    See ./CloudServer/package.json
    See ./MobileApp/package.json
    If building new project, need to set up react-native-vector-icons after installation:
    	Android:
    		1. Create assets/fonts directory in android/app/src/main
            	2. Once you create the fonts directory copy all the font files from node_modules/react-native-vector-icons/Fonts into it
    	iOS:
            	4. Create a fonts directory in ios and copy all the font files from node_modules/react-native-vector-icons/Fonts into it
            	5. Now open the project YourProject -> ios -> YourProject.xcworkspace in Xcode.
            	6. After opening the project in Xcode click on the project from the left sidebar to open the options and select Add Files to “YourProjectName”
            	7. Select the fonts directory which you have created. Remember to select Create Folder references from below and click Add
            	8. Now click the project name on the left top, and select the project name on TARGETS. Click the Info tab on the top menu to see Info.plist and add Fonts provided by application and font files under it.

Build Instructions:
    
    1. Plug Android device into computer (Make sure it has USB debugging allowed)
    2. From MobileApp folder
    3. Run following command “npm run android”
    4. App will build and boot to mobile device
    
	The app can also be run on an emulator but position tracking will not work as a bluetooth chip is required

Hub Setup:
    
    1. Connect hub to network via ethernet cable
    2. Add the hub endpoint to the server so that data can be passed using MQTT

Adding hubs to the database:

    Option 1:
    	Manually log into the database and insert the parameters into the hub_info/protected_hubs tables depending on the need
    Option 2:
    	For protected hubs:
    		1. In Postman select POST request
    		2. Enter “{serverUrl}/api/restricted_hubs” as destination
    		3. In the body enter hub_id, location, whitelist, mac, measured_power, and password (prot_hub_pass), refer to example below
    		Body: {
				"hub_id": 4,
				"location": {
					"latitude": 49.1935,
					"longitude": -123.1807,
					"level": 2
				},
				"whitelist": [user_id1, user_id2,...],
				"pass": "prot_hub_pass",
				"mac": "00:16:A4:4C:DE:AF",
				"measured_power": -33
			}
    		4. Send the request
        	*If request contains already existing hub_id, it will be updated with new info

    	For public hubs:
    		1. In Postman select POST request
    		2. Enter “{serverUrl}/api/hub_info” as destination
    		3. In the body enter just hub_id, mac, measured_power and location, refer to example below:
    		Body: {
				"hub_id": 4,
				"location": {
					"latitude": 49.1935,
					"longitude": -123.1807,
					"level": 2
				},
				"mac": "00:16:A4:4C:DE:AF",
				"measured_power": -33
			}
    		4. Send the request and confirm success using response

Heroku Instructions:
    
    To redeploy: 
        1. Navigate into the directory where you want to clone the project to
        2. In the console, enter “heroku login”
        3. In the browser window, login into the account using the privately passed credentials
        4. Once you are logged in, in the console enter: “heroku git:clone -a capstonetestapi”
        5. The above will clone the project into the specified directory
        6. After making changes to the server, navigate into the capstonetestapi folder
        7. Enter “git add .” into the console
        8. Enter “git commit -m “your message”” into the console
        9. Enter “git push heroku master” into the console
        10. To verify, login to heroku and view logs for errors/status
    To turn the server on/off:
        1. Login to heroku through browser
        2. Navigate to project settings
        3. Scroll down to maintenance mode
        4. Activate/deactivate turns the server on/off 

Debug APK has been provided in this top folder
