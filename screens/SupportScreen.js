import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Linking, TextInput, Button } from 'react-native';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore'; // Firestore functions
import { getAuth } from 'firebase/auth'; // Firebase Auth to get the current user

export default function SupportScreen() {
  const [phoneNumber, setPhoneNumber] = useState(''); // State for storing phone number
  const [storedPhoneNumber, setStoredPhoneNumber] = useState(''); // To display the stored phone number

  useEffect(() => {
    const fetchPhoneNumber = async () => {
      try {
        const auth = getAuth();
        const db = getFirestore();
        if (auth.currentUser) {
          const userId = auth.currentUser.uid; // Get the current user ID
          const userDocRef = doc(db, 'users', userId); // Get the reference to the user's document
          
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setStoredPhoneNumber(data.phoneNumber || 'Not set yet');
          } else {
            console.log('No user document found!');
          }
        } else {
          console.log('User not authenticated');
        }
      } catch (error) {
        console.error('Error fetching phone number:', error);
      }
    };

    fetchPhoneNumber(); // Fetch the phone number when the component mounts
  }, []);

  // Function to handle the call to a helpline number
  const callHelpline = (number) => {
    Linking.openURL(`tel:${number}`).catch((err) =>
      console.error("An error occurred while attempting to call the helpline", err)
    );
  };

  // Function to open a website with support resources
  const openSupportWebsite = (url) => {
    Linking.openURL(url).catch((err) =>
      console.error("An error occurred while opening the website", err)
    );
  };

  // Function to show an alert for selecting support resources
  const showSupportOptions = () => {
    Alert.alert(
      'Support Resources',
      'Choose an option for support:',
      [
        { text: 'Call Helpline', onPress: () => callHelpline(phoneNumber) }, // Call the user-specified phone number
        { text: 'Visit Support Website', onPress: () => openSupportWebsite('https://www.wysa.com/') },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  // Function to handle saving the phone number
  const savePhoneNumber = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter a valid phone number.');
      return;
    }

    try {
      const auth = getAuth();
      const db = getFirestore();

      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        const userDocRef = doc(db, 'users', userId);
        
        // Save or update the phone number in the Firestore database
        await setDoc(userDocRef, { phoneNumber }, { merge: true });

        Alert.alert('Success', 'Phone number saved successfully!');
        setStoredPhoneNumber(phoneNumber); // Update the stored phone number
      } else {
        Alert.alert('Error', 'User not authenticated');
      }
    } catch (error) {
      console.error('Error saving phone number:', error);
      Alert.alert('Error', 'There was an issue saving the phone number.');
    }
  };

  // Function to handle updating the phone number
  const updatePhoneNumber = async () => {
    setPhoneNumber(storedPhoneNumber); // Pre-fill the current phone number
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Support Resources</Text>
      <Text style={styles.description}>Click the button below to connect with support resources.</Text>

      {/* Phone number input */}
      <Text style={styles.phoneLabel}>Phone Number:</Text>
      <TextInput
        style={styles.input}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="Enter your phone number"
        keyboardType="phone-pad"
      />

      <TouchableOpacity style={styles.button} onPress={savePhoneNumber}>
        <Text style={styles.buttonText}>Save Phone Number</Text>
      </TouchableOpacity>

      {/* Display stored phone number */}
      <Text style={styles.storedPhoneNumber}>Stored Phone Number: {storedPhoneNumber}</Text>

      {/* Button to update phone number */}
      <TouchableOpacity style={styles.button} onPress={updatePhoneNumber}>
        <Text style={styles.buttonText}>Update Phone Number</Text>
      </TouchableOpacity>

      {/* Button to show support options */}
      <TouchableOpacity style={styles.button} onPress={showSupportOptions}>
        <Text style={styles.buttonText}>Get Help</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e3f2fd', // Soft calming blue
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1565c0',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  phoneLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0d47a1',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#90caf9',
    backgroundColor: '#ffffff',
    fontSize: 16,
    marginBottom: 20,
    shadowColor: '#90caf9',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    backgroundColor: '#42a5f5', // Soft blue
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  storedPhoneNumber: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '500',
    marginVertical: 16,
    textAlign: 'center',
  },
});

