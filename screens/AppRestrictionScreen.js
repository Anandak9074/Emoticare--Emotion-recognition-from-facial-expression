import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, TextInput, Modal } from 'react-native';
import { firestore } from '../screens/firebaseConfig'; // Firebase config import
import { collection, doc, setDoc, getDocs, query, where, updateDoc, getDoc } from 'firebase/firestore'; // Firestore functions

export default function AppRestrictionScreen({ route }) {
  const [availableApps, setAvailableApps] = useState([
    "Facebook", "Instagram", "Snapchat", "YouTube", "TikTok", "WhatsApp", "Twitter" // Example apps
  ]);
  const [selectedApps, setSelectedApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newApp, setNewApp] = useState(""); // State for the new app input
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility for adding new app

  const { kidCode } = route.params || {}; // Get kidCode from the parent screen (ParentsHomeScreen)

  // Fetch current restrictions from Firestore (if any)
  useEffect(() => {
    if (kidCode) {
      fetchRestrictedApps();
    }
  }, [kidCode]);

  // Fetch the current restricted apps from Firestore
  const fetchRestrictedApps = async () => {
    setLoading(true);
    try {
      const q = query(collection(firestore, "restriction"), where("kidCode", "==", kidCode));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        setSelectedApps(docData.restrictedApps || []);
      } else {
        setSelectedApps([]);
      }
    } catch (error) {
      console.error("Error fetching restricted apps: ", error);
      Alert.alert("Error", "Failed to load restricted apps");
    }
    setLoading(false);
  };

  // Toggle app selection
  const toggleAppSelection = (app) => {
    setSelectedApps((prevSelectedApps) => {
      if (prevSelectedApps.includes(app)) {
        return prevSelectedApps.filter((item) => item !== app); // Deselect app
      } else {
        return [...prevSelectedApps, app]; // Select app
      }
    });
  };

  // Save the selected restricted apps to Firestore
  const saveRestrictedApps = async () => {
    if (!kidCode) {
      Alert.alert("Error", "Kid information is incomplete.");
      return;
    }

    try {
      // Check if a document for this kidCode already exists
      const docRef = doc(firestore, "restriction", kidCode);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Document exists, update the existing document
        await updateDoc(docRef, {
          restrictedApps: selectedApps,
        });

        Alert.alert("Success", "App restrictions updated successfully!");
      } else {
        // Document doesn't exist, create a new one
        await setDoc(docRef, {
          kidCode,
          restrictedApps: selectedApps,
        });

        Alert.alert("Success", "App restrictions saved successfully!");
      }
    } catch (error) {
      console.error("Error saving restricted apps: ", error);
      Alert.alert("Error", "Failed to save restrictions");
    }
  };

  // Add new app to the available apps list
  const addNewApp = () => {
    if (newApp.trim() === "") {
      Alert.alert("Error", "Please enter a valid app name.");
      return;
    }

    setAvailableApps((prevApps) => [...prevApps, newApp.trim()]);
    setNewApp(""); // Clear input after adding
    setModalVisible(false); // Close the modal
  };

  // Render list of apps
  const renderAppItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.appItem, selectedApps.includes(item) && styles.selectedApp]}
      onPress={() => toggleAppSelection(item)}
    >
      <Text style={styles.appName}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Apps to Restrict</Text>

      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={availableApps}
          renderItem={renderAppItem}
          keyExtractor={(item) => item}
          style={styles.appList}
        />
      )}

      {/* Add New App Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Add New App</Text>
      </TouchableOpacity>

      {/* Save Restrictions Button */}
      <TouchableOpacity style={styles.saveButton} onPress={saveRestrictedApps}>
        <Text style={styles.buttonText}>Save Restrictions</Text>
      </TouchableOpacity>

      {/* Modal for adding a new app */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New App</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter app name"
              value={newApp}
              onChangeText={setNewApp}
            />
            <TouchableOpacity style={styles.modalButton} onPress={addNewApp}>
              <Text style={styles.buttonText}>Add App</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
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
    padding: 24,
    backgroundColor: '#F0F4F8', // soft bluish-gray background
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1F2937', // dark slate
    marginBottom: 20,
    textAlign: 'center',
  },
  appList: {
    marginBottom: 20,
  },
  appItem: {
    padding: 16,
    backgroundColor: '#ffffff',
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 6,
    borderLeftColor: '#e5e7eb',
  },
  selectedApp: {
    backgroundColor: '#DEF7EC',
    borderLeftColor: '#10B981', // emerald
  },
  appName: {
    fontSize: 18,
    color: '#374151', // gray-700
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#10B981', // emerald green
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  addButton: {
    backgroundColor: '#3B82F6', // vibrant blue
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    width: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: '#111827',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB', // soft gray
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButton: {
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
});
