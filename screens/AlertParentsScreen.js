import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function AlertParentsScreen({ navigation }) {
  // Function to simulate notifying parents
  const notifyParents = () => {
    Alert.alert('Notification Sent', 'Parents have been notified!', [
      { text: 'OK', onPress: () => navigation.goBack() }, // Go back to the previous screen
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Alert Parents</Text>
      <TouchableOpacity style={styles.button} onPress={notifyParents}>
        <Text style={styles.buttonText}>Notify Parents</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 8,
    width: '60%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
