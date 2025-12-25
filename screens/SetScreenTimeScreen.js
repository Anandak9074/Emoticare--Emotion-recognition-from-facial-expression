import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { firestore } from '../screens/firebaseConfig'; // Import your Firestore config
import { doc, setDoc, getDoc } from 'firebase/firestore'; // Firestore functions
import { Picker } from '@react-native-picker/picker'; // Updated Picker import

export default function SetScreenTimeScreen({ route, navigation }) {
  const { kidCode } = route.params || {}; // Get kidCode from the route params, which is passed from the Parent screen.

  const [timeLimit, setTimeLimit] = useState(''); // State to store the time limit
  const [loading, setLoading] = useState(false);
  const [emotionBased, setEmotionBased] = useState(false); // State to track whether emotion-based screen time is chosen
  const [emotion, setEmotion] = useState(''); // Store emotion state (e.g., happy, sad, etc.)
  const [manualTime, setManualTime] = useState(''); // State for manual time input

  // Set the navigation options (screen title)
  useEffect(() => {
    navigation.setOptions({
      title: 'ScreenTime', // Set the screen title to "ScreenTime"
    });
  }, [navigation]);

  // Function to handle setting the time limit
  const handleSetTimeLimit = async () => {
    if (!kidCode) {
      Alert.alert('Error', 'No Kid Code found.');
      return;
    }

    let finalTimeLimit;

    if (emotionBased && emotion) {
      // Set screen time based on emotion
      if (emotion === 'happy') {
        finalTimeLimit = 3; // Happy = 3 hours
      } else if (emotion === 'neutral') {
        finalTimeLimit = 2; // Neutral = 2 hours
      } else if (emotion === 'sad') {
        finalTimeLimit = 1; // Sad = 1 hour
      } else if (emotion === 'excited') {
        finalTimeLimit = 4; // Excited = 4 hours
      } else if (emotion === 'angry') {
        finalTimeLimit = 0.5; // Angry = 0.5 hours
      }
    } else {
      // Use the manually entered time limit
      if (!manualTime || isNaN(manualTime) || manualTime <= 0) {
        Alert.alert('Invalid Input', 'Please enter a valid time limit in hours.');
        return;
      }
      finalTimeLimit = Number(manualTime);
    }

    // Log to check the finalTimeLimit and kidCode
    console.log('Setting screen time:', { kidCode, finalTimeLimit });

    setLoading(true);

    try {
      // Ensure both kidCode and finalTimeLimit are valid
      if (!finalTimeLimit || !kidCode) {
        throw new Error('Invalid finalTimeLimit or kidCode.');
      }

      const kidDocRef = doc(firestore, 'kids', kidCode); // Reference to the kid's document in Firestore

      // Fetch the existing kid's document to check if 'time' field exists
      const kidDoc = await getDoc(kidDocRef);

      if (kidDoc.exists()) {
        // If the document exists, update the 'time' field
        await setDoc(
          kidDocRef,
          { time: finalTimeLimit }, // Set or update the time field with the finalTimeLimit
          { merge: true } // Merge with existing document, don't overwrite
        );
      } else {
        // If the document does not exist, create it with the 'time' field
        await setDoc(kidDocRef, {
          time: finalTimeLimit, // Create a new document with time field
        });
      }

      Alert.alert('Success', 'Screen time limit has been set successfully!');
      setLoading(false);
      navigation.goBack(); // Navigate back to Parent Dashboard
    } catch (error) {
      console.error('Error setting screen time:', error);
      Alert.alert('Error', `There was an issue setting the screen time: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Screen Time for Kid</Text>

      {/* Option to choose between manual entry and emotion-based time */}
      <View style={styles.optionContainer}>
        <Text style={styles.optionText}>Set Time Based On:</Text>
        <Picker
          selectedValue={emotionBased ? 'emotion' : 'manual'}
          style={styles.picker}
          onValueChange={(itemValue) => setEmotionBased(itemValue === 'emotion')}
        >
          <Picker.Item label="Manual Entry" value="manual" />
          <Picker.Item label="Emotion Based" value="emotion" />
        </Picker>
      </View>

      {/* If manual entry is selected, show the manual input field */}
      {!emotionBased ? (
        <TextInput
          style={styles.input}
          placeholder="Enter screen time in hours"
          keyboardType="numeric"
          value={manualTime}
          onChangeText={setManualTime}
        />
      ) : (
        // If emotion-based time is selected, show emotion selection
        <View style={styles.emotionSelector}>
          <Text style={styles.optionText}>Select Emotion:</Text>
          <Picker
            selectedValue={emotion}
            style={styles.picker}
            onValueChange={(itemValue) => setEmotion(itemValue)}
          >
            <Picker.Item label="Happy" value="happy" />
            <Picker.Item label="Neutral" value="neutral" />
            <Picker.Item label="Sad" value="sad" />
            <Picker.Item label="Excited" value="excited" />
            <Picker.Item label="Angry" value="angry" />
          </Picker>
        </View>
      )}

      <Button
        title={loading ? 'Saving...' : 'Set Screen Time'}
        onPress={handleSetTimeLimit}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF4F4', // Calming light blue-green background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1F2937', // Deep gray for contrast
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#B0BEC5', // Soft gray-blue border
    borderRadius: 12,
    backgroundColor: '#ffffff',
    fontSize: 18,
    marginBottom: 20,
  },
  optionContainer: {
    marginBottom: 20,
    width: '100%',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#374151', // Neutral gray
    marginBottom: 8,
  },
  picker: {
    width: '100%',
    height: 50,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B0BEC5',
  },
  emotionSelector: {
    width: '100%',
    marginBottom: 20,
  },
});
