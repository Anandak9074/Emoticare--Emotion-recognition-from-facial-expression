import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Linking } from 'react-native';

export default function CalmingToolsScreen() {
  const [isBreathingVisible, setIsBreathingVisible] = useState(false);
  const [breathingStage, setBreathingStage] = useState('');
  const [countdown, setCountdown] = useState(4); // Start with 4 seconds
  const [timer, setTimer] = useState(null); // To hold the interval ID

  // Function to start a breathing exercise
  const startBreathingExercise = () => {
    if (!isBreathingVisible) {
      setBreathingStage('Breathe in'); // Start with "Breathe in"
      setCountdown(4); // 4 seconds countdown for each stage
      setIsBreathingVisible(true);
    } else {
      stopBreathingExercise();
    }
  };

  // Function to stop the breathing exercise
  const stopBreathingExercise = () => {
    clearInterval(timer);
    setBreathingStage('');
    setCountdown(0);
    setIsBreathingVisible(false);
  };

  // Handle countdown and switch stages
  useEffect(() => {
    if (isBreathingVisible && countdown > 0) {
      const newTimer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000); // Countdown every second

      setTimer(newTimer);

      return () => clearInterval(newTimer); // Clean up timer on unmount
    }

    if (countdown === 0) {
      if (breathingStage === 'Breathe in') {
        setBreathingStage('Hold'); // After "Breathe in", switch to "Hold"
        setCountdown(4); // Reset the countdown to 4 seconds for "Hold"
      } else if (breathingStage === 'Hold') {
        setBreathingStage('Breathe out'); // After "Hold", switch to "Breathe out"
        setCountdown(4); // Reset the countdown to 4 seconds for "Breathe out"
      } else if (breathingStage === 'Breathe out') {
        setBreathingStage('Breathe in'); // After "Breathe out", switch back to "Breathe in"
        setCountdown(4); // Reset the countdown to 4 seconds for "Breathe in"
      }
    }
  }, [countdown, breathingStage, isBreathingVisible]);

  // Function to start calming music
  const playCalmingMusic = () => {
    Linking.openURL('https://www.youtube.com/watch?v=1ZYbU82GVz4').catch((err) =>
      console.error("An error occurred while opening the music URL", err)
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calming Tools</Text>

      {/* Breathing Exercise Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={startBreathingExercise}
      >
        <Text style={styles.buttonText}>
          {isBreathingVisible ? 'Stop Breathing Exercise' : 'Start Breathing Exercise'}
        </Text>
      </TouchableOpacity>

      {isBreathingVisible && (
        <View style={styles.exerciseContainer}>
          <Text style={styles.exerciseText}>
            {breathingStage}: {countdown} seconds
          </Text>
        </View>
      )}

      {/* Calming Music Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={playCalmingMusic}
      >
        <Text style={styles.buttonText}>Play Calming Music</Text>
      </TouchableOpacity>

      {/* Placeholder for other calming tools */}
      <View style={styles.otherTools}>
        <Text style={styles.otherText}>Additional calming tools coming soon...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#e3f2fd', // Soft blue background
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#1565c0', // Deep calming blue
    marginBottom: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  button: {
    backgroundColor: '#81d4fa', // Light blue button
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginVertical: 12,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#90caf9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: '#0d47a1',
    fontSize: 18,
    fontWeight: '600',
  },
  exerciseContainer: {
    marginTop: 24,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#ffffffcc', // Semi-transparent white
    borderRadius: 20,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  exerciseText: {
    fontSize: 20,
    color: '#37474f',
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 1,
  },
  otherTools: {
    marginTop: 40,
    padding: 14,
    backgroundColor: '#fce4ec', // Gentle pink
    borderRadius: 20,
    width: '85%',
    alignItems: 'center',
  },
  otherText: {
    fontSize: 16,
    color: '#6d6d6d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

