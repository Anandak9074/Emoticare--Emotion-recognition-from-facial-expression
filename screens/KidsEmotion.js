import React, { useState, useEffect } from 'react';
import { View, Button, Text, StyleSheet, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios'; // To send requests to Flask API
import { firestore } from '../screens/firebaseConfig'; // Import firestore configuration
import { doc, getDoc, collection, addDoc } from 'firebase/firestore'; // Firestore functions for fetching documents and adding to collections

const KidsEmotion = ({ route }) => {
  const [imageUri, setImageUri] = useState(null);
  const [emotion, setEmotion] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [parentId, setParentId] = useState(null); // State for parentId
  const { kidCode } = route.params || {}; // Fetching kidCode directly from route.params

  // Check if kidCode is missing and alert the user
  useEffect(() => {
    if (!kidCode) {
      Alert.alert('Error', 'Kid code is missing. Cannot log emotion data.');
    } else {
      fetchParentId(kidCode); // Fetch the parentId from the kids profile
    }
  }, [kidCode]);

  // Fetch the parentId from the kid's profile in Firestore
  const fetchParentId = async (kidCode) => {
    try {
      const kidRef = doc(firestore, 'kids', kidCode); // Reference to 'kids' collection using the kidCode
      const docSnap = await getDoc(kidRef);

      if (docSnap.exists()) {
        const profileData = docSnap.data();
        if (profileData && profileData.parentId) {
          setParentId(profileData.parentId); // Assuming 'parentId' is a field in the kid's profile
          console.log(`Parent ID for kidCode ${kidCode}:`, profileData.parentId);
        } else {
          Alert.alert('Error', 'Parent ID not found for this kid.');
        }
      } else {
        Alert.alert('Error', 'Kid profile not found.');
      }
    } catch (error) {
      console.error('Error fetching parent ID:', error);
      Alert.alert('Error', 'Failed to fetch parent ID');
    }
  };

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
        setEmotion(emotions[0]); // Get the dominant emotion
        // Log the emotion in Firestore with the kidCode and parentId
        logEmotion(emotions[0]);
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

  // Function to log the detected emotion to Firestore with kidCode and parentId
  const logEmotion = async (detectedEmotion) => {
    if (!kidCode || !parentId) {
      Alert.alert('Error', 'Cannot log emotion without a valid kidCode or parentId.');
      return;
    }

    try {
      const emotionRef = collection(firestore, 'emotion_logs'); // Reference to the 'emotion_logs' collection
      await addDoc(emotionRef, {
        kidCode: kidCode, // Store the kid code with the emotion data
        parentId: parentId, // Store the parent ID with the emotion data
        emotion: detectedEmotion, // Store the detected emotion
        timestamp: new Date(), // Timestamp when the emotion is logged
      });
      console.log('Emotion logged to Firestore for kidCode:', kidCode);
    } catch (error) {
      console.error('Error logging emotion to Firestore:', error);
      Alert.alert('Error', 'Failed to log emotion to Firestore');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Kids Emotion Detection</Text>

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
    backgroundColor: '#FFF8E1', // Warm, cheerful background
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6F00',
    marginBottom: 30,
  },
  imageContainer: {
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: '#FFE082',
    padding: 10,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  image: {
    width: 220,
    height: 220,
    borderRadius: 15,
    borderWidth: 4,
    borderColor: '#FFB300',
  },
  emotionContainer: {
    marginTop: 30,
    alignItems: 'center',
    backgroundColor: '#FFCDD2',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E57373',
    elevation: 4,
  },
  emotionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#C62828',
  },
});

export default KidsEmotion;
