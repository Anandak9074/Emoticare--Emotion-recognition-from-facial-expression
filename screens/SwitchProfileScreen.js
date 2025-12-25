import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { getAuth } from 'firebase/auth'; // Firebase Auth
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore'; // Firestore functions
import { firestore } from '../screens/firebaseConfig'; // Firebase Config
import { useNavigation } from '@react-navigation/native'; // React Navigation

export default function SwitchProfileScreen() {
  const navigation = useNavigation();
  const [kids, setKids] = useState([]); // To store kids data
  const [loading, setLoading] = useState(true); // To track loading state
  const [error, setError] = useState(null); // To handle errors
  const [isModalVisible, setIsModalVisible] = useState(false); // To control modal visibility for adding a kid
  const [newKidName, setNewKidName] = useState(''); // To store new kid's name
  const [newKidAge, setNewKidAge] = useState(''); // To store new kid's age
  const [newKidCode, setNewKidCode] = useState(''); // To store new kid's code

  // Fetch current user's kids from Firestore
  useEffect(() => {
    const fetchKidsData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const kidsCollectionRef = collection(firestore, 'kids');
          const kidsQuery = query(kidsCollectionRef, where('parentId', '==', user.uid)); // Filter by parentId
          const kidsQuerySnapshot = await getDocs(kidsQuery);

          const kidsData = [];
          kidsQuerySnapshot.forEach((doc) => {
            const kidData = doc.data();
            kidsData.push({ id: doc.id, ...kidData });
          });

          setKids(kidsData);
        } else {
          setError("No user is logged in.");
        }
      } catch (err) {
        setError("Error fetching kids data.");
        console.error(err);
      } finally {
        setLoading(false); // Set loading to false after the fetch is completed
      }
    };

    fetchKidsData();
  }, []);

  // Handle the process of adding a new kid
  const handleAddKid = async () => {
    if (!newKidName || !newKidAge || !newKidCode) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        // Add new kid to the Firestore
        const newKidRef = collection(firestore, 'kids');
        await addDoc(newKidRef, {
          parentId: user.uid,
          kidCode: newKidCode,
          kidName: newKidName,
          kidAge: newKidAge,
        });

        // Update the kids list after adding a new kid
        setKids([...kids, { kidCode: newKidCode, kidName: newKidName, kidAge: newKidAge }]);

        // Clear the form fields
        setNewKidName('');
        setNewKidAge('');
        setNewKidCode('');
        setIsModalVisible(false); // Close the modal

        Alert.alert('Success', 'New kid added successfully!');
      }
    } catch (err) {
      console.error("Error adding new kid:", err);
      Alert.alert('Error', 'There was an error adding the kid.');
    }
  };

  // Handle switching to a kid's monitoring page
  const handleSwitchToMonitoring = (kid) => {
    // Navigate to ParentsHome and pass the clicked kid's data for monitoring
    navigation.navigate('ParentsHome', { kidData: kid }); // Passing the full kid data
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Text style={styles.loadingText}>Loading kids data...</Text>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <View style={styles.kidsBox}>
          <Text style={styles.kidsBoxHeader}>Current Kids</Text>
          {kids.length > 0 ? (
            kids.map((kid) => (
              <TouchableOpacity
                key={kid.id}
                style={styles.kidCard}
                onPress={() => handleSwitchToMonitoring(kid)} // Navigate to monitoring screen
              >
                <Text style={styles.kidName}>Kid Name: {kid.kidName || 'No Name Available'}</Text>
                <Text style={styles.kidCode}>Kid Code: {kid.kidCode}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noKidsText}>No kids available.</Text>
          )}
        </View>
      )}

      {/* Button to Add Kid */}
      <TouchableOpacity style={styles.addKidButton} onPress={() => setIsModalVisible(true)}>
        <Text style={styles.addKidButtonText}>Add New Kid</Text>
      </TouchableOpacity>

      {/* Modal for adding a new kid */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Kid</Text>
            <TextInput
              style={styles.input}
              placeholder="Kid's Name"
              value={newKidName}
              onChangeText={setNewKidName}
            />
            <TextInput
              style={styles.input}
              placeholder="Kid's Age"
              value={newKidAge}
              onChangeText={setNewKidAge}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Kid's Code (6 digits)"
              value={newKidCode}
              onChangeText={setNewKidCode}
              keyboardType="keyboard"
              maxLength={6} // Ensure the code is 6 digits
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddKid}>
              <Text style={styles.addButtonText}>Add Kid</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 50,
  },
  errorText: {
    fontSize: 18,
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 50,
  },
  kidsBox: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    marginTop: 20,
  },
  kidsBoxHeader: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  kidCard: {
    backgroundColor: '#A78BFA', // Soft purple
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  kidName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  kidCode: {
    fontSize: 14,
    color: '#E5E7EB',
    marginTop: 4,
  },
  noKidsText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  addKidButton: {
    backgroundColor: '#10B981',
    padding: 15,
    borderRadius: 12,
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
    elevation: 3,
  },
  addKidButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 20,
    width: '85%',
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 15,
    paddingLeft: 15,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
});

