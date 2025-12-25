import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert } from 'react-native';
import { doc, getDoc, setDoc } from 'firebase/firestore'; // Firestore functions
import { firestore } from '../screens/firebaseConfig'; // Firebase Config

export default function KidsProfileScreen({ navigation, route }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [kidCode, setKidCode] = useState('');
  const [parentId, setParentId] = useState('');  // Add parent ID state
  const [profileLoaded, setProfileLoaded] = useState(false); // To track if profile is loaded from DB
  const [profileData, setProfileData] = useState(null); // To store the profile data from Firestore
  const [loadingError, setLoadingError] = useState(null); // To track errors during loading

  useEffect(() => {
    // Ensure kidCode is available and then fetch profile data
    if (route.params?.kidCode) {
      const kidCodeFromRoute = route.params.kidCode;
      setKidCode(kidCodeFromRoute); // Initialize kidCode from route params
      console.log(`Kid code passed: ${kidCodeFromRoute}`); // Log to track kidCode
      fetchProfileData(kidCodeFromRoute); // Fetch profile data using the kidCode
    }
  }, [route.params?.kidCode]); // Trigger this effect whenever kidCode changes

  // Fetch profile data from Firestore
  const fetchProfileData = async (kidCode) => {
    try {
      const docRef = doc(firestore, 'kids', kidCode); // Reference to 'kids' collection using the kidCode
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const profileData = docSnap.data();
        setProfileData(profileData); // Store profile data
        setName(profileData.kidName || ''); // Set the name if available, otherwise empty
        setAge(profileData.kidAge ? profileData.kidAge.toString() : ''); // Set the age, ensure it’s a string
        setGender(profileData.kidGender || ''); // Set the gender if available, otherwise empty
        setParentId(profileData.parentId || ''); // Keep parentId from the Firestore document
        setProfileLoaded(true); // Set profileLoaded to true when data is fetched
        setLoadingError(null); // Reset any previous errors
        console.log('Profile data fetched:', profileData); // Log fetched data for debugging
      } else {
        setLoadingError('No profile found for this kid code');
        setProfileLoaded(true); // Stop loading even if no profile is found
      }
    } catch (error) {
      console.error('Error fetching profile data: ', error);
      setLoadingError('Failed to fetch profile data');
      setProfileLoaded(true); // Stop loading on error
    }
  };

  // Handle profile submission or update
  const handleProfileSubmit = async () => {
    // Validate age
    if (parseInt(age) < 1 || parseInt(age) > 100) {
      Alert.alert('Error', 'Age should be between 1 and 100');
      return;
    }

    // Check if all fields are filled
    if (!name || !age || !gender || !kidCode) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Create the profile data object to save
    const profileData = {
      kidName: name,
      kidAge: parseInt(age),
      kidGender: gender,
      kidCode,
      parentId, // Retain the parent's ID (important for future use)
    };

    try {
      // Save to Firestore in the 'kids' collection (using 'kidCode' as the document ID)
      await setDoc(doc(firestore, 'kids', kidCode), profileData);
      Alert.alert('Success', 'Profile submitted successfully!');
      navigation.goBack(); // Go back to the previous screen after successful submission
    } catch (error) {
      console.error('Error writing document: ', error);  // Log the error in the console for debugging
      Alert.alert('Error', 'Failed to submit profile: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <Text style={styles.title}>Edit Profile</Text>

      {/* Show loading or the form based on profile loading */}
      {!profileLoaded ? (
        <Text>Loading profile...</Text>
      ) : loadingError ? (
        // Show error if loading failed
        <View>
          <Text style={styles.errorText}>{loadingError}</Text>
          <TouchableOpacity style={styles.submitButton} onPress={() => setProfileLoaded(false)}>
            <Text style={styles.submitButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Name */}
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />

          {/* Age */}
          <TextInput
            style={styles.input}
            placeholder="Age"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />

          {/* Gender */}
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[styles.genderButton, gender === 'Male' && styles.selectedButton]}
              onPress={() => setGender('Male')}
            >
              <Text style={styles.genderText}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderButton, gender === 'Female' && styles.selectedButton]}
              onPress={() => setGender('Female')}
            >
              <Text style={styles.genderText}>Female</Text>
            </TouchableOpacity>
          </View>

          {/* Kid's Code (not editable, used for login) */}
          <TextInput
            style={styles.input}
            placeholder="Kid's Code"
            value={kidCode}
            editable={false} // Kid code is not editable, it was used at login time
          />

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleProfileSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>

          {/* Update Button (for existing profiles) */}
          {profileData && (
            <TouchableOpacity style={styles.updateButton} onPress={handleProfileSubmit}>
              <Text style={styles.submitButtonText}>Update</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1', // soft yellowish background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FF6F00', // bright orange for fun
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#FFD54F',
    borderWidth: 2,
    borderRadius: 15,
    marginBottom: 12,
    paddingLeft: 15,
    fontSize: 18,
    backgroundColor: '#FFFDE7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  genderContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-between',
    width: '100%',
  },
  genderButton: {
    padding: 12,
    borderWidth: 2,
    borderColor: '#FFB74D',
    borderRadius: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    width: '45%',
    backgroundColor: '#FFF3E0',
  },
  selectedButton: {
    backgroundColor: '#81C784', // light green for selected
    borderColor: '#388E3C',
  },
  genderText: {
    fontSize: 18,
    color: '#5D4037',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#F06292', // pink
    padding: 15,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  updateButton: {
    backgroundColor: '#64B5F6', // light blue
    padding: 15,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
    elevation: 3,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
