import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, FlatList } from 'react-native';
import { firestore } from '../screens/firebaseConfig'; // Import your Firestore config
import { getAuth } from 'firebase/auth'; // Import Firebase Authentication
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'; // Firestore query functions

export default function GrownUpNotification() {
  const [parentId, setParentId] = useState(null); // State for parentId
  const [notifications, setNotifications] = useState([]); // State to store notifications
  const [loading, setLoading] = useState(true); // State to handle loading state

  // Fetch the logged-in user's UID and parentId from the Firestore database
  useEffect(() => {
    const fetchParentId = async () => {
      const user = getAuth().currentUser; // Get the currently logged-in user
      if (user) {
        // Log the current user's UID in the console
        console.log('Current User ID: ', user.uid);

        try {
          // Directly set the parentId to the current user's UID
          setParentId(user.uid); // Set the parentId as the current user's UID
        } catch (error) {
          console.error('Error setting parentId: ', error);
          Alert.alert('Error', 'Failed to set parentId');
        }
      } else {
        Alert.alert('Error', 'User not logged in.');
      }
    };

    fetchParentId();
  }, []); // Run only once when component mounts

  // Fetch notifications when parentId is set
  useEffect(() => {
    const fetchNotifications = async () => {
      if (parentId) {
        try {
          const q = query(
            collection(firestore, 'parent_notifications'),
            where('parentId', '==', parentId), // Fetch notifications for the specific parent using parentId
            where('seen', '==', false) // Fetch only notifications where seen is false
          );
          const querySnapshot = await getDocs(q);
          const notificationsArray = [];
          querySnapshot.forEach((doc) => {
            notificationsArray.push({ id: doc.id, ...doc.data() });
          });

          // Mark notifications as seen once fetched
          notificationsArray.forEach(async (notification) => {
            const notificationRef = doc(firestore, 'parent_notifications', notification.id);
            await updateDoc(notificationRef, {
              seen: true, // Mark the notification as seen
            });
          });

          setNotifications(notificationsArray);
        } catch (error) {
          console.error('Error fetching notifications: ', error);
          Alert.alert('Error', 'Failed to fetch notifications');
        } finally {
          setLoading(false); // Set loading to false once data is fetched
        }
      }
    };

    if (parentId) {
      fetchNotifications(); // Fetch notifications once parentId is set
    }
  }, [parentId]); // This effect runs whenever parentId changes

  // Render each notification item
  const renderNotificationItem = ({ item }) => (
    <View style={styles.notificationItem}>
      <Text style={styles.notificationText}>{item.message}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <Text style={styles.text}>Loading notifications...</Text>
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
        />
      ) : (
        <Text style={styles.text}>No notifications available</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#edf1f5',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  text: {
    fontSize: 18,
    color: '#444',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '600',
  },
  notificationItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    borderLeftWidth: 5,
    borderLeftColor: '#4f46e5', // accent stripe
  },
  notificationText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    lineHeight: 22,
  },
});
