import { useAuth } from "@clerk/clerk-expo";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ProfileStatus {
  profile_completed: boolean;
  first_name: string;
  last_name: string;
  company_name: string;
}

const CreateJob = () => {
  const router = useRouter();
  const { userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [description, setDescription] = useState("");
  const [profileStatus, setProfileStatus] = useState<ProfileStatus | null>(null);

  useEffect(() => {
    checkProfileCompletion();
  }, []);

  const checkProfileCompletion = async () => {
    try {
      // Replace with your API endpoint
      // const response = await fetch(`/api/employer/${userId}/profile/status`);
      // if (response.ok) {
      //   const data = await response.json();
      //   setProfileStatus(data);
      //   if (!data.profile_completed) {
      //     Alert.alert(
      //       "Profile Incomplete",
      //       "Please complete your profile before posting jobs.",
      //       [
      //         { text: "Cancel", onPress: () => router.back() },
      //         { text: "Complete Profile", onPress: () => router.push("/(protected)/employer/EmployerProfile") }
      //       ]
      //     );
      //   }
      // } else {
      //   throw new Error("Profile not found");
      // }

      // Mock: Simulate profile check
      const mockProfileStatus = {
        profile_completed: false, // Change to true to test completed profile
        first_name: "",
        last_name: "",
        company_name: "",
      };
      
      setProfileStatus(mockProfileStatus);
      
      if (!mockProfileStatus.profile_completed) {
        Alert.alert(
          "Profile Incomplete",
          "Please complete your profile before posting jobs.",
          [
            { text: "Cancel", onPress: () => router.back() },
            { text: "Complete Profile", onPress: () => router.push("/(protected)/employer/EmployerProfile") }
          ]
        );
      }
    } catch (error) {
      console.error("Error checking profile:", error);
      Alert.alert(
        "Error",
        "Unable to verify profile status. Please try again.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } finally {
      setCheckingProfile(false);
    }
  };

  const handleSubmit = async () => {
    if (!profileStatus?.profile_completed) {
      Alert.alert(
        "Profile Required",
        "Please complete your profile before posting jobs.",
        [
          { text: "Cancel" },
          { text: "Complete Profile", onPress: () => router.push("/(protected)/employer/EmployerProfile") }
        ]
      );
      return;
    }

    if (!description.trim()) {
      Alert.alert("Error", "Job description is required");
      return;
    }

    setLoading(true);
    try {
      const jobData = {
        description,
        employer_id: userId,
        company_name: profileStatus.company_name,
        employer_name: `${profileStatus.first_name} ${profileStatus.last_name}`,
        is_active: true,
        posted_at: new Date(),
      };

      // Replace with your API endpoint
      // const response = await fetch('/api/jobs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(jobData),
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to create job');
      // }

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

  if (checkingProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <AntDesign name="loading1" size={32} color="#3B82F6" />
          <Text style={styles.loadingText}>Verifying profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profileStatus?.profile_completed) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <AntDesign name="arrowleft" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Job Posting</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.profileRequiredContainer}>
          <AntDesign name="warning" size={64} color="#F59E0B" />
          <Text style={styles.profileRequiredTitle}>Profile Required</Text>
          <Text style={styles.profileRequiredMessage}>
            You need to complete your employer profile before you can post jobs.
          </Text>
          <TouchableOpacity
            style={styles.completeProfileButton}
            onPress={() => router.push("/(protected)/employer/EmployerProfile")}
          >
            <Text style={styles.completeProfileButtonText}>Complete Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <AntDesign name="arrowleft" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Job Posting</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Company Info Display */}
      <View style={styles.companyInfoSection}>
        <Text style={styles.companyInfoTitle}>Posting as:</Text>
        <Text style={styles.companyName}>{profileStatus.company_name}</Text>
        <Text style={styles.employerName}>
          {profileStatus.first_name} {profileStatus.last_name}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Job Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe the role, requirements, responsibilities, and what you're looking for in a candidate..."
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <Text style={styles.helperText}>
          Include details about the position, required skills, experience level, and company culture.
        </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  profileRequiredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  profileRequiredTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 24,
    marginBottom: 12,
  },
  profileRequiredMessage: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  completeProfileButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  completeProfileButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
  companyInfoSection: {
    backgroundColor: "#fff",
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  companyInfoTitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  employerName: {
    fontSize: 14,
    color: "#6B7280",
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
  helperText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
    lineHeight: 16,
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