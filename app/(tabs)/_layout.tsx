import { Tabs } from "expo-router";
import { 
  Home, 
  BookOpen, 
  Cpu, 
  SquareCheck, 
  User 
} from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#15202B",
          borderTopColor: "#1a2634",
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 12,
          paddingTop: 1,
        },
        tabBarActiveTintColor: "#D82C15",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "bold",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Home size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: "Learn",
          tabBarIcon: ({ color, size }) => (
            <BookOpen size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="gradian"
        options={{
          title: "Gradian",
          tabBarIcon: ({ color, size }) => (
            <Cpu size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: "Tools",
          tabBarIcon: ({ color, size }) => (
            <SquareCheck size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <User size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
