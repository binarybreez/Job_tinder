import { Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

const Role = () => {
  const router = useRouter();
  async function handleRoleSubmission(role: string) {
    if (role === "EMPLOYER") {
      router.push("/(protected)/employer");
    }
    router.push("/(protected)/seeker");
  }
  return (
    <View className="h-[80%] w-[92%] mx-auto flex items-center justify-center border-2 rounded-3xl gap-8">
      <Text className="font-bold text-3xl">Tell Us About Yourself</Text>
      <View className="flex gap-4 ">
        <TouchableOpacity
          className="border-2 rounded-2xl px-12 py-2"
          onPress={() => handleRoleSubmission("EMPLOYER")}
        >
          <Text className="text-center font-bold text-xl">Employer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="border-2 rounded-2xl px-12 py-2"
          onPress={() => handleRoleSubmission("JOB_SEEKER")}
        >
          <Text className="text-center font-bold text-xl">Job Seeker</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Role;
