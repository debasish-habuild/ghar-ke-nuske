/**
 * Firebase Cloud Messaging (FCM) integration.
 *
 * This module connects the app directly to Firebase via
 * @react-native-firebase/messaging — separate from the Go backend, which talks
 * to Firestore with the Admin SDK. Here we deal only with push: asking the user
 * for permission, fetching the device's FCM token, and reacting to messages.
 *
 * NOTE: this requires a custom dev build (or production build). It does NOT
 * work in Expo Go, because the native Firebase SDK is not bundled there.
 */
import messaging, {
  FirebaseMessagingTypes,
} from "@react-native-firebase/messaging";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/**
 * Foreground presentation: FCM delivers the data to onMessage while the app is
 * open, but Android won't draw a tray notification itself in that state — we
 * present one via expo-notifications so the user actually sees it.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Ask the OS for notification permission.
 *
 * On Android 13+ this surfaces the runtime POST_NOTIFICATIONS dialog; on older
 * Android it is granted at install time. Returns true when authorized.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const authStatus = await messaging().requestPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
}

/**
 * Fetch the FCM registration token for this device/install. This is what a
 * server (or the Firebase console) targets to send a push to this device.
 */
export async function getFcmToken(): Promise<string | null> {
  try {
    // On Android the device auto-registers; this just retrieves the token.
    const token = await messaging().getToken();
    return token;
  } catch (err) {
    console.warn("[fcm] failed to get token", err);
    return null;
  }
}

/**
 * Present an incoming FCM message as a local notification (used for the
 * foreground case).
 */
async function present(message: FirebaseMessagingTypes.RemoteMessage) {
  const { title, body } = message.notification ?? {};
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title ?? "Ghar Ke Nuskhe",
      body: body ?? "",
      data: message.data ?? {},
    },
    trigger: null, // fire immediately
  });
}

/**
 * Wire up messaging once the app is running.
 *
 * Returns an unsubscribe function that detaches the foreground and token-
 * refresh listeners (call it on unmount). Logs the token so it can be copied
 * for test sends from the Firebase console.
 */
export async function initMessaging(): Promise<() => void> {
  const granted = await requestNotificationPermission();
  if (!granted) {
    console.log("[fcm] notification permission not granted");
    return () => {};
  }

  const token = await getFcmToken();
  if (token) {
    console.log("[fcm] device token:", token);
  }

  // Foreground messages: present them ourselves.
  const unsubMessage = messaging().onMessage(async (message) => {
    console.log("[fcm] foreground message", message.messageId);
    await present(message);
  });

  // Tokens can rotate; keep our copy fresh (and, in a real app, re-sync to the
  // backend so it keeps targeting the right device).
  const unsubRefresh = messaging().onTokenRefresh((next) => {
    console.log("[fcm] token refreshed:", next);
  });

  if (Platform.OS === "android") {
    // A default channel so notifications have a category on Android 8+.
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return () => {
    unsubMessage();
    unsubRefresh();
  };
}
