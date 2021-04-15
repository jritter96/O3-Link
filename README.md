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
