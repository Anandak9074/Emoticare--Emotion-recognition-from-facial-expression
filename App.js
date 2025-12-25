import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import your screen components
import SignUpScreen from './screens/SignUpScreen';
import LoginScreen from './screens/LoginScreen';
import ForgottenPasswordScreen from './screens/ForgottenPasswordScreen'; 
import HomeScreen from './screens/HomeScreen';  // Import the HomeScreen
import KidsHomeScreen from './screens/KidsHomeScreen';
import KidsDashboardScreen from './screens/KidsDashboardScreen';
import ParentsHomeScreen from './screens/ParentsHomeScreen';  
import GrownUpHomeScreen from './screens/GrownUpHomeScreen';
import KidsSettingsScreen from './screens/KidsSettingsScreen';
import KidsProfileScreen from './screens/KidsProfileScreen';
import AlertParentsScreen from './screens/AlertParentsScreen';
import KidsLogHistoryScreen from './screens/KidsLogHistoryScreen';
// Parents Settings and Profile Screens
import ParentsSettingsScreen from './screens/ParentsSettingsScreen';
import SwitchProfileScreen from './screens/SwitchProfileScreen';  
import GrownUpProfileScreen from './screens/GrownUpProfileScreen';  

// Support Screen (new)
import SupportScreen from './screens/SupportScreen';

// Calming Tools Screen (new)
import CalmingToolsScreen from './screens/CalmingToolsScreen';
// Grown Up History Screen (new)
import GrownUpHistoryScreen from './screens/GrownUpHistoryScreen';

// Import the KidsLoginScreen
import KidsLoginScreen from './screens/KidsLoginScreen';  // Import KidsLoginScreen

// Import the new MonitorEmotionScreen
import MonitorEmotionScreen from './screens/MonitorEmotionScreen';  // Added the MonitorEmotionScreen

// Correct import for the Emotion Screen
import Emotion from './screens/Emotion';  // Corrected the import for Emotion

// Import the SetScreenTimeScreen
import SetScreenTimeScreen from './screens/SetScreenTimeScreen';  // Added the SetScreenTimeScreen

// Import the new AlertPage Screen
import AlertPage from './screens/AlertPage';  // Import the AlertPage screen

// Import the AppRestrictionScreen (Added import)
import AppRestrictionScreen from './screens/AppRestrictionScreen'; // New screen for app restrictions

// Import the EncryptionExample Screen
import GrownUpNotification from './screens/GrownUpNotification'; // Import the GrownUpNotification component
import KidsEmotion from './screens/KidsEmotion'; // Import the KidsEmotion component

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        
        {/* Home Screen */}
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}  // Set HomeScreen as the initial screen
          options={{ title: 'Home' }} 
        /> 

        {/* Authentication Screens */}
        <Stack.Screen 
          name="SignUp" 
          component={SignUpScreen} 
          options={{ title: 'Sign Up' }} 
        /> 
        <Stack.Screen 
          name="ForgottenPassword" 
          component={ForgottenPasswordScreen}
          options={{ title: 'Forgotten Password' }} 
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ title: 'Login' }} 
        /> 

        {/* Kids Login Screen */}
        <Stack.Screen 
          name="KidsLogin" 
          component={KidsLoginScreen} // Added the KidsLoginScreen
          options={{ title: 'Kids Login' }} 
        /> 
        
        {/* Kids Screens */}
        <Stack.Screen 
          name="KidsHome" 
          component={KidsHomeScreen} 
          options={{ title: 'Kids Home' }} 
        />
        <Stack.Screen 
          name="KidsDashboard" 
          component={KidsDashboardScreen} 
          options={{ title: 'Kids Dashboard' }} 
        /> 
        <Stack.Screen 
          name="KidsSettings" 
          component={KidsSettingsScreen} 
          options={{ title: 'Kids Settings' }} 
        /> 
        <Stack.Screen 
          name="KidsProfile" 
          component={KidsProfileScreen} 
          options={{ title: 'Kids Profile' }} 
        /> 
        <Stack.Screen 
          name="AlertParents" 
          component={AlertParentsScreen} 
          options={{ title: 'Alert Parents' }} 
        />
        <Stack.Screen 
          name="KidsLogHistory" 
          component={KidsLogHistoryScreen} 
          options={{ title: 'Kids Log History' }} 
        />
        {/* Parents Screens */}
        <Stack.Screen 
          name="ParentsHome" 
          component={ParentsHomeScreen} 
          options={{ title: 'Parents Home' }} 
        />
        
        {/* Parents Settings and Profile */}
        <Stack.Screen 
          name="ParentsSettings" 
          component={ParentsSettingsScreen} 
          options={{ title: 'Parents Settings' }} 
        /> 
        <Stack.Screen 
          name="SwitchProfile" 
          component={SwitchProfileScreen} 
          options={{ title: 'Switch Child Profile' }} 
        />

        {/* Grown Up Screens */}
        <Stack.Screen 
          name="GrownUpHome" 
          component={GrownUpHomeScreen} 
          options={{ title: 'Grown Up Home' }} 
        /> 

        {/* Grown Up Profile Screen */}
        <Stack.Screen 
          name="GrownUpProfile" 
          component={GrownUpProfileScreen}  
          options={{ title: 'Grown Up Profile' }} 
        />
        <Stack.Screen 
          name="GrownUpHistory" 
          component={GrownUpHistoryScreen} 
          options={{ title: 'Grown Up History' }} 
        /> 

        {/* Support Screen */}
        <Stack.Screen 
          name="Support" 
          component={SupportScreen} 
          options={{ title: 'Support' }} 
        /> 

        {/* Calming Tools Screen */}
        <Stack.Screen 
          name="CalmingTools" 
          component={CalmingToolsScreen} 
          options={{ title: 'Calming Tools' }} 
        />

        {/* Add the new Monitor Emotion Screen */}
        <Stack.Screen 
          name="MonitorEmotion" 
          component={MonitorEmotionScreen} 
          options={{ title: 'Monitor Kid\'s Emotion' }} 
        /> 

        {/* Add the Set Screen Time Screen */}
        <Stack.Screen 
          name="SetScreenTime" 
          component={SetScreenTimeScreen}  // Added SetScreenTimeScreen
          options={{ title: 'Set Screen Time' }} 
        /> 
        
        {/* Add the new Alert Page Screen */}
        <Stack.Screen 
          name="AlertPage" 
          component={AlertPage}  // Added AlertPage screen
          options={{ title: 'Alert Page' }} 
        /> 
        
        {/* Add the new App Restriction Screen */}
        <Stack.Screen 
          name="AppRestriction" 
          component={AppRestrictionScreen}  // Added AppRestrictionScreen
          options={{ title: 'App Restrictions' }} 
        /> 

        {/* Add the new Emotion Screen */}
        <Stack.Screen 
          name="Emotion" 
          component={Emotion}  // Correct import for Emotion screen
          options={{ title: 'Emotion' }} 
        /> 
        <Stack.Screen 
          name="GrownNotification" 
          component={GrownUpNotification}  // Added AppRestrictionScreen
          options={{ title: 'Notifications' }} 
        /> 
        <Stack.Screen 
          name="KidsEmotion" 
          component={KidsEmotion}  // Added AppRestrictionScreen
          options={{ title: 'Emotion' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
