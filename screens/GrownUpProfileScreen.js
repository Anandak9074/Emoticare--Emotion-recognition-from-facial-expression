import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert } from 'react-native';
import { getAuth } from 'firebase/auth'; // Firebase Auth
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'; // Firestore
import { firestore } from '../screens/firebaseConfig'; // Firebase Config

export default function GrownUpProfileScreen({ navigation }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  const currentUser = getAuth().currentUser; // Get the current user
  const userId = currentUser?.uid; // Get the user ID (UID)
  const [currentPassword, setCurrentPassword] = useState(''); // State to store current password (do not modify it)

  // Fetch user data from Firestore when the profile screen loads
  useEffect(() => {
    if (userId) {
      const fetchUserProfile = async () => {
        try {
          const userRef = doc(firestore, 'users', userId); // Reference to the current user's document
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Populate the fields with user data
            setName(userData.name || '');
            setAge(userData.age || '');
            setGender(userData.gender || '');
            setEmail(userData.email || '');
            setPhone(userData.phone || '');
            setAddress(userData.address || '');
            setCurrentPassword(userData.password || ''); // Fetch the password from the database (do not overwrite it)
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching user data: ', error);
        }
      };

      fetchUserProfile();
    }
  }, [userId]);

  // Handle Profile Submit
  const handleProfileSubmit = async () => {
    // Validate Age (should be between 18 and 100)
    if (parseInt(age) < 18 || parseInt(age) > 100) {
      Alert.alert('Error', 'Age should be between 18 and 100');
      return;
    }

    // Validate Email (using simple regex)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Validate Phone Number (should be a valid number)
    const phoneRegex = /^[0-9]{10}$/; // A simple 10-digit number validation
    if (!phoneRegex.test(phone)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    try {
      const userRef = doc(firestore, 'users', userId); // Reference to the user's document in Firestore

      // Update user data in Firestore but preserve the password field
      await setDoc(userRef, {
        name,
        age,
        gender,
        email, // Store the email directly without encryption
        phone,
        address,
        password: currentPassword, // Preserve the password (do not modify)
      });

      // Simulate successful profile submission
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack(); // Go back to the previous screen after submission
    } catch (error) {
      console.error('Error updating profile: ', error);
      Alert.alert('Error', 'An error occurred while updating the profile');
    }
  };

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <Text style={styles.title}>Edit Profile</Text>

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

      {/* Email */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      {/* Phone Number */}
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      {/* Address */}
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleProfileSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>

      {/* Update Button (same functionality as Submit) */}
      <TouchableOpacity style={styles.updateButton} onPress={handleProfileSubmit}>
        <Text style={styles.submitButtonText}>Update</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 30,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#bbb',
    backgroundColor: '#fff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedButton: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  genderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  submitButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 15,
    borderRadius: 30,
    width: '90%',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  updateButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 15,
    borderRadius: 30,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});
