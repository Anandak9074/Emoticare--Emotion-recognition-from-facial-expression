import React, { useState } from 'react';
import { View, Button, Text, StyleSheet, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios'; // To send requests to Flask API
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore'; // Firestore functions
import { getAuth, initializeApp } from 'firebase/app'; // Firebase Auth to get the current user
import { firebaseConfig } from '../screens/firebaseConfig'; // Your Firebase config

// Initialize Firebase only if not initialized already
if (!firebase.apps.length) {
  initializeApp(firebaseConfig); // Initialize Firebase with your config
} else {
  firebase.app(); // If already initialized, use that one
}

const Emotion = () => {
  const [imageUri, setImageUri] = useState(null);
  const [emotion, setEmotion] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Request permission to access the camera
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'You need to grant permission to access the camera.');
    }
  };

  // Use the camera to take a picture
  const takePhoto = async () => {
    await requestCameraPermission();

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri); // Set selected image URI
      detectEmotion(result.assets[0].uri); // Send the image for emotion detection
    }
  };

  // Send the captured image to Flask backend for emotion detection
  const detectEmotion = async (imageUri) => {
    console.log("Image URI:", imageUri); // Log the image URI
    setUploading(true);
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg', // Or use 'image/png' if the image is PNG
      name: 'image.jpg',
    });

    try {
      const response = await axios.post('http://192.168.11.6:8082/capture_emotion', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const emotions = response.data.emotions;
      if (emotions && emotions.length > 0) {
        setEmotion(emotions[0]); // Get the dominant emotion
      } else {
        setEmotion('No emotion detected');
      }

      // Save the detected emotion to Firestore under the corresponding user ID
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const db = getFirestore();
        const emotionRef = collection(db, 'grownup_emotion'); // This will create the collection if it doesn't exist
        await addDoc(emotionRef, {
          userId: user.uid, // Store the user ID
          emotion: emotions ? emotions[0] : 'No emotion detected', // Store the detected emotion
          timestamp: Timestamp.fromDate(new Date()), // Add timestamp
        });
        console.log('Emotion saved to Firestore!');
      } else {
        console.log('No user logged in');
      }
    } catch (error) {
      console.error('Error detecting emotion:', error);
      if (error.response) {
        // Response error from the backend
        Alert.alert('Error', `Server error: ${error.response.status}`);
      } else if (error.request) {
        // No response from the backend
        Alert.alert('Network Error', 'Unable to reach the server. Please check your network.');
      } else {
        // Other error
        Alert.alert('Error', error.message);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Emotion Detection</Text>

      {/* Button to capture a photo using the camera */}
      <Button title="Capture Photo" onPress={takePhoto} />

      {/* Display the captured image */}
      {imageUri && (
        <View style={styles.imageContainer}>
          <Text>Captured Image:</Text>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>
      )}

      {/* Display the emotion detected */}
      {emotion && !uploading && (
        <View style={styles.emotionContainer}>
          <Text>Detected Emotion: {emotion}</Text>
        </View>
      )}

      {/* Display a loading indicator while uploading */}
      {uploading && <Text>Uploading...</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e3f2fd', // Soft calming blue
    alignItems: 'center',
    padding: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1565c0',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  imageContainer: {
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  image: {
    width: 220,
    height: 220,
    borderRadius: 16,
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#90caf9',
  },
  emotionContainer: {
    marginTop: 24,
    backgroundColor: '#c8e6c9',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    width: '80%',
    alignItems: 'center',
  },
  emotionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2e7d32',
    textAlign: 'center',
  },
});

export default Emotion;