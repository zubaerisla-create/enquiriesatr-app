import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { registerDeviceToken, unregisterDeviceToken } from "../lib/notifications";

// Configure how notifications should behave when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldPresentAlert: true,
  }),
});

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  const { accessToken, user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const registerForPush = async () => {
    if (Platform.OS === "web") {
      return;
    }

    try {
      // Set up Android notification channel
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Default Alerts",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#C0392B",
          enableLights: true,
          enableVibrate: true,
          showBadge: true,
        });
      }

      // Check / request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        setPermissionGranted(false);
        return;
      }

      setPermissionGranted(true);

      // Get device push token (direct FCM on Android / APNs on iOS) or Expo token
      let token = "";
      try {
        const deviceTokenResult = await Notifications.getDevicePushTokenAsync();
        token = deviceTokenResult.data;
      } catch {
        // Fallback to Expo push token
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        const expoTokenResult = await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : undefined
        );
        token = expoTokenResult.data;
      }

      if (token) {
        setExpoPushToken(token);
      }
    } catch (error) {
      console.warn("Failed to register for push notifications:", error);
    }
  };

  useEffect(() => {
    // Initial channel setup & listener setup
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "Default Alerts",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#C0392B",
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
      });
    }
  }, []);


  // Sync token with backend once user is authenticated
  useEffect(() => {
    if (!accessToken || !user || !expoPushToken) {
      return;
    }

    let isMounted = true;
    const deviceType = Platform.OS === "ios" ? "ios" : Platform.OS === "android" ? "android" : "web";
    const deviceId = Constants.deviceName || undefined;

    registerDeviceToken(expoPushToken, deviceType, deviceId).catch((err) => {
      console.warn("Failed to register push token with backend:", err);
    });

    return () => {
      isMounted = false;
    };
  }, [accessToken, user, expoPushToken]);


  // Set up listeners for received notifications and tap responses
  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener(() => {
      // Invalidate queries so unread count and notification list refresh automatically
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      // Tapping notification navigates to in-app notification center
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
      router.push("/notifications");
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [queryClient, router]);

  const unregisterToken = async () => {
    if (expoPushToken) {
      try {
        await unregisterDeviceToken(expoPushToken);
      } catch (err) {
        console.warn("Failed to unregister push token:", err);
      }
    }
  };

  return {
    expoPushToken,
    permissionGranted,
    registerForPush,
    requestPermissions: registerForPush,
    unregisterToken,
  };
}

