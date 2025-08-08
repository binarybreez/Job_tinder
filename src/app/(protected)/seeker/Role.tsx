import { Text, TouchableOpacity, View } from "react-native";
import React from "react";

const Role = () => {
  async function handleRoleSubmission(role: string) {}
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
