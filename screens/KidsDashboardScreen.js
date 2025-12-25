import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { firestore } from './firebaseConfig'; // Assuming firebaseConfig is configured properly
import { doc, getDoc, updateDoc, onSnapshot, collection, getDocs } from 'firebase/firestore';

// Define a background fetch task
TaskManager.defineTask('BACKGROUND_FETCH', async () => {
  try {
    console.log('Background fetch task running');
    
    const kidCode = 'exampleKidCode'; // Replace with dynamic kidCode
    const kidRef = doc(firestore, 'kids', kidCode);
    const kidDoc = await getDoc(kidRef);

    if (kidDoc.exists()) {
      const data = kidDoc.data();
      const timeRemaining = data.time || 0;
      const isRestricted = data.isRestricted || false;
      const restrictionReason = data.restrictionReason || 'No reason specified';
      const lockedUntil = data.lockedUntil || 0;  // Timestamp when restriction is lifted

      if (isRestricted && lockedUntil > Date.now()) {
        console.log('App is restricted until:', new Date(lockedUntil).toLocaleString());
        return BackgroundFetch.BackgroundFetchResult.NoData;
      } else {
        console.log('App is not restricted, time remaining:', timeRemaining);
        return BackgroundFetch.BackgroundFetchResult.NewData;
      }
    } else {
      console.log('No data found for this kid');
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  } catch (error) {
    console.error('Error in background fetch task:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

const KidsDashboardScreen = ({ route }) => {
  const { kidCode } = route.params;

  const [timeRemaining, setTimeRemaining] = useState(3600); // Default: 1 hour of screen time
  const [isRestricted, setIsRestricted] = useState(false);
  const [restrictionReason, setRestrictionReason] = useState('');
  const [restrictedApps, setRestrictedApps] = useState([]);
  const [lockedUntil, setLockedUntil] = useState(0);  // Time when restriction will be lifted

  useEffect(() => {
    const registerBackgroundFetch = async () => {
      try {
        await BackgroundFetch.registerTaskAsync('BACKGROUND_FETCH', {
          minimumInterval: 60 * 15,  // Check every 15 minutes
          stopOnTerminate: false,    // Continue after app termination
          startOnBoot: true,         // Start when the device boots up
        });
        console.log('Background fetch registered');
      } catch (error) {
        console.error('Error registering background fetch:', error);
      }
    };

    const fetchData = async () => {
      try {
        const kidRef = doc(firestore, 'kids', kidCode);
        const unsubscribe = onSnapshot(kidRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setTimeRemaining(data.time || 3600);  // Update remaining time from Firestore
            setIsRestricted(data.isRestricted || false);
            setRestrictionReason(data.restrictionReason || 'No reason specified');
            setLockedUntil(data.lockedUntil || 0);  // Set the lockedUntil time

            if (data.isRestricted && data.lockedUntil > Date.now()) {
              // Restrict app behavior when restricted
              Alert.alert('Restricted', `Reason: ${data.restrictionReason}`);
            }
          }
        });

        // Clean up listener on component unmount
        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const fetchRestrictedApps = async () => {
      try {
        const restrictionRef = doc(firestore, 'restriction', kidCode);
        const restrictionDoc = await getDoc(restrictionRef);
        if (restrictionDoc.exists()) {
          const restrictionData = restrictionDoc.data();
          setRestrictedApps(restrictionData.restrictedApps || []);
        }
      } catch (error) {
        console.error('Error fetching restricted apps:', error);
      }
    };

    fetchData();
    fetchRestrictedApps();
    registerBackgroundFetch();

    return () => {
      BackgroundFetch.unregisterTaskAsync('BACKGROUND_FETCH');
    };
  }, [kidCode]);

  useEffect(() => {
    if (timeRemaining <= 0 && !isRestricted) {
      handleTimeUp();
    } else {
      // Set an interval to update the time remaining every second
      const timer = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer); // Stop the timer when it reaches 0
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      // Clear the interval when the component unmounts
      return () => clearInterval(timer);
    }
  }, [timeRemaining, isRestricted]);

  const handleTimeUp = () => {
    if (timeRemaining <= 0) {
      Alert.alert('Time is up!', 'The mobile usage time is over.');
      setIsRestricted(true); // Set app to restricted state
      updateRestrictionStatus(true, 'Time is up.');
    }
  };

  const updateRestrictionStatus = async (status, reason) => {
    try {
      const kidRef = doc(firestore, 'kids', kidCode);
      const lockedUntil = Date.now() + 3600000; // Lock for 1 hour
      await updateDoc(kidRef, {
        isRestricted: status,
        restrictionReason: reason,
        lockedUntil: lockedUntil,
      });
      console.log('Restriction status updated in Firestore');
    } catch (error) {
      console.error('Error updating restriction status:', error);
    }
  };

  return (
    <View style={styles.container}>
      {isRestricted && lockedUntil > Date.now() ? (
        // Display restricted screen when the app is locked out
        <View style={styles.restrictedContainer}>
          <Text style={styles.restrictedText}>App is currently restricted</Text>
          <Text style={styles.restrictionReason}>Reason: {restrictionReason}</Text>
          {restrictedApps.length > 0 && (
            <View style={styles.restrictedAppsContainer}>
              <Text style={styles.restrictedAppsHeader}>Restricted Apps:</Text>
              {restrictedApps.map((app, index) => (
                <Text key={index} style={styles.restrictedApp}>{app}</Text>
              ))}
            </View>
          )}
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => Alert.alert('Restricted', 'You cannot interact with the app.')}
            disabled={true} // Disable button when restricted
          >
            <Text style={styles.buttonText}>You cannot interact</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.kidCode}>Kid Code: {kidCode}</Text>
          <Text style={styles.timer}>Time Remaining: {timeRemaining} seconds</Text>

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleTimeUp}
          >
            <Text style={styles.buttonText}>End Time</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFAF0', // Warm, cheerful background
    paddingHorizontal: 20,
  },
  card: {
    width: '90%',
    padding: 30,
    backgroundColor: '#FFEB3B', // Bright yellow
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FBC02D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    alignItems: 'center',
  },
  kidCode: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF5722',
    marginBottom: 10,
  },
  timer: {
    fontSize: 20,
    color: '#4CAF50',
    marginBottom: 20,
  },
  restrictedContainer: {
    marginTop: 20,
    padding: 25,
    backgroundColor: '#FF5252',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#D32F2F',
    width: '90%',
    alignItems: 'center',
  },
  restrictedText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  restrictionReason: {
    color: '#fff',
    fontSize: 18,
    marginTop: 10,
    fontStyle: 'italic',
  },
  restrictedAppsContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  restrictedAppsHeader: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  restrictedApp: {
    color: '#fff',
    fontSize: 16,
    marginVertical: 2,
  },
  button: {
    backgroundColor: '#03A9F4',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 15,
    marginTop: 25,
    borderWidth: 2,
    borderColor: '#0288D1',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});


export default KidsDashboardScreen;
