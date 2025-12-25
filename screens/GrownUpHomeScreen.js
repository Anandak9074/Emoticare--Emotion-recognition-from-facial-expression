import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Button, Alert, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Importing icons library
import { getFirestore, doc, getDoc, updateDoc, collection, addDoc, Timestamp, query, where, getDocs } from 'firebase/firestore'; // Firestore to fetch and update user data
import { getAuth } from 'firebase/auth'; // Import Firebase Auth
import { Picker } from '@react-native-picker/picker'; // Picker for emotion selection

export default function GrownUpHomeScreen({ navigation }) {
  const [userName, setUserName] = useState(''); // State to store the username of the logged-in user
  const [emotion, setEmotion] = useState(''); // State to track the selected emotion
  const [emotionList] = useState(['Happy', 'Sad', 'Excited', 'Angry', 'Confused', 'Calm']); // List of emotions
  const [phoneNumber, setPhoneNumber] = useState(''); // State to store the phone number
  const [hasKids, setHasKids] = useState(false); // State to track if the grown-up has kids
  const [stressLevel, setStressLevel] = useState(0); // State to track stress level
  const [stressAlert, setStressAlert] = useState(''); // State to store the stress alert message
  const [notificationCount, setNotificationCount] = useState(0); // State to store the number of unseen notifications
  const [parentId, setParentId] = useState(''); // State to store the parentId (current user's ID)

  useEffect(() => {
    // Fetch user data from Firestore when the component mounts
    const fetchUserData = async () => {
      try {
        const auth = getAuth(); // Get Firebase Auth instance
        if (auth.currentUser) {
          console.log("Current User ID:", auth.currentUser.uid); // Print the user ID to the console

          const db = getFirestore();
          const userRef = doc(db, 'users', auth.currentUser.uid); // Get the user document
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(userData.name || 'User'); // Set the username
            setPhoneNumber(userData.phoneNumber || ''); // Set the phone number
            setHasKids(userData.hasKids || false); // Set if the user has kids
            setParentId(auth.currentUser.uid); // Set parentId as current user ID

            // Ensure the parentId is available before fetching notifications
            if (auth.currentUser.uid) {
              fetchUnseenNotifications(auth.currentUser.uid);
            }
          } else {
            console.log("No user data found");
          }
        } else {
          Alert.alert("Error", "User not authenticated. Please log in.");
        }
      } catch (error) {
        console.log("Error fetching user data: ", error);
      }
    };

    fetchUserData();
  }, []); // Empty dependency array to fetch data only once when the component mounts

  const fetchUnseenNotifications = async (parentId) => {
    try {
      if (!parentId) {
        console.log("No parentId available");
        return; // Exit early if parentId is undefined
      }

      const db = getFirestore();
      const notificationsRef = collection(db, 'notifications');
      const q = query(notificationsRef, where('parentId', '==', parentId), where('seen', '==', false)); // Query for unseen notifications
      const querySnapshot = await getDocs(q);
      setNotificationCount(querySnapshot.size); // Set the number of unseen notifications
    } catch (error) {
      console.log('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    // Simulating stress level changes every 3 seconds (you can replace this with real data)
    const interval = setInterval(() => {
      const newStressLevel = Math.floor(Math.random() * 101); // Random stress level between 0 and 100
      setStressLevel(newStressLevel);
    }, 3000); // Update every 3 seconds

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update the stress alert message based on the stress level
    if (stressLevel >= 80) {
      setStressAlert('High Stress! Take a break.');
    } else if (stressLevel >= 50) {
      setStressAlert('Moderate Stress. Try to relax.');
    } else {
      setStressAlert('Low Stress. Keep it up!');
    }
  }, [stressLevel]);

  const handleEmotionSubmit = async () => {
    if (emotion === '') {
      Alert.alert('Error', 'Please select an emotion.');
      return;
    }

    try {
      const auth = getAuth(); // Get Firebase Auth instance

      if (auth.currentUser) {
        const db = getFirestore();
        const userId = auth.currentUser.uid;

        // 1. Update the emotion in the 'users' collection
        const userRef = doc(db, 'users', userId); // Get the user's Firestore document reference
        await updateDoc(userRef, { emotion: emotion });

        // 2. Add the emotion data to the 'emotionHistory' collection
        const emotionHistoryRef = collection(db, 'emotionHistory');
        await addDoc(emotionHistoryRef, {
          userId: userId,
          username: userName,
          emotion: emotion,
          timestamp: Timestamp.fromDate(new Date()) // Add timestamp for when the emotion was selected
        });

        Alert.alert('Success', 'Emotion updated and saved to history!');
        setEmotion(''); // Clear the emotion after successful submission
      } else {
        Alert.alert("Error", "User not authenticated. Please log in.");
      }
    } catch (error) {
      console.log('Error updating emotion:', error);
      Alert.alert('Error', 'There was an error updating your emotion. Please try again.');
    }
  };

  // Function to handle calling the support helpline
  const callSupport = () => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`).catch((err) => console.error("Error dialing the number", err));
    } else {
      Alert.alert("Error", "No phone number available for support.");
    }
  };

  // Function to show the SOS button instructional message (pop-up message)
  const showSOSInstruction = () => {
    Alert.alert(
      'SOS Button Instruction',
      'Long press the SOS button to call the support number directly and one tap to add emergency number.',
      [{ text: 'Got it!' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Bar with Profile and Message Icon */}
      <View style={styles.topBar}>
        {/* Profile Icon */}
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigation.navigate('GrownUpProfile')}>
          <Image source={require('../assets/profile icon.png')} style={styles.icon} />
        </TouchableOpacity>
        {/* Message Icon with Notification Count */}
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigation.navigate('GrownNotification', { userId: getAuth().currentUser.uid })}>
          <Image source={require('../assets/message icon,png.png')} style={styles.icon} />
          {notificationCount > 0 && (
            <View style={styles.notificationCount}>
              <Text style={styles.notificationText}>{notificationCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Welcome Message Box */}
      <View style={styles.welcomeBox}>
        <Text style={styles.welcomeText}>Welcome, {userName}!</Text>
      </View>

      {/* Emotion Input Box */}
      <View style={styles.emotionBox}>
        <Text style={styles.emotionText}>How are you feeling today?</Text>
        <Picker
          selectedValue={emotion}
          style={styles.picker}
          onValueChange={(itemValue) => setEmotion(itemValue)}>
          {emotionList.map((emotionOption, index) => (
            <Picker.Item key={index} label={emotionOption} value={emotionOption} />
          ))}
        </Picker>
        <Button title="Submit Emotion" onPress={handleEmotionSubmit} />
      </View>

      {/* Stress Alert Section */}
      <View style={styles.stressAlertContainer}>
        <Text style={styles.stressAlertText}>Real-time Stress Alert:</Text>
        <Text style={styles.stressLevelText}>Current Stress Level: {stressLevel}%</Text>
        <Text style={styles.stressAlert}>{stressAlert}</Text>
      </View>

      {/* Bottom Buttons with Only Icons */}
      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => navigation.navigate('CalmingTools')}>
          <Icon name="spa" size={30} color="white" /> {/* Calming/Relaxation Icon */}
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomButton} onPress={() => navigation.navigate('Emotion')}>
          <Icon name="dashboard" size={30} color="white" />
        </TouchableOpacity>

        {/* SOS Button with Alert Icon that navigates to Support Screen */}
        <TouchableOpacity
          style={[styles.bottomButton, styles.sosButton]}
          onPress={() => {
            // Show the instructional message only once when pressed
            showSOSInstruction();
            navigation.navigate('Support'); // Navigate to Support screen
          }}
          onLongPress={callSupport} // Long press calls the support number
        >
          <Icon name="warning" size={30} color="white" /> {/* Using warning icon for SOS */}
        </TouchableOpacity>

        {/* Kids Icon (No Kid Code Generation) */}
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => navigation.navigate('ParentsHome')} // Navigate to ParentsHome without generating kid code
        >
          <Icon name="child-care" size={30} color="white" /> {/* Kids Icon */}
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomButton} onPress={() => navigation.navigate('GrownUpHistory')}>
          <Icon name="history" size={30} color="white" /> {/* History Icon */}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7faff',
    padding: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    alignItems: 'center',
  },
  icon: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },
  notificationCount: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ff3b30',
    borderRadius: 12,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
  },
  notificationText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
  },
  welcomeBox: {
    backgroundColor: '#4b6cb7',
    padding: 24,
    borderRadius: 16,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#4b6cb7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  welcomeText: {
    fontSize: 26,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  emotionBox: {
    backgroundColor: '#fff3cd',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    shadowColor: '#ffecb5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  emotionText: {
    fontSize: 18,
    color: '#5a5a5a',
    fontWeight: '600',
    marginBottom: 10,
  },
  picker: {
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  stressAlertContainer: {
    backgroundColor: '#fef1f1',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 100,
    shadowColor: '#f5c6cb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  stressAlertText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#444',
    marginBottom: 6,
  },
  stressLevelText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 4,
  },
  stressAlert: {
    fontSize: 17,
    fontWeight: '700',
    color: '#d63031',
  },
  bottomButtonsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomButton: {
    backgroundColor: '#4b6cb7',
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4b6cb7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sosButton: {
    backgroundColor: '#e74c3c',
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
});
