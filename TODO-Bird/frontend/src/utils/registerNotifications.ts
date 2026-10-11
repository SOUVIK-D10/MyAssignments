import Constants from 'expo-constants';
import { Alert, Platform } from 'react-native';
import axiosInstance from '../api/axiosInstance';

// Expo SDK 53+ removed remote push notifications from Expo Go on Android. So custom handlers and checks implemented
const isExpoGoAndroid = Constants.appOwnership === 'expo' && Platform.OS === 'android';

export async function registerForPushNotificationsAsync() {

  // This is safty to prevent crash
  if (isExpoGoAndroid) {
    // TEMPORARY LOG FOR DEBUGGING
    // console.log('Expo Go on Android detected: Skipping push notification setup.');
    return;
  }

  try {
    // SAFETY-NET Dynamically require packages ONLY when safe 
    const Notifications = require('expo-notifications');
    const Device = require('expo-device');

    if (!Device.isDevice) {
      console.log('Push notifications require a physical mobile device.');
      return;
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permission not granted for push notifications.');
      return;
    }

    // Inside registerForPushNotificationsAsync catch or success blocks:
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: '1deae2b0-406f-46eb-a95e-4ee1aab7fca0',
      });
      const pushToken = tokenData.data;

      // TEMPORARY DEBUG ALERT
      // Alert.alert("Token Fetched", pushToken);

      await axiosInstance.post('/auth/push-token', { pushToken });
          // TEMPORARY DEBUG ALERT
      // Alert.alert("Sync Success", "Token sent to backend!");

    } catch (error) {
      // IGNORE IF FAIL

          // TEMPORARY DEBUG ALERT
      // Alert.alert("Token Fetched FAIL | NOTIFICATION DISABLED");
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3B82F6',
      });
    }
  } catch (error) {
    console.error('Error in push notification setup:', error);
  }
}