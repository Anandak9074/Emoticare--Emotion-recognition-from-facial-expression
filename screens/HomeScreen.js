import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Image, Modal, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSomethingClicked, setIsSomethingClicked] = useState(false);
  const [animalPosition, setAnimalPosition] = useState(new Animated.ValueXY({ x: 0, y: 0 }));
  const [showExploreModal, setShowExploreModal] = useState(false); // NEW: Modal visibility state

  const links = {
    kid: 'https://www.pbskids.org/',
    parent: 'https://www.commonsensemedia.org/',
    grownup: 'https://www.headspace.com/',
  };

  const moveAnimal = () => {
    Animated.spring(animalPosition, {
      toValue: { x: Math.random() * 250 - 125, y: Math.random() * 250 - 125 },
      useNativeDriver: true,
    }).start();
  };

  const openLink = (role) => {
    const url = links[role];
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Failed to open link.');
      });
      setShowExploreModal(false); // Close modal after opening link
    }
  };

  const handleSomethingClick = () => {
    setShowExploreModal(true); // Open the modal on click
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setIsMenuOpen(!isMenuOpen)} style={styles.menuIcon}>
        <Ionicons name="menu" size={40} color="white" />
      </TouchableOpacity>

      {isMenuOpen && (
        <View style={styles.menuContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.menuItem}>✨ Sign Up ✨</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.menuItem}>🚪 Login</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('KidsLogin')}>
            <Text style={styles.menuItem}>👶 Kids Login</Text>
          </TouchableOpacity>
        </View>
      )}

      <Animated.View style={[styles.animalContainer, animalPosition.getLayout()]}>
        <TouchableOpacity onPress={moveAnimal}>
          <Image 
            source={require('../assets/emoticare.png')}
            style={styles.animalImage}
          />
        </TouchableOpacity>
      </Animated.View>

      <Text style={styles.title}>Welcome, to Emoticare!</Text>
      <Text style={styles.subtitle}>Tap the icon to make it move!</Text>

      <TouchableOpacity
        style={styles.kidsButton}
        onPress={() => setIsSomethingClicked(!isSomethingClicked)}>
        <Text style={styles.buttonText}>🎮 Fun Games Coming Soon for Kids! 🎮</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.interactiveButton, isSomethingClicked && styles.clickedButton]}
        onPress={handleSomethingClick}>
        <Text style={styles.buttonText}>🌟 Explore Exciting Features for Everyone! 🌟</Text>
      </TouchableOpacity>

      {/* Modal for Explore Options */}
      <Modal
        visible={showExploreModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowExploreModal(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.4)'
        }}>
          <View style={{
            backgroundColor: '#fff',
            padding: 25,
            borderRadius: 20,
            width: 300,
            alignItems: 'center'
          }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>Choose Your Path</Text>

            <TouchableOpacity onPress={() => openLink('kid')} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>🧒 I'm a Kid</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openLink('parent')} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>👨‍👩‍👧 I'm a Parent</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openLink('grownup')} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>🧑 I'm a Grownup</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowExploreModal(false)} style={{ marginTop: 15 }}>
              <Text style={{ color: 'red' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fceff9',
    padding: 20,
    position: 'relative',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#5b3e96',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#7a59c0',
    textAlign: 'center',
    marginBottom: 20,
  },
  menuIcon: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    padding: 8,
    backgroundColor: '#ffffffcc',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 5,
  },
  menuContainer: {
    position: 'absolute',
    top: 80,
    left: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 10,
    width: 220,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  menuItem: {
    fontSize: 18,
    color: '#5b3e96',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  animalContainer: {
    marginBottom: 30,
  },
  animalImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: '#ffffff',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 8,
  },
  interactiveButton: {
    backgroundColor: '#a56cc1',
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 25,
    marginTop: 15,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  clickedButton: {
    backgroundColor: '#34c759',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  kidsButton: {
    backgroundColor: '#ffcc00',
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 25,
    marginTop: 15,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  modalButton: {
    backgroundColor: '#a56cc1',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginVertical: 8,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
