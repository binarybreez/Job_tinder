import { useAuth } from "@clerk/clerk-expo";
import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";

const SeekerLayout = () => {
  const { signOut } = useAuth();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3b82f6", // Matching the blue accent from SeekerJobs
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: {
          position: "absolute",
          bottom: 2,
          left: 20,
          right: 20,
          borderRadius: 20,
          height: 72,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(15, 23, 42, 0.95)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          elevation: 0, // Remove elevation for custom shadow
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowOffset: { width: 0, height: 10 },
          shadowRadius: 20,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={80}
              tint="dark"
              style={{
                ...StyleSheet.absoluteFillObject,
                borderRadius: 20,
                overflow: 'hidden',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
              }}
            />
          ) : null
        ),
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: "Industrial Jobs",
          title: "Home",
          headerStyle: {
            backgroundColor: "#0f172a",
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: "#ffffff",
          headerTitleStyle: {
            fontWeight: '800',
            fontSize: 20,
          },
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <AntDesign name="home" size={22} color={color} />
            </View>
          ),
          headerRight: () => (
            <Feather
              name="log-out"
              size={24}
              color="#64748b"
              style={{ marginRight: 16 }}
              onPress={() => signOut()}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="SeekerJobs"
        options={{
          headerShown: false,
          title: "Jobs",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Ionicons name="briefcase-outline" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="SavedJobs"
        options={{
          headerShown: false,
          title: "Saved",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Ionicons name="bookmark-outline" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="SeekerProfile"
        options={{
          headerShown: false,
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Feather name="user" size={22} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconContainerActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
});

export default SeekerLayout;