# Push & In-App Notification System Documentation (FCM & Expo Integration)

This document provides complete documentation for the notification architecture across the **Enquiries Mobile App** (Expo SDK 55 / React Native) and the **Enquiries Backend** (Django 6.0.3 / Celery 5.6.3 / Firebase Admin SDK 7.5.0).

---

## 1. System Overview & Status

| Component | Technology | Implementation Status |
| :--- | :--- | :--- |
| **Mobile App (`enquiries-app`)** | React Native 0.83.6, Expo SDK 55, `expo-notifications`, `expo-constants` | ✅ **Fully Implemented**: Permission popup on Home screen, device token registration, foreground alerts, unread badges, tap listener routing to `/notifications`. |
| **Backend (`enquiries-backend`)** | Django 6.0.3, Celery 5.6.3, Redis, `firebase-admin` 7.5.0 | ✅ **Fully Implemented**: `DeviceToken` model & migrations, token registration/unregistration APIs, FCM multicast dispatch pipeline, preference-checked push dispatch via Celery. |
| **Admin Dashboard (`enquiries-dash`)** | Next.js Backoffice | ✅ **Implemented**: System alert preferences and staff notification email delivery. |

---

## 2. End-to-End Notification Workflow

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    PUSH NOTIFICATION PIPELINE                                    │
│                                                                                                  │
│   1. Mobile App Launch / Home Screen                                                             │
│      ├── User opens Home Screen (`app/(tabs)/index.tsx`)                                         │
│      ├── `registerForPush()` requests notification permission                                    │
│      ├── Device push token retrieved via `expo-notifications`                                    │
│      └── Token synced to backend: `POST /api/notifications/devices/register/`                    │
│                                                                                                  │
│   2. Event Trigger & Notification Creation (Backend)                                             │
│      ├── Action triggers `notification_create(user, type, title, body)`                          │
│      ├── DB record created in `Notification` table                                               │
│      ├── If staff recipient ──► Celery email task `send_notification_email_task`                 │
│      └── Preference check: `_should_send_user_push(user, type)`                                  │
│               │                                                                                  │
│               ▼ (If Enabled by User Preferences)                                                 │
│   3. Async Celery Task (`send_push_notification_to_user_task`)                                   │
│      ├── Fetch active device tokens from `DeviceToken` table                                     │
│      ├── Calculate unread notification badge count                                               │
│      └── Call `send_push_to_tokens()` in `notifications/firebase_service.py`                     │
│               │                                                                                  │
│               ▼ (FCM Multicast API v1)                                                           │
│   4. Firebase Cloud Messaging (Google FCM / Apple APNs)                                          │
│      ├── Delivers push notification to target device(s)                                          │
│      └── Unregistered / invalid tokens are automatically pruned/deactivated in DB                │
│                                                                                                  │
│   5. Mobile App Reception                                                                        │
│      ├── Foreground: Banner presented via `Notifications.setNotificationHandler`                 │
│      ├── Background / Closed: OS-level notification tray banner                                  │
│      └── User taps banner ──► `responseListener` navigates to `/notifications`                   │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Backend Architecture (`enquiries-backend`)

### 3.1 Data Models (`notifications/models.py`)

1. **`Notification`**:
   - `user`: ForeignKey to `User`
   - `type`: `lesson`, `ai`, `streak`, `system`, `achievement`
   - `title`: Notification title (max length 255)
   - `body`: Notification text content
   - `is_read`: Boolean (default `False`)
   - `is_dismissed`: Boolean (default `False`)
   - `created_at` / `updated_at`: Timestamps

2. **`DeviceToken`**:
   - `user`: ForeignKey to `User`
   - `token`: Unique FCM device registration token (max length 512, indexed)
   - `device_type`: `ios`, `android`, `web`
   - `device_id`: Device model name or client identifier (optional)
   - `is_active`: Boolean flag for token validity
   - `last_used_at`: Timestamp updated on each registration / use

3. **`UserNotificationPreference`**:
   - `new_content_added`: Boolean toggle
   - `lesson_reminder`: Boolean toggle
   - `streak_alert`: Boolean toggle

4. **`AdminNotificationPreference`**:
   - System alert toggles for admin staff (`new_user_signup`, `sub_payment_received`, `sub_payment_failed`, etc.)

---

### 3.2 Firebase Service & FCM Delivery (`notifications/firebase_service.py`)

- **SDK Initialization**: Lazily loads `firebase-admin` credentials from `FIREBASE_CREDENTIALS_PATH` (file path) or `FIREBASE_CREDENTIALS_JSON` (raw JSON string).
- **Multicast Dispatch**: Uses `messaging.send_each_for_multicast` in chunks of 500 devices.
- **Token Pruning**: Automatically flags `is_active=False` in the `DeviceToken` table if FCM returns `UnregisteredError` or `SenderIdMismatchError`.
- **Platform Configs**:
  - **Android**: High priority channel `default`, alert sounds, LED light color `#C0392B`.
  - **iOS (APNs)**: Configured APNs payload with sound and dynamic app badge count.

---

### 3.3 REST API Endpoints (`notifications/urls.py`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/notifications/devices/register/` | Register or update an active FCM device token | ✅ Yes |
| `POST` | `/api/notifications/devices/unregister/` | Deactivate device token on logout | ✅ Yes |
| `GET` | `/api/notifications/` | List user's in-app notifications | ✅ Yes |
| `GET` | `/api/notifications/unread-count/` | Get count of unread notifications for badge | ✅ Yes |
| `POST` | `/api/notifications/<id>/read/` | Mark single notification as read | ✅ Yes |
| `POST` | `/api/notifications/mark-all-read/` | Mark all notifications as read | ✅ Yes |
| `POST` | `/api/notifications/<id>/dismiss/` | Dismiss / hide single notification | ✅ Yes |
| `POST` | `/api/notifications/clear-all/` | Dismiss all notifications | ✅ Yes |
| `GET` | `/api/notifications/preferance/` | Get user notification preference toggles | ✅ Yes |
| `PATCH` | `/api/notifications/preferance/update/` | Update user notification preferences | ✅ Yes |

---

## 4. Mobile App Architecture (`enquiries-app`)

### 4.1 Push Notification Hook (`hooks/usePushNotifications.ts`)

- **Permission Management**:
  - `registerForPush()` / `requestPermissions()` triggers the native permission popup on the Home screen.
- **Token Retrieval & Registration**:
  - Automatically requests the native device push token / Expo push token.
  - Syncs the token with `POST /api/notifications/devices/register/` when the user is logged in (`accessToken` available).
- **Foreground Behavior**:
  - Configured with `Notifications.setNotificationHandler` to show banners, play sounds, and update badges while the app is active.
- **Android Channels**:
  - Configures the `default` channel with `MAX` importance and custom vibration patterns.
- **Event Listeners**:
  - Received listener invalidates React Query caches (`notifications`, `notifications-unread-count`) to refresh UI in real time.
  - Response (tap) listener routes user to `/notifications`.

---

## 5. Configuration & Environment Setup

### 5.1 Backend Environment Variables (`enquiries-backend/.env`)

```env
# Path to Firebase Admin SDK Service Account JSON file:
FIREBASE_CREDENTIALS_PATH=/path/to/firebase-service-account.json

# Or raw JSON string:
# FIREBASE_CREDENTIALS_JSON={"type":"service_account",...}
```

### 5.2 Mobile App Setup (`enquiries-app`)

Install dependencies:
```bash
npx expo install expo-notifications
```

Configured in `app.json`:
```json
"plugins": [
  [
    "expo-notifications",
    {
      "icon": "./assets/images/icon.png",
      "color": "#C0392B",
      "defaultChannel": "default"
    }
  ]
]
```