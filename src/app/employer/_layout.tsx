import { Tabs } from "expo-router";
import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";

const EmployerLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'black',
        headerShown:false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 8, // ⬆️ moves tab bar up from bottom
          left: 16,
          right: 16,
          borderRadius: 16,
          height: 70,
          backgroundColor: '#fff',
          elevation: 5, // shadow for Android
          shadowColor: '#000', // shadow for iOS
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: 5 },
          shadowRadius: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: 'Reddit',
          title: 'Home',
          headerTintColor: "#FF5700",
          tabBarIcon: ({ color }) => <AntDesign name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="EmployerProfile"
        options={{

          title: 'Profile',
          tabBarIcon: ({ color }) => <Feather name="users" size={24} color={color} />
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color }) => <AntDesign name="plus" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="EmployerJobs"
        options={{
          title: 'Jobs',
          tabBarIcon: ({ color }) => <Ionicons name="chatbubble-ellipses-outline" size={24} color={color} />
        }}
      />
    </Tabs>
  )
}

export default EmployerLayout

