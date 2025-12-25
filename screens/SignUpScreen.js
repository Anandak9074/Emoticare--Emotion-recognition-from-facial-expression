import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert, ImageBackground, Animated, BackHandler } from 'react-native';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'; // Firebase Auth
import { getFirestore, doc, setDoc, collection } from 'firebase/firestore'; // Firestore
import { auth, firestore } from '../screens/firebaseConfig'; // Firebase Config
import CryptoJS from 'crypto-js'; // Import CryptoJS for hashing

// Function to generate a random unique code for kids (6 characters long)
const generateUniqueCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Function to hash data (username and password) using SHA-256
const hashData = (data) => {
  try {
    const hashedData = CryptoJS.SHA256(data).toString(CryptoJS.enc.Base64); // Hash the data and convert to Base64
    return hashedData;
  } catch (error) {
    console.error("Error during hashing:", error);
    return null;
  }
};

// Function to check password strength
const checkPasswordStrength = (password) => {
  const lengthCriteria = password.length >= 8; // Minimum 8 characters
  const uppercaseCriteria = /[A-Z]/.test(password); // At least one uppercase letter
  const lowercaseCriteria = /[a-z]/.test(password); // At least one lowercase letter
  const numberCriteria = /\d/.test(password); // At least one number
  const specialCharCriteria = /[!@#$%^&*(),.?":{}|<>]/.test(password); // At least one special character

  const score = [lengthCriteria, uppercaseCriteria, lowercaseCriteria, numberCriteria, specialCharCriteria].filter(Boolean).length;

  if (score === 5) {
    return 'Strong';
  } else if (score === 4) {
    return 'Medium';
  } else if (score === 3) {
    return 'Weak';
  } else {
    return 'Very Weak';
  }
};

export default function SignUpScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [kids, setKids] = useState([]); // Array to store kids unique codes
  const [passwordStrength, setPasswordStrength] = useState(''); // State to store password strength
  const [progress, setProgress] = useState(new Animated.Value(0)); // Animated value for the progress bar

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

  const handleSignUp = async () => {
    if (!username || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      // Step 1: Register the user (parent) with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Step 2: Hash the username and password before storing them in Firestore
      const hashedUsername = hashData(username);
      const hashedPassword = hashData(password);

      // Step 3: Store parent user data in Firestore (under 'users' collection)
      const userRef = doc(firestore, 'users', user.uid); // Create a document using user UID in 'users' collection
      await setDoc(userRef, {
        username: hashedUsername, // Store hashed username
        email,
        phone,
        password: hashedPassword, // Store hashed password
        kids, // Store kids' unique codes if applicable
      });

      // Step 4: Store kids' data in the 'kids' collection if the user selects to register kids
      if (kids.length > 0) {
        for (const kidCode of kids) {
          const kidRef = doc(collection(firestore, 'kids'), kidCode); // Create a new document using kid's code
          await setDoc(kidRef, {
            parentId: user.uid, // Link the kid to the parent using parent's user ID
            kidCode, // Store the unique kid code
            kidName: '', // Empty for now, you can add functionality for entering the kid's name
            kidAge: '', // Empty for now, you can add functionality for entering the kid's age
          });
        }
      }

      // Display a success message
      Alert.alert('Success', 'Sign-up successful!');

      // Navigate to Login screen after successful sign-up
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error signing up: ', error);
      Alert.alert('Error', 'Sign-up failed. Please try again.');
    }
  };

  const handlePasswordChange = (password) => {
    setPassword(password);
    const strength = checkPasswordStrength(password);
    setPasswordStrength(strength); // Update password strength as user types

    // Map password strength to progress bar values
    let progressValue = 0;
    if (strength === 'Strong') {
      progressValue = 1;
    } else if (strength === 'Medium') {
      progressValue = 0.66;
    } else if (strength === 'Weak') {
      progressValue = 0.33;
    } else {
      progressValue = 0;
    }

    // Animate the progress bar
    Animated.timing(progress, {
      toValue: progressValue,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  return (
    <ImageBackground
      source={{ uri: 'https://example.com/your-background-image.jpg' }} // Replace with your background image URL
      style={styles.container}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Sign Up</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Password (min: 8)"
          value={password}
          onChangeText={handlePasswordChange}
          secureTextEntry
        />
        {password && (
          <Text style={styles.passwordStrength}>{`Password Strength: ${passwordStrength}`}</Text>
        )}
        <View style={styles.progressContainer}>
          <Animated.View
            style={[ 
              styles.progressBar,
              {
                width: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: progress.interpolate({
                  inputRange: [0, 0.33, 0.66, 1],
                  outputRange: ['red', 'orange', 'yellow', 'green'],
                }),
              },
            ]}
          />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </TouchableOpacity>

        {/* Link to navigate to Login Screen */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eaf0f6', // soft formal background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlay: {
    width: '100%',
    backgroundColor: '#ffffffee',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 25,
  },
  input: {
    width: '100%',
    height: 52,
    borderWidth: 1,
    borderColor: '#ced6e0',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#2f3542',
  },
  passwordStrength: {
    alignSelf: 'flex-start',
    fontSize: 14,
    color: '#57606f',
    marginBottom: 8,
  },
  progressContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#dfe4ea',
    borderRadius: 5,
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  signUpButton: {
    width: '100%',
    backgroundColor: '#2e86de',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  signUpButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  bottomContainer: {
    marginTop: 10,
  },
  linkText: {
    fontSize: 15,
    color: '#2e86de',
    textDecorationLine: 'underline',
  },
});
