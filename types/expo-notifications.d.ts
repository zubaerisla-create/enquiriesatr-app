declare module "expo-notifications" {
  export interface NotificationBehavior {
    shouldShowAlert?: boolean;
    shouldPlaySound?: boolean;
    shouldSetBadge?: boolean;
    shouldShowBanner?: boolean;
    shouldPresentAlert?: boolean;
  }

  export interface NotificationResponse {
    notification: any;
    actionIdentifier: string;
    userText?: string;
  }

  export interface Subscription {
    remove: () => void;
  }

  export enum AndroidImportance {
    UNKNOWN = 0,
    UNSPECIFIED = 1,
    NONE = 2,
    MIN = 3,
    LOW = 4,
    DEFAULT = 5,
    HIGH = 6,
    MAX = 7,
  }

  export interface NotificationChannelInput {
    name: string | null;
    importance: AndroidImportance;
    bypassDnd?: boolean;
    description?: string | null;
    groupId?: string | null;
    lightColor?: string;
    lockscreenVisibility?: number;
    showBadge?: boolean;
    sound?: string | null;
    audioAttributes?: any;
    vibrationPattern?: number[] | null;
    enableLights?: boolean;
    enableVibrate?: boolean;
  }

  export function setNotificationHandler(handler: {
    handleNotification: (notification: any) => Promise<NotificationBehavior>;
    handleSuccess?: (notificationId: string) => void;
    handleError?: (notificationId: string, error: Error) => void;
  }): void;

  export function getPermissionsAsync(): Promise<{ status: string; granted: boolean }>;
  export function requestPermissionsAsync(): Promise<{ status: string; granted: boolean }>;
  export function getDevicePushTokenAsync(): Promise<{ data: string; type: string }>;
  export function getExpoPushTokenAsync(options?: { projectId?: string }): Promise<{ data: string; type: string }>;
  export function setNotificationChannelAsync(
    channelId: string,
    channel: NotificationChannelInput
  ): Promise<any>;

  export function addNotificationReceivedListener(
    listener: (notification: any) => void
  ): Subscription;

  export function addNotificationResponseReceivedListener(
    listener: (response: NotificationResponse) => void
  ): Subscription;
}
