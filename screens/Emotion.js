import React, { useState } from 'react';
import { View, Button, Text, StyleSheet, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios'; // To send requests to Flask API
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore'; // Firestore methods
import { getAuth } from 'firebase/auth'; // Firebase Auth

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
      const response = await axios.post('http://192.168.1.34:8081/capture_emotion', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const emotions = response.data.emotions;
      if (emotions && emotions.length > 0) {
        const detectedEmotion = emotions[0]; // Get the dominant emotion
        setEmotion(detectedEmotion);
        
        // Store the emotion in Firestore
        await saveEmotionToDatabase(detectedEmotion);
      } else {
        setEmotion('No emotion detected');
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

  // Function to save detected emotion to Firestore
  const saveEmotionToDatabase = async (emotion) => {
    const db = getFirestore();
    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    if (!userId) {
      Alert.alert('Error', 'User not authenticated. Please log in.');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'emotionHistory'), {
        userId: userId,
        emotion: emotion,
        timestamp: Timestamp.fromDate(new Date()), // Timestamp of when the emotion was detected
      });

      console.log("Emotion saved to Firestore with ID: ", docRef.id);
    } catch (error) {
      console.error("Error saving emotion to Firestore: ", error);
      Alert.alert("Error", "Failed to save emotion to Firestore.");
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  imageContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 10,
  },
  emotionContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});

export default Emotion;
