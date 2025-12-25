import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Alert, Pressable } from 'react-native';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { LineChart } from 'react-native-chart-kit';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

const GrownUpHistoryScreen = ({ route }) => {
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [grownUpEmotions, setGrownUpEmotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekData, setWeekData] = useState([]);
  const [showWeekData, setShowWeekData] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState(route?.params?.detectedEmotion);

  useEffect(() => {
    const fetchEmotionHistory = async () => {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;

      if (!userId) {
        Alert.alert("Error", "User not authenticated. Please log in.");
        return;
      }

      try {
        const db = getFirestore();

        const emotionHistoryRef = collection(db, 'emotionHistory');
        const emotionQuery = query(emotionHistoryRef, where('userId', '==', userId));
        const emotionQuerySnapshot = await getDocs(emotionQuery);

        const emotions = emotionQuerySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        emotions.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
        setEmotionHistory(emotions);

        const grownUpEmotionRef = collection(db, 'grownup_emotion');
        const grownUpEmotionQuerySnapshot = await getDocs(grownUpEmotionRef);

        const grownUpEmotions = grownUpEmotionQuerySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        grownUpEmotions.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds || 0);
        setGrownUpEmotions(grownUpEmotions);

        const thisWeekStart = startOfWeek(new Date());
        const thisWeekEnd = endOfWeek(new Date());

        const filteredWeekData = emotions.filter((item) =>
          isWithinInterval(new Date(item.timestamp.seconds * 1000), {
            start: thisWeekStart,
            end: thisWeekEnd
          })
        );

        setWeekData(filteredWeekData);

      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert("Error", "An error occurred while fetching the data.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmotionHistory();
  }, []);

  const prepareChartData = (data) => {
    const emotionCounts = data.reduce((acc, item) => {
      const emotion = item.emotion || 'Unknown';
      if (typeof emotion !== 'string') return acc;

      if (acc[emotion]) {
        acc[emotion]++;
      } else {
        acc[emotion] = 1;
      }
      return acc;
    }, {});

    const labels = [];
    const dataValues = [];

    for (const [emotion, count] of Object.entries(emotionCounts)) {
      const safeLabel = emotion.replace(/[^\w\s-]/gi, '');
      const safeCount = Number(count);
      if (!isNaN(safeCount) && isFinite(safeCount)) {
        labels.push(safeLabel);
        dataValues.push(safeCount);
      }
    }

    return {
      labels,
      datasets: [
        {
          data: dataValues,
        }
      ]
    };
  };

  const prepareDetectedEmotion = (item) => {
    const grownUpEmotion = grownUpEmotions.find(g => g.id === item.id);
    if (grownUpEmotion?.details?.emotion) {
      return `Detected Emotion: ${grownUpEmotion.details.emotion}`;
    }
    if (detectedEmotion) {
      return `Detected Emotion: ${detectedEmotion}`;
    }
    return '';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emotion History</Text>

      {/* ✅ Pressable instead of Button to avoid raw string rendering issue */}
      <Pressable
        onPress={() => setShowWeekData(!showWeekData)}
        style={styles.toggleButton}
      >
        <Text style={styles.toggleButtonText}>
          {showWeekData ? 'Show All Data' : 'Show This Week Data'}
        </Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Emotion Chart</Text>
      <LineChart
        data={prepareChartData(showWeekData ? weekData : emotionHistory)}
        width={350}
        height={220}
        yAxisLabel=""
        yAxisSuffix="x"
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#ffa726"
          }
        }}
        style={{
          marginVertical: 8,
          borderRadius: 16
        }}
      />

      <Text style={styles.sectionTitle}>Emotion History</Text>
      <FlatList
        data={showWeekData ? weekData : emotionHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.historyItem}>
            <Text style={styles.historyText}>Emotion: {item.emotion}</Text>
            <Text style={styles.historyText}>Time: {new Date(item.timestamp.seconds * 1000).toLocaleString()}</Text>
            <Text style={styles.historyText}>{prepareDetectedEmotion(item)}</Text>
            {item.details && (
              <View style={styles.detailsContainer}>
                <Text style={styles.detailsText}>Emotion: {item.details.emotion}</Text>
                <Text style={styles.detailsText}>Confidence: {item.details.confidence}</Text>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4ff',
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#0d47a1',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#00796b',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'left',
  },
  chart: {
    marginVertical: 10,
    borderRadius: 16,
    alignSelf: 'center'
  },
  historyItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  historyText: {
    fontSize: 16,
    color: '#37474f',
    marginBottom: 4,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 20,
    color: '#546e7a',
    marginTop: 40,
  },
  detailsContainer: {
    marginTop: 8,
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#a5d6a7',
  },
  detailsText: {
    fontSize: 14,
    color: '#2e7d32',
  },
});


export default GrownUpHistoryScreen;
