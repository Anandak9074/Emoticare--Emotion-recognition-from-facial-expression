import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput } from 'react-native';

export default function ParentsDashboardScreen({ navigation }) {
  const [emotion, setEmotion] = useState(''); // State to track emotion input
  const [emotionAlert, setEmotionAlert] = useState(''); // State to track emotion alert message

  // Handle emotion input change
  const handleEmotionInput = (input) => {
    setEmotion(input); // Update the emotion state
  };

  // Update the emotion alert message based on input
  useEffect(() => {
    if (emotion.toLowerCase().includes('happy')) {
      setEmotionAlert('Everything seems great! Keep the positive vibes going!');
    } else if (emotion.toLowerCase().includes('sad')) {
      setEmotionAlert('It’s okay to feel sad. You are supported!');
    } else if (emotion.toLowerCase().includes('angry')) {
      setEmotionAlert('Try to calm down. Deep breaths help!');
    } else if (emotion.toLowerCase().includes('stressed')) {
      setEmotionAlert('Take a moment to relax. You deserve it!');
    } else {
      setEmotionAlert(''); // Reset if no relevant emotion is detected
    }
  }, [emotion]);

  return (
    <View style={styles.container}>
      {/* Dashboard Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Parents Dashboard</Text>
      </View>

      {/* Emotion Alert Notification Interface in the Middle */}
      {emotionAlert && (
        <View style={styles.emotionAlertContainer}>
          <Text style={styles.emotionAlertText}>Emotion Alert:</Text>
          <Text style={styles.emotionAlert}>{emotionAlert}</Text>
        </View>
      )}

      {/* Emotion Input Box */}
      <View style={styles.emotionInputBox}>
        <TextInput
          style={styles.emotionInput}
          value={emotion}
          onChangeText={handleEmotionInput}
          placeholder="Enter your perception of emotion..."
        />
      </View>

      {/* Cards Section */}
      <View style={styles.cardsContainer}>
        <View style={styles.row}>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('DeviceStatus')}>
            <Text style={styles.cardText}>Device Status</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('EmotionHistory')}>
            <Text style={styles.cardText}>Emotion History</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MonitorActivities')}>
            <Text style={styles.cardText}>Monitor Activities</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('QuickAccess')}>
            <Text style={styles.cardText}>Quick Access</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navIcon} onPress={() => navigation.navigate('ParentsHome')}>
          <View style={styles.navBox}>
            <Image source={require('../assets/home icon.png')} style={styles.icon} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navIcon} onPress={() => navigation.navigate('ParentsDashboard')}>
          <View style={styles.navBox}>
            <Image source={require('../assets/dashboard icon.png')} style={styles.icon} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navIcon} onPress={() => navigation.navigate('ParentsSettings')}>
          <View style={styles.navBox}>
            <Image source={require('../assets/settings icon.png')} style={styles.icon} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A90E2', // Blue color for header
  },
  // Floating Emotion Alert Notification in the center
  emotionAlertContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#ffdddd', // Light red background to indicate alert
    borderRadius: 10,
    alignItems: 'center',
    position: 'absolute',
    top: '30%', // Place it in the middle of the screen
    left: '10%',
    right: '10%',
    zIndex: 10, // Ensure it sits on top of other elements
  },
  emotionAlertText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emotionAlert: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c', // Red color for alert text
  },
  emotionInputBox: {
    marginBottom: 30,
    alignItems: 'center',
  },
  emotionInput: {
    width: '90%',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,
    backgroundColor: '#fff',
  },
  cardsContainer: {
    width: '100%',
    marginBottom: 40,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#8A2BE2', // Violet color for cards
    width: '48%',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    position: 'absolute',
    bottom: 20,
  },
  navIcon: {
    alignItems: 'center',
  },
  navBox: {
    backgroundColor: '#FFA500', // Orange background for bottom navigation
    width: 60,
    height: 60,
    borderRadius: 15, // Square box with rounded corners
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  icon: {
    width: 30,
    height: 30,
  },
});
