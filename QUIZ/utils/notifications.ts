import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler for mobile platforms
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  // Skip notifications on web
  if (Platform.OS === 'web') {
    console.warn('Push notifications are not supported on web.');
    return null;
  }

  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Push notification permissions not granted.');
    return null;
  }

  // Note: Token retrieval is missing in the original code
  token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}

export async function scheduleDailyAttendanceReminder() {
  // Skip notifications on web
  if (Platform.OS === 'web') {
    console.warn('Scheduling notifications is not supported on web.');
    return;
  }

  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Attendance Reminder',
      body: "Don't forget to take attendance for today!",
      data: { type: 'attendance_reminder' },
    },
    trigger: {
      hour: 9,
      minute: 0,
      repeats: true, // Use repeats for daily notifications
    },
  });
}

export async function sendAttendanceCompletedNotification(className: string) {
  // Skip notifications on web
  if (Platform.OS === 'web') {
    console.warn('Immediate notifications are not supported on web.');
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Attendance Saved',
      body: `Attendance for ${className} has been successfully saved.`,
      data: { type: 'attendance_completed' },
    },
    trigger: null, // Immediate notification
  });
}