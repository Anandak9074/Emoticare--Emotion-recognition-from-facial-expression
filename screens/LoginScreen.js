import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert, ImageBackground, ActivityIndicator, BackHandler } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; // Firebase Authentication
import { firebaseAuth } from '../screens/firebaseConfig'; // Firebase Auth instance
import { getFirestore, doc, getDoc } from 'firebase/firestore'; // Firestore to fetch additional user data

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState(''); // Username or Email input
  const [password, setPassword] = useState(''); // Password input
  const [loading, setLoading] = useState(false); // Loading spinner state
  const [userName, setUserName] = useState(''); // User's name for display

  // Override the back button behavior to navigate to the Home screen
  useEffect(() => {
    const backAction = () => {
      navigation.navigate('Home');
      return true; // Prevent default back action
    };

    // Add event listener for hardware back button
    BackHandler.addEventListener('hardwareBackPress', backAction);

    // Clean up the event listener when the component is unmounted
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backAction);
    };
  }, [navigation]);

  // Remove the back arrow from the header but retain its functionality
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => null, // This removes the back arrow from the header
    });
  }, [navigation]);

  const handleLogin = async () => {
    if (username === '' || password === '') {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      const auth = getAuth(); // Get Firebase Auth instance
      const userCredential = await signInWithEmailAndPassword(auth, username, password); // Sign in with Firebase Authentication
      const user = userCredential.user;

      if (user) {
        setLoading(false); // Hide loading spinner after successful login

        // Fetch additional user data from Firestore (if applicable)
        const db = getFirestore();
        const userDocRef = doc(db, 'users', user.uid); // Assuming user data is stored in 'users' collection
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const fetchedUserName = userData.name || user.displayName || 'User'; // Fallback to Firebase displayName if available
          setUserName(fetchedUserName); // Set the user name state

          // Success message via popup alert with user's name
          Alert.alert('Success', `Login successful! Welcome ${fetchedUserName}`);

          // Navigate to GrownUpHome directly after login
          navigation.navigate('GrownUpHome');
        } else {
          // In case no user data is found in Firestore
          Alert.alert('Error', 'User data not found');
        }
      }
    } catch (error) {
      setLoading(false);
      console.log('Login error:', error); // Debugging the error

      // Handle different Firebase errors
      if (error.code === 'auth/invalid-email') {
        Alert.alert('Error', 'Invalid email address');
      } else if (error.code === 'auth/wrong-password') {
        Alert.alert('Error', 'Incorrect password');
      } else if (error.code === 'auth/user-not-found') {
        Alert.alert('Error', 'No user found with this email');
      } else {
        Alert.alert('Error', 'Login failed. Please try again.');
      }
    }
  };

  return (
    <ImageBackground
      source={require('../assets/login.png')} // Add a nice background image
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Emoticare</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Show loading spinner while authenticating */}
        {loading ? (
          <ActivityIndicator size="large" color="#ffffff" style={styles.loading} />
        ) : (
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        )}

        {/* Display Welcome message if userName is available */}
        {userName && (
          <Text style={styles.welcomeMessage}>Welcome {userName}!</Text>
        )}

        <View style={styles.bottomContainer}>
          {/* Navigate to SignUp Screen */}
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.linkText}>Don't have an account?</Text>
          </TouchableOpacity>

          {/* Navigate to Forgot Password Screen */}
          <TouchableOpacity onPress={() => navigation.navigate('ForgottenPassword')}>
            <Text style={styles.linkText}>   Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EAF0F6', // Soft, calming background
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 30,
    borderRadius: 20,
    width: '88%',
    maxWidth: 420,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'sans-serif-medium',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#D6DCE5',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 18,
    paddingLeft: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#34495E',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#4A90E2', // Friendly yet trustworthy blue
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  welcomeMessage: {
    fontSize: 16,
    color: '#2C3E50',
    marginTop: 18,
    fontStyle: 'italic',
  },
  bottomContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 22,
  },
  linkText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  loading: {
    marginVertical: 20,
  },
});
