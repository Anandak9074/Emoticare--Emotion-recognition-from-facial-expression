import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert, Dimensions } from 'react-native';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'; // Firestore functions
import { getAuth } from 'firebase/auth'; // Firebase Auth to get the current user
import { BarChart } from 'react-native-chart-kit'; // Import the BarChart component from React Native Chart Kit
import { useRoute } from '@react-navigation/native'; // Used for accessing route params (navigation)

export default function KidsLogHistoryScreen() {
  const [emotionHistory, setEmotionHistory] = useState([]); // State to store emotion history
  const [loading, setLoading] = useState(true); // State for loading state
  const [emotionCounts, setEmotionCounts] = useState({}); // To store counts of each emotion
  const route = useRoute(); // Hook to access route parameters

  // Get kidCode from the route params
  const { kidCode } = route.params || {}; // Assuming kidCode is passed in route params

  useEffect(() => {
    if (!kidCode) {
      Alert.alert("Error", "Kid code is not available.");
      return; // Ensure kidCode is available before proceeding
    }

    const fetchEmotionHistory = async () => {
      try {
        const auth = getAuth(); // Get Firebase Auth instance
        if (auth.currentUser) {
          const db = getFirestore();
          const userId = auth.currentUser.uid; // Get current user's ID

          // Query the 'emotion_logs' collection for this kidCode
          const emotionHistoryRef = collection(db, 'emotion_logs');
          const q = query(emotionHistoryRef, where('kidCode', '==', kidCode)); // Filter by kidCode

          // Fetch emotion history documents
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const emotions = querySnapshot.docs.map(doc => {
              const data = doc.data();
              return {
                emotion: data.emotion,
                timestamp: data.timestamp ? new Date(data.timestamp.seconds * 1000) : null,
              };
            });

            // Sort the emotions by timestamp (latest first)
            emotions.sort((a, b) => b.timestamp - a.timestamp); // Sort in descending order (latest first)

            setEmotionHistory(emotions); // Set the emotion history state

            // Count the occurrences of each emotion
            const counts = emotions.reduce((acc, { emotion }) => {
              acc[emotion] = (acc[emotion] || 0) + 1;
              return acc;
            }, {});
            setEmotionCounts(counts); // Set emotion counts
          } else {
            console.log("No emotion history found for this kid.");
            Alert.alert("No Data", "No emotion history found.");
          }
        } else {
          Alert.alert("Error", "User not authenticated.");
        }
      } catch (error) {
        console.log("Error fetching emotion history: ", error);
        Alert.alert("Error", "There was an error fetching your emotion history.");
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchEmotionHistory(); // Fetch the emotion history for the kid
  }, [kidCode]); // Fetch whenever the kidCode changes

  // Prepare data for the bar chart for Emotion History
  const chartData = {
    labels: Object.keys(emotionCounts), // Emotions
    datasets: [
      {
        data: Object.values(emotionCounts), // Count of each emotion
        color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`, // Example: Orange color for all bars
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      {/* Emotion History Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emotion History</Text>
        {loading ? (
          <Text>Loading...</Text>
        ) : (
          <>
            {emotionHistory.length > 0 ? (
              emotionHistory.map((emotionData, index) => (
                <View key={index} style={styles.historyItem}>
                  <Text style={styles.historyText}>
                    {emotionData.emotion} - {emotionData.timestamp.toLocaleString()}
                  </Text>
                </View>
              ))
            ) : (
              <Text>No emotion history found.</Text>
            )}

            {/* Bar Chart for Emotion History */}
            {Object.keys(emotionCounts).length > 0 && (
              <View style={styles.chartContainer}>
                <BarChart
                  data={chartData}
                  width={Dimensions.get('window').width - 40} // Make chart responsive based on screen width
                  height={220}
                  chartConfig={{
                    backgroundColor: '#f0f0f0',
                    backgroundGradientFrom: '#f0f0f0',
                    backgroundGradientTo: '#f0f0f0',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Axis and label color
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                  }}
                  style={{ marginVertical: 8, borderRadius: 16 }}
                />
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF9E3', // Warm pastel background
  },
  section: {
    marginBottom: 30,
    backgroundColor: '#FFDDEE',
    borderRadius: 16,
    padding: 15,
    borderColor: '#FFB6C1',
    borderWidth: 2,
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FF4081',
    textAlign: 'center',
    marginBottom: 10,
  },
  historyItem: {
    backgroundColor: '#FFF7FB',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 6,
    borderLeftColor: '#FF80AB',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  historyText: {
    fontSize: 18,
    color: '#555',
    fontWeight: '600',
  },
  chartContainer: {
    marginTop: 25,
    backgroundColor: '#FFEBFA',
    borderRadius: 20,
    padding: 10,
    borderColor: '#E91E63',
    borderWidth: 2,
  },
});

