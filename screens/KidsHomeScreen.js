import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { firestore } from '../screens/firebaseConfig';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';

export default function KidsHomeScreen({ navigation, route }) {
  const [time, setTime] = useState(new Date());
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [parentId, setParentId] = useState(''); // State to store parent ID
  const [profileLoaded, setProfileLoaded] = useState(false); // Flag to indicate profile load status

  const kidCode = route.params?.kidCode;

  useEffect(() => {
    // Fetch profile data based on kidCode
    const fetchProfile = async () => {
      if (kidCode) {
        const docRef = doc(firestore, 'kids', kidCode);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const profileData = docSnap.data();
          setParentId(profileData.parentId); // Set the parent ID from profile
          setProfileLoaded(true);
        } else {
          setProfileLoaded(false);
          Alert.alert('Error', 'Profile not found');
        }
      }
    };

    fetchProfile();
  }, [kidCode]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = time.getHours();
  const getGreeting = () => {
    if (currentHour < 12) {
      return 'Good Morning';
    } else if (currentHour < 18) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  };

  const formattedDate = time.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Function to log emotion to Firestore
  const logEmotion = async () => {
    if (!selectedEmotion || !parentId) {
      Alert.alert('Error', 'Please select an emotion before logging.');
      return;
    }

    try {
      const emotionRef = collection(firestore, 'emotion_logs');
      await addDoc(emotionRef, {
        kidCode,
        emotion: selectedEmotion,
        parentId,  // Store parent ID along with the emotion
        timestamp: new Date(),
      });
      Alert.alert('Success', 'Emotion logged successfully!');
    } catch (error) {
      console.error('Error logging emotion: ', error);
      Alert.alert('Error', 'Failed to log emotion');
    }
  };

  const handleNotificationClick = () => {
    Alert.alert(
      'Send Notification',
      'Are you sure you want to notify the parents?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: sendNotification,
        },
      ],
      { cancelable: false }
    );
  };

  const sendNotification = async () => {
    if (!parentId) {
      Alert.alert('Error', 'Parent ID not found');
      return;
    }

    try {
      const notificationTimestamp = new Date();
      const notificationRef = collection(firestore, 'parent_notifications');
      const notificationDoc = await addDoc(notificationRef, {
        kidCode,
        message: `Notification from Kid: ${kidCode}. Please check the child's status.`,
        parentId,  // Include the parent ID here
        timestamp: notificationTimestamp,
        seen: false,
      });
      console.log('Notification document added with ID: ', notificationDoc.id);
      Alert.alert('Notification Sent', 'The parents have been notified!');
    } catch (error) {
      console.error('Error sending notification: ', error);
      Alert.alert('Error', 'Failed to send notification');
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://your-image-url.com/your-background-image.jpg' }}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.mainBox}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.icon}
              onPress={() => navigation.navigate('KidsProfile', { kidCode })}
            >
              <Icon name="account-circle" size={30} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.icon}>
              <Icon name="chat" size={30} color="black" />
            </TouchableOpacity>
          </View>

          <View style={styles.welcomeBox}>
            <Text style={styles.welcomeText}>{getGreeting()}, Kids!</Text>
            <Text style={styles.dateText}>{formattedDate}</Text>
            <Text style={styles.timeText}>
              {time.getHours()}:{time.getMinutes().toString().padStart(2, '0')}:
              {time.getSeconds().toString().padStart(2, '0')}
            </Text>
          </View>

          <Text style={styles.emojiText}>How are you feeling today?</Text>
          <View style={styles.emojiRow}>
            {['😊', '😢', '😡', '😐', '😆'].map((emoji, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.emoji, selectedEmotion === emoji && styles.selectedEmoji]}
                onPress={() => setSelectedEmotion(emoji)}
              >
                <Text style={styles.emojiIcon}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.logEmotionButton} onPress={logEmotion}>
            <Text style={styles.buttonText}>Log Emotion</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity style={styles.bottomButton} onPress={() => navigation.navigate('KidsEmotion' ,{ kidCode })}>
            <Icon name="home" size={30} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomButton}
            onPress={() => navigation.navigate('KidsDashboard', { kidCode })}
          >
            <Icon name="dashboard" size={30} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomButton} onPress={handleNotificationClick}>
            <Icon name="notifications" size={30} color="red" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomButton}
            onPress={() => navigation.navigate('KidsLogHistory', { kidCode })}
          >
            <Icon name="history" size={30} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomButton} onPress={() => navigation.navigate('KidsSettings')}>
            <Icon name="settings" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Lighter, soft feel
    borderRadius: 20,
    width: '100%',
  },
  mainBox: {
    flex: 1,
    padding: 20,
    marginBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  icon: {
    padding: 10,
    backgroundColor: '#FFEB3B',
    borderRadius: 20,
    elevation: 4,
  },
  welcomeBox: {
    backgroundColor: '#81D4FA',
    padding: 20,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  welcomeText: {
    color: '#0D47A1',
    fontSize: 26,
    fontWeight: 'bold',
  },
  dateText: {
    color: '#0D47A1',
    fontSize: 16,
    marginTop: 10,
  },
  timeText: {
    color: '#0D47A1',
    fontSize: 16,
    marginTop: 10,
  },
  emojiText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#FF5722',
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  emoji: {
    padding: 12,
    marginHorizontal: 5,
    backgroundColor: '#FFF9C4',
    borderRadius: 16,
    elevation: 3,
  },
  emojiIcon: {
    fontSize: 30
  },
  selectedEmoji: {
    borderWidth: 3,
    borderColor: '#4CAF50',
    borderRadius: 16,
    backgroundColor: '#C8E6C9',
  },
  logEmotionButton: {
    backgroundColor: '#FF7043',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  bottomButton: {
    backgroundColor: '#F06292',
    padding: 12,
    borderRadius: 50,
    elevation: 4,
  },
});