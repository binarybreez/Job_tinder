import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

const Role = () => {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  async function handleRoleSubmission(role: string) {
    setLoading(true);
    try {
      if (user) {
        await user.update({
          unsafeMetadata: {
            role: role,
            updatedAt: new Date().toISOString()
          }
        });
      }

      if (role === "EMPLOYER") {
        router.replace("/(protected)/employer");
      } else {
        router.replace("/(protected)/seeker");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="h-[80%] w-[92%] mx-auto flex items-center justify-center border-2 rounded-3xl gap-8">
      <Text className="font-bold text-3xl">Tell Us About Yourself</Text>
      <Text className="text-lg text-gray-600 text-center px-4">
        Select your role to get started
      </Text>
      
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      
      <View className="flex gap-4">
        <TouchableOpacity
          className="border-2 border-blue-500 rounded-2xl px-12 py-4 bg-blue-50"
          onPress={() => handleRoleSubmission("EMPLOYER")}
          disabled={loading}
        >
          <Text className="text-center font-bold text-xl text-blue-700">
            I'm an Employer
          </Text>
          <Text className="text-center text-sm text-gray-600 mt-1">
            Looking to hire talent
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="border-2 border-green-500 rounded-2xl px-12 py-4 bg-green-50"
          onPress={() => handleRoleSubmission("JOB_SEEKER")}
          disabled={loading}
        >
          <Text className="text-center font-bold text-xl text-green-700">
            I'm a Job Seeker
          </Text>
          <Text className="text-center text-sm text-gray-600 mt-1">
            Looking for opportunities
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Role;
