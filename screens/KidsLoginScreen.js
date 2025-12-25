import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Icon for the button
import { useNavigation } from '@react-navigation/native'; // For navigation
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'; // Firestore functions
import { firestore } from '../screens/firebaseConfig'; // Firebase Config

const KidsLoginScreen = () => {
  const [uniqueCode, setUniqueCode] = useState(''); // Store the code entered by the kid
  const [isButtonClicked, setIsButtonClicked] = useState(false); // Track button click state
  const [profileData, setProfileData] = useState(null); // Store profile data after login
  const [animalPosition, setAnimalPosition] = useState(new Animated.ValueXY({ x: 0, y: 0 })); // Animal movement state

  const navigation = useNavigation(); // Navigation hook

  // Function to generate a random movement for the animal
  const moveAnimal = () => {
    Animated.spring(animalPosition, {
      toValue: { x: Math.random() * 250 - 125, y: Math.random() * 250 - 125 }, // Random movement within a certain range
      useNativeDriver: true,
    }).start();
  };

  // Function to handle the login process
  const handleLogin = async () => {
    setIsButtonClicked(!isButtonClicked); // Toggle button state for visual feedback

    // Check if the unique code is empty or invalid
    if (uniqueCode.trim() === '') {
      Alert.alert("Error", "Please enter a code!");
      return;
    }

    try {
      // Check if the kidCode exists in the Firestore database, updated collection name 'kids'
      const docRef = doc(firestore, 'kids', uniqueCode); // Changed collection to 'kids'
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // If the code exists, login is successful
        const fetchedProfile = docSnap.data();
        setProfileData(fetchedProfile); // Store the profile data

        // Alert user about successful login
        Alert.alert("Success", `Login successful! Welcome, ${fetchedProfile.kidName}!`);

        // After successful login, navigate to the KidsHomeScreen
        navigation.navigate('KidsHome', { kidCode: uniqueCode }); // Pass the unique code to KidsHomeScreen
      } else {
        // If the code doesn't exist in the database, prompt to create a profile
        Alert.alert("No Profile Found", "No profile found for this code. Would you like to create one?", [
          { text: "Cancel" },
          { text: "Create Profile", onPress: createProfile },
        ]);
      }
    } catch (error) {
      console.error("Error checking code: ", error);
      Alert.alert("Error", "Failed to verify the code. Please try again.");
    }
  };

  // Function to handle profile creation (if no profile is found for the code)
  const createProfile = () => {
    // Create a default profile for this code
    const defaultProfile = {
      kidName: "New Explorer", // Default name
      kidAge: 5, // Default age
      kidGender: "Not Specified", // Default gender
      kidCode: uniqueCode, // Unique code from login
    };

    // Save this profile to Firestore, updated collection name 'kids'
    setDoc(doc(firestore, 'kids', uniqueCode), defaultProfile) // Changed collection to 'kids'
      .then(() => {
        Alert.alert("Profile Created", "A new profile has been created for you. You can now proceed.");
        // After creating the profile, navigate to KidsHome
        navigation.navigate('KidsHome', { kidCode: uniqueCode }); // Pass the newly created profile's code
      })
      .catch((error) => {
        console.error("Error creating profile: ", error);
        Alert.alert("Error", "Failed to create profile. Please try again.");
      });
  };

  // Hide the header left button (back arrow)
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => null, // This removes the back arrow
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Fun and Interactive Animal Image */}
      <Animated.View style={[styles.animalContainer, animalPosition.getLayout()]}>
        <TouchableOpacity onPress={moveAnimal}>
          <Ionicons name="paw" size={50} color="orange" /> {/* Fun animal paw icon */}
        </TouchableOpacity>
      </Animated.View>

      <Text style={styles.title}>Welcome, Little Explorer!</Text>
      <Text style={styles.subtitle}>Enter your unique code to log in.</Text>

      {/* Input Field for Unique Code */}
      <TextInput
        style={styles.codeInput}
        placeholder="Enter unique code"
        keyboardType="default" // Set keyboard type to default for the code input
        maxLength={6} // Assuming the code is a 6-digit number
        value={uniqueCode}
        onChangeText={setUniqueCode} // Update state as user types
      />

      {/* Login Button */}
      <TouchableOpacity
        style={[styles.submitButton, isButtonClicked && styles.clickedButton]}
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>Login</Text> {/* Changed Submit to Login */}
      </TouchableOpacity>

      {/* Add any other kids-friendly elements here */}
      <Text style={styles.footerText}>Tap the paw to make it move!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6', // Softer background
    padding: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#34495e',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Comic Sans MS', // You can replace with a custom fun font later
  },
  subtitle: {
    fontSize: 18,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'Comic Sans MS',
  },
  codeInput: {
    width: '80%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 12,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 15,
    borderWidth: 1.5,
    borderColor: '#ffcc00',
    elevation: 3, // Slight shadow
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  submitButton: {
    backgroundColor: '#ffb703',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  clickedButton: {
    backgroundColor: '#34c759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  animalContainer: {
    marginBottom: 25,
    backgroundColor: '#ffeaa7',
    padding: 12,
    borderRadius: 50,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
  },
  footerText: {
    fontSize: 16,
    color: '#2d3436',
    marginTop: 25,
    fontFamily: 'Comic Sans MS',
  },
});

export default KidsLoginScreen;
