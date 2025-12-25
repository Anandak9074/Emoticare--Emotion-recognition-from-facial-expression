import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

export default function KidsSettingsScreen() {
  const navigation = useNavigation();

  const confirmLogout = () => {
    Alert.alert(
      '🎈 Ready to logout?',
      'Are you sure you want to leave the fun for now?',
      [
        {
          text: 'Nope!',
          style: 'cancel',
        },
        {
          text: 'Yes, logout 🚪',
          onPress: handleLogout,
        },
      ],
      { cancelable: true }
    );
  };

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        navigation.navigate('Home');
      })
      .catch((error) => {
        Alert.alert('Oops!', error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👋 See you soon!</Text>
      <Text style={styles.subtitle}>Tap the button below to logout.</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
        <Text style={styles.buttonText}>🚪 Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5E1',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6F61',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 30,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#FFB74D',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
