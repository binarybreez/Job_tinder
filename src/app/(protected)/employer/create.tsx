import { useAuth } from "@clerk/clerk-expo";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CreateJob = () => {
  const router = useRouter();
  const { userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert("Error", "Job description is required");
      return;
    }

    setLoading(true);
    try {
      const jobData = {
        description,
        employer_id: userId,
        is_active: true,
        posted_at: new Date(),
      };

      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert("Success", "Job posted successfully!", [
        { text: "OK", onPress: () => router.push("/(protected)/employer/EmployerJobs") },
      ]);
    } catch (error) {
      console.error("Error creating job:", error);
      Alert.alert("Error", "Failed to create job posting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <AntDesign name="arrowleft" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Job Posting</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Job Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe the role, company culture, and what you're looking for..."
          value={description}
          onChangeText={setDescription}
          multiline
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <AntDesign name="loading1" size={20} color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Post Job</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    minHeight: 150,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#3B82F6",
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CreateJob;
