import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert, Image } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker'; // If using react-native-image-picker

export default function ParentProfileScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);

  const handleProfileSubmit = () => {
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

    // Proceed with submitting the profile
    Alert.alert('Success', 'Profile submitted successfully!');
    // Navigate back to the dashboard (or do other tasks)
    navigation.goBack();
  };

  const handleProfilePictureUpload = () => {
    // Launch the image picker to choose an image from the device
    launchImageLibrary({ noData: true, mediaType: 'photo' }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        Alert.alert('Error', 'Error picking image');
      } else {
        setProfilePicture(response.assets[0].uri); // Use the URI of the selected image
      }
    });
  };

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <Text style={styles.title}>Edit Parent Profile</Text>

      {/* Profile Picture */}
      <TouchableOpacity onPress={handleProfilePictureUpload} style={styles.profilePictureContainer}>
        {profilePicture ? (
          <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
        ) : (
          <Text style={styles.profilePictureText}>Upload Picture</Text>
        )}
      </TouchableOpacity>

      {/* Name */}
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

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

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleProfileSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>

      {/* Update Button */}
      <TouchableOpacity style={styles.updateButton} onPress={handleProfileSubmit}>
        <Text style={styles.submitButtonText}>Update</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  profilePictureContainer: {
    backgroundColor: '#ddd',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profilePictureText: {
    fontSize: 14,
    color: '#555',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingLeft: 15,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  updateButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
});
