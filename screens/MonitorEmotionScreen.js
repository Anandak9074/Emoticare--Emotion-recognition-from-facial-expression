import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Alert } from 'react-native';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'; // Firestore functions
import { firestore } from '../screens/firebaseConfig'; // Firebase Config

export default function MonitorEmotionScreen({ route }) {
  const { kidCode, selectedEmotion } = route.params; // Receive the kidCode and selectedEmotion from the parent screen
  const [emotionLogs, setEmotionLogs] = useState([]); // To store emotion logs
  const [loading, setLoading] = useState(true); // Loading state
  const [emotionMatched, setEmotionMatched] = useState(false); // To track if the emotion matches any log

  // Fetch emotion logs based on the kidCode
  useEffect(() => {
    const fetchEmotionLogs = async () => {
      try {
        const emotionLogsCollectionRef = collection(firestore, 'emotion_logs');
        
        // Query to fetch logs where the kidCode matches the current kidCode passed via route
        const q = query(emotionLogsCollectionRef, where('kidCode', '==', kidCode));

        const querySnapshot = await getDocs(q);
        const logs = [];
        let matchFound = false; // Flag to track if a match is found

        querySnapshot.forEach((doc) => {
          const emotionData = doc.data();
          logs.push({ id: doc.id, ...emotionData });

          // Check if the emotion matches the selected emotion from KidsHomeScreen
          if (emotionData.emotion === selectedEmotion) {
            matchFound = true;
          }
        });

        // Sort logs by timestamp (in descending order)
        logs.sort((a, b) => {
          const timestampA = a.timestamp instanceof Object && a.timestamp.seconds ? a.timestamp.seconds : 0;
          const timestampB = b.timestamp instanceof Object && b.timestamp.seconds ? b.timestamp.seconds : 0;
          return timestampB - timestampA; // Sort in descending order (latest first)
        });

        setEmotionLogs(logs); // Set the fetched logs
        setEmotionMatched(matchFound); // Update the matched status
        setLoading(false); // Stop loading after data is fetched
      } catch (error) {
        console.error('Error fetching emotion logs:', error);
        Alert.alert('Error', 'There was an issue fetching the emotion logs. Please try again later.');
        setLoading(false); // Stop loading in case of error
      }
    };

    fetchEmotionLogs(); // Fetch the logs when the component is mounted or kidCode/selectedEmotion changes
  }, [kidCode, selectedEmotion]); // Fetch logs based on the kidCode passed and selected emotion

  // Function to format Firestore timestamp to a readable date
  const formatTimestamp = (timestamp) => {
    if (timestamp instanceof Object && timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000); // Convert seconds to milliseconds
      return date.toLocaleString(); // Return a human-readable date
    }
    return '';
  };

  // Render each emotion log
  const renderEmotionLog = ({ item }) => {
    return (
      <View style={styles.emotionCard}>
        <Text style={styles.emotionText}>Emotion: {item.emotion}</Text>
        <Text style={styles.timestampText}>Timestamp: {formatTimestamp(item.timestamp)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : (
        <FlatList
          data={emotionLogs}
          renderItem={renderEmotionLog}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.logsContainer}
        />
      )}

      {/* Display a message about the matched emotion */}
      {emotionMatched && (
        <View style={styles.matchStatusContainer}>
          <Text style={styles.matchText}>The selected emotion matches one of the recorded logs!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#EAF4F4', // Light, calming blue background
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#6B7280', // Muted gray for calm tone
    marginTop: 50,
  },
  logsContainer: {
    paddingBottom: 20,
  },
  emotionCard: {
    backgroundColor: '#D8EAFE', // Soft blue card
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emotionText: {
    fontSize: 18,
    color: '#1F2937', // Soft black
    fontWeight: '600',
  },
  timestampText: {
    fontSize: 14,
    color: '#4B5563', // Slightly muted text
    marginTop: 8,
  },
  matchStatusContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#DCFCE7', // Soft green for positive match
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  matchText: {
    fontSize: 16,
    color: '#15803D', // Green text
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

