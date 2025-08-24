import { useAuth } from "@clerk/clerk-expo";
import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

const SeekerLayout = () => {
  const { signOut } = useAuth();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4A90E2", // Blue color for active tabs
        tabBarInactiveTintColor: "#6B7280", // Darker gray color for inactive tabs
        tabBarStyle: {
          position: "absolute",
          bottom:0, // moves tab bar up from bottom
          left: 16,
          right: 16,
          borderRadius: 16,
          height: 70,
          backgroundColor: "#1A1A1A", // Much darker background color
          elevation: 5, // shadow for Android
          shadowColor: "#000", // shadow for iOS
          shadowOpacity: 0.5,
          shadowOffset: { width: 0, height: 5 },
          shadowRadius: 10,
          borderWidth: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginBottom: 8,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: "Hinge",
          title: "Home",
          headerTintColor: "#FF5700",
          tabBarIcon: ({ color, focused }) => (
            <AntDesign 
              name="home" 
              size={24} 
              color={focused ? "#4A90E2" : "#6B7280"} 
            />
          ),
          headerRight: () => (
            <Feather
              name="log-out"
              size={26}
              className="mr-4"
              onPress={() => signOut()}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="SeekerJobs"
        options={{
          headerShown: true,
          headerTitle: "Industrial Jobs",
          headerStyle: {
            backgroundColor: "#2C3E50", // Dark blue-gray header background to match image
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTintColor: "#FFFFFF", // White text
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: "600",
            color: "#FFFFFF",
          },
          title: "Jobs",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name="briefcase-outline" 
              size={24} 
              color={focused ? "#4A90E2" : "#6B7280"} 
            />
          ),
          headerRight: () => (
            <Ionicons
              name="share-outline"
              size={22}
              color="#FFFFFF"
              style={{ marginRight: 16 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="SavedJobs"
        options={{
          headerShown: false,
          title: "Saved",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name="bookmark-outline"
              size={24}
              color={focused ? "#4A90E2" : "#6B7280"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="SeekerProfile"
        options={{
          headerShown: false,
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name="person-outline" 
              size={24} 
              color={focused ? "#4A90E2" : "#6B7280"} 
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default SeekerLayout;