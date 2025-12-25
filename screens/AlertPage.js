import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { firestore } from '../screens/firebaseConfig'; // Firebase config import
import { collection, query, where, getDocs } from 'firebase/firestore'; // Firestore functions

export default function AlertPage({ route }) {
  const [messages, setMessages] = useState([]); // State to store all notification messages
  const [loading, setLoading] = useState(true); // Loading state

  // Ensure that kidCode is coming from the previous screen
  const { kidCode } = route.params || {}; // Destructure the kidCode from route.params

  useEffect(() => {
    if (!kidCode) {
      setMessages(["No kidCode provided."]);
      setLoading(false);
      console.log("No kidCode in route.params"); // Debugging log
      return;
    }

    const fetchMessages = async () => {
      console.log("Fetching notifications for kidCode:", kidCode); // Log for debugging

      try {
        // Reference to parent_notifications collection
        const notificationsRef = collection(firestore, 'parent_notifications');
        
        // Query to get notifications for the specific kidCode
        const q = query(notificationsRef, where("kidCode", "==", kidCode)); 

        // Fetch the notifications
        const querySnapshot = await getDocs(q);
        
        // Log the result for debugging
        console.log("Query snapshot size:", querySnapshot.size);

        // If we have results, extract all messages
        if (!querySnapshot.empty) {
          const fetchedMessages = querySnapshot.docs.map(doc => doc.data().message); // Extract message data
          setMessages(fetchedMessages); // Set all messages in state
        } else {
          setMessages(["No notifications available for you at the moment."]);
          console.log("No notifications found for the provided kidCode");
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setMessages(["Oops! Something went wrong. Please try again later."]);
      }
      setLoading(false);
    };

    fetchMessages();
  }, [kidCode]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF6347" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hi parent! Here are Your Notifications</Text>

      {/* FlatList to display all messages */}
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <Text style={styles.message}>{item}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()} // Use index as key for simplicity
        style={styles.messageList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // soft gray background
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1F2937', // slate-900
    textAlign: 'center',
    marginBottom: 24,
  },
  messageList: {
    width: '100%',
  },
  messageContainer: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    marginBottom: 12,
    borderRadius: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 6,
    borderLeftColor: '#3B82F6', // blue-500
  },
  message: {
    fontSize: 17,
    color: '#374151', // gray-700
    textAlign: 'left',
    lineHeight: 22,
  },
});
