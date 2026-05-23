import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0D1520',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="my-notes" options={{ title: 'My Notes' }} />
      <Stack.Screen name="my-documents" options={{ title: 'My Documents' }} />
      <Stack.Screen name="tools-log" options={{ headerShown: false }} />
      <Stack.Screen name="assessments" options={{ title: 'Assessments' }} />
      <Stack.Screen name="subscription-billing" options={{ title: 'Subscription & Billing' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      <Stack.Screen name="help-support" options={{ title: 'Help & Support' }} />
      <Stack.Screen name="live-chat" options={{ headerShown: false }} />
      <Stack.Screen name="terms-condition" options={{ title: 'Terms & Conditions' }} />
      <Stack.Screen name="note-editor" options={{ headerShown: false, presentation: 'modal' }} />
    </Stack>
  );
}
