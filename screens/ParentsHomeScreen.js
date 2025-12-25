import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, BackHandler, Alert } from 'react-native';
import { getAuth } from 'firebase/auth'; // Firebase Auth
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'; // Firestore
import { firestore } from '../screens/firebaseConfig'; // Firebase Config

export default function ParentsHomeScreen({ route, navigation }) {
  const { kidData } = route.params || {}; // Destructure the kidData passed from SwitchProfileScreen
  const [backPressed, setBackPressed] = useState(0);
  const [childName, setChildName] = useState(kidData?.kidName || ''); // State for child's name
  const [childCode, setChildCode] = useState(kidData?.kidCode || ''); // State for child's code
  const [kids, setKids] = useState([]); // To store multiple kids' data
  const [selectedKid, setSelectedKid] = useState(kidData || null); // To track the currently selected kid

  useEffect(() => {
    // Handling Android back button
    const backAction = () => {
      if (backPressed >= 1) {
        Alert.alert(
          'Confirm Logout',
          'Are you sure you want to log out?',
          [
            { text: 'Cancel', onPress: () => setBackPressed(0) },
            { text: 'Logout', onPress: () => navigation.navigate('Login') },
          ],
          { cancelable: false }
        );
        return true;
      } else {
        setBackPressed(backPressed + 1);
        Alert.alert('Press back again to log out');
        return true; // Disable default back action
      }
    };

    BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backAction);
    };
  }, [backPressed, navigation]);

  useEffect(() => {
    if (kidData) {
      setChildName(kidData.kidName);
      setChildCode(kidData.kidCode);
      setSelectedKid(kidData);
    }
  }, [kidData]);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        {/* Switch Profile Icon */}
        <TouchableOpacity
          style={[styles.iconContainer, selectedKid ? styles.selectedIcon : null]} // Highlight the icon if a kid is selected
          onPress={() => navigation.navigate('SwitchProfile')} // Navigate to SwitchProfile screen
        >
          <Image source={require('../assets/switch icon.png')} style={styles.icon} />
        </TouchableOpacity>

        {/* Settings Icon */}
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigation.navigate('ParentsSettings')} // Navigate to ParentsSettings
        >
          <Image source={require('../assets/settings icon.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>

      {/* Tooltip for Switch Profile */}
      {!selectedKid && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>Use "Switch Profile" to select a different child profile.</Text>
        </View>
      )}

      {/* Display selected kid information */}
      <View style={styles.infoBox}>
        <Text style={styles.kidInfo}>
          Kid: {childName || 'No Name Available'} ({childCode || 'No Code Available'})
        </Text>
      </View>

      {/* Cards for different functionalities */}
      <View style={styles.cardsContainer}>
        <View style={styles.row}>
          {/* Monitor Kids' Emotion Card */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('MonitorEmotion', { kidCode: childCode })} // Pass selected kidCode
          >
            <Image source={require('../assets/emotion icon.png')} style={styles.cardIcon} />
            <Text style={styles.cardText}>Monitor Kids' Emotion</Text>
          </TouchableOpacity>
          {/* Screen Time Card (updated to navigate to SetScreenTime) */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('SetScreenTime', { kidCode: childCode })} // Navigate to SetScreenTime screen
          >
            <Image source={require('../assets/screentime icon.png')} style={styles.cardIcon} />
            <Text style={styles.cardText}>Screen Time</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          {/* App Restrictions Card */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('AppRestriction', { kidCode: childCode })} // Pass kidCode to AppRestriction screen
          >
            <Image source={require('../assets/resriction icon.png')} style={styles.cardIcon} />
            <Text style={styles.cardText}>App Restrictions</Text>
          </TouchableOpacity>
          {/* Alert System Card */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('AlertPage', { kidCode: childCode })} // Pass kidCode to AlertPage
          >
            <Image source={require('../assets/alert icon.png')} style={styles.cardIcon} />
            <Text style={styles.cardText}>Alert System</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefefe',
    padding: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  icon: {
    width: 28,
    height: 28,
    tintColor: '#5e5e5e',
  },
  selectedIcon: {
    borderWidth: 2,
    borderColor: '#ff9800',
    borderRadius: 14,
  },
  tooltip: {
    backgroundColor: '#d1c4e9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  tooltipText: {
    fontSize: 15,
    color: '#4a148c',
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: '#7e57c2',
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 14,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  kidInfo: {
    fontSize: 22,
    color: '#ffffff',
    fontWeight: '600',
  },
  cardsContainer: {
    flex: 1,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff8e1',
    width: '48%',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIcon: {
    width: 42,
    height: 42,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: '#5d4037',
    fontWeight: '500',
    textAlign: 'center',
  },
});
