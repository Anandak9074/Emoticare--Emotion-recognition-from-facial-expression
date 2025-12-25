import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';

export default function GrownUpSettingsScreen({ navigation }) {

  // Handle Logout action
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => navigation.navigate('Login'), // Navigate to Login screen
        },
      ],
      { cancelable: false }
    );
  };

  // Example functions for other settings (You can add more based on your project needs)
  const changePassword = () => {
    Alert.alert('Change Password', 'You can update your password here!');
  };

  const updateProfile = () => {
    Alert.alert('Update Profile', 'You can update your profile here!');
  };

  const notificationSettings = () => {
    Alert.alert('Notification Settings', 'You can manage notifications here!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grown-Up Settings</Text>

      {/* Button to update profile */}
      <TouchableOpacity style={styles.button} onPress={updateProfile}>
        <Text style={styles.buttonText}>Update Profile</Text>
      </TouchableOpacity>

      {/* Button to change password */}
      <TouchableOpacity style={styles.button} onPress={changePassword}>
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>

      {/* Button for notification settings */}
      <TouchableOpacity style={styles.button} onPress={notificationSettings}>
        <Text style={styles.buttonText}>Notification Settings</Text>
      </TouchableOpacity>

      {/* Logout button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    width: '80%',
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FF4500', // Red-Orange color for Logout button
    padding: 15,
    borderRadius: 8,
    width: '80%',
    marginTop: 20,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
