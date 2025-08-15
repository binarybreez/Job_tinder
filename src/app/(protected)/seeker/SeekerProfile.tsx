import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from 'expo-file-system';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";

// Add your API base URL - you can store this in environment variables
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface ParsedResumeData {
  "Full Name"?: string;
  Email?: string;
  "Phone Number"?: string;
  "LinkedIn Profile"?: string;
  Skills?: string[];
  Experience?: Array<{
    Company: string;
    Role: string;
    Duration: string;
    Description: string;
  }>;
  Education?: Array<{
    Degree: string;
    University: string;
    Year: string;
  }>;
  Certifications?: string[];
  Projects?: Array<{
    Name: string;
    Description: string;
  }>;
}

const SeekerProfile = () => {
  const { signOut, userId } = useAuth();
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [clerkId, setClerkId] = useState("");
  const { user } = useUser();
  const userRole = user?.unsafeMetadata?.role || "JOB_SEEKER";
  const isNew = user?.unsafeMetadata?.new
  console.log(isNew,"user type")
  const [isUploading, setIsUploading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Set clerkId from authenticated user
  useEffect(() => {
    if (userId) {
      setClerkId(userId);
      if(!isNew){
        fetchUserProfile()
      }
    }
  }, []);

  const showAlert = (title: string, message: string) => {
    Alert.alert(title, message);
  };

  // Fetch existing user profile
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/users/me?clerk_id=${userId}`
      );

      if (response.status === 200) {
        const profile = response.data;
        setUserProfile(profile);
        // If user already has parsed resume data, show it
        if (profile.skills || profile.experience) {
          const formattedData: ParsedResumeData = {
            "Full Name": profile.full_name,
            Email: profile.email,
            "Phone Number": profile.phone,
            "LinkedIn Profile": profile.social_links?.linkedin,
            Skills: profile.skills,
            Experience: profile.experience?.map((exp: any) => ({
              Company: exp.company,
              Role: exp.position,
              Duration: exp.duration,
              Description: exp.description,
            })),
            Education: profile.education?.map((edu: any) => ({
              Degree: edu.degree,
              University: edu.institution,
              Year: edu.year,
            })),
            Certifications: profile.certifications,
            Projects: profile.projects,
          };
          setParsedData(formattedData);
        }
      } else {
        console.log(
          "Failed to fetch user profile:",
          response.status,
          response.statusText
        );
        return;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];

        // Check file size (5MB limit to match backend)
        if (file.size && file.size > 5 * 1024 * 1024) {
          showAlert("File too large", "Please select a file smaller than 5MB");
          return;
        }

        setSelectedFile(file);
      }
    } catch (error) {
      console.log(error);
      showAlert("Error", "Failed to pick document");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !clerkId || !userRole) {
      showAlert(
        "Missing Information",
        "Please fill in all fields and select a file"
      );
      return;
    }

    setIsUploading(true);

    try {
      //Read file as blob
      const fileUri = selectedFile.uri;
    const fileInfo = await FileSystem.getInfoAsync(selectedFile.uri);
    if (!fileInfo.exists) throw new Error("File does not exist");

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", {
        uri: fileUri,
        type: selectedFile.mimeType || "application/pdf",
        name: selectedFile.name,
      } as any);
      formData.append("clerk_id", clerkId);
      formData.append("user_role", "job_seeker");

      const response = await fetch(
      `${API_BASE_URL}/api/users/upload`,
      {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      }
    );
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Upload failed");

      if (data) {
        setParsedData(data);
        console.log(data, "parsed data from upload");
      }

      // Refresh user profile to get updated data
      await fetchUserProfile();

      showAlert("Success", "Resume uploaded and parsed successfully!");
    } catch (error: any) {
      console.error("Upload error:", error);
      showAlert("Error", error.message || "Failed to upload resume");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const renderSkillTag = (skill: string, index: number) => (
    <View key={index} style={styles.skillTag}>
      <Text style={styles.skillText}>{skill}</Text>
    </View>
  );

  const renderExperienceItem = (exp: any, index: number) => (
    <View key={index} style={styles.experienceItem}>
      <Text style={styles.experienceTitle}>{exp.Role || exp.position}</Text>
      <Text style={styles.experienceCompany}>
        {exp.Company || exp.company} • {exp.Duration || exp.duration}
      </Text>
      {(exp.Description || exp.description) && (
        <Text style={styles.experienceDescription}>
          {exp.Description || exp.description}
        </Text>
      )}
    </View>
  );

  const renderEducationItem = (edu: any, index: number) => (
    <View key={index} style={styles.educationItem}>
      <Text style={styles.educationDegree}>{edu.Degree || edu.degree}</Text>
      <Text style={styles.educationInstitution}>
        {edu.University || edu.institution} • {edu.Year || edu.year}
      </Text>
    </View>
  );

  const renderProjectItem = (project: any, index: number) => (
    <View key={index} style={styles.projectItem}>
      <Text style={styles.projectName}>{project.Name || project.name}</Text>
      <Text style={styles.projectDescription}>
        {project.Description || project.description}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.mainTitle}>Job Seeker Profile</Text>
            </View>
            <TouchableOpacity
              onPress={handleSignOut}
              style={styles.signOutIconButton}
            >
              <Ionicons name="log-out-outline" size={24} color="#dc2626" />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>
            Manage your professional information and upload your resume
          </Text>
        </View>

        {/* Resume Upload Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cloud-upload-outline" size={20} color="#2563eb" />
            <Text style={styles.cardTitle}>Resume Upload</Text>
          </View>
          <Text style={styles.cardDescription}>
            Select your resume file and provide your details
          </Text>

          {/* File Upload Area */}
          <TouchableOpacity style={styles.uploadArea} onPress={pickDocument}>
            <View style={styles.uploadIcon}>
              <Ionicons name="cloud-upload-outline" size={32} color="#2563eb" />
            </View>
            <Text style={styles.uploadTitle}>Upload your resume</Text>
            <Text style={styles.uploadDescription}>
              Tap here to select your resume file
            </Text>
            <Text style={styles.uploadSubtext}>
              Supports PDF, DOC, DOCX files up to 5MB
            </Text>
            <View style={styles.chooseFileButton}>
              <Text style={styles.chooseFileText}>Choose File</Text>
            </View>

            {selectedFile && (
              <View style={styles.selectedFile}>
                <Text style={styles.selectedFileName}>{selectedFile.name}</Text>
                <Text style={styles.selectedFileSize}>
                  {selectedFile.size
                    ? (selectedFile.size / 1024 / 1024).toFixed(2) + " MB"
                    : "Unknown size"}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Upload Button */}
          <TouchableOpacity
            style={[
              styles.uploadButton,
              (!selectedFile || !userId || !userRole || isUploading) &&
                styles.uploadButtonDisabled,
            ]}
            onPress={handleUpload}
            disabled={!selectedFile || !userId || !userRole || isUploading}
          >
            {isUploading ? (
              <View style={styles.uploadButtonContent}>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text style={styles.uploadButtonText}>Uploading...</Text>
              </View>
            ) : (
              <View style={styles.uploadButtonContent}>
                <Ionicons
                  name="cloud-upload-outline"
                  size={16}
                  color="#ffffff"
                />
                <Text style={styles.uploadButtonText}>Upload Resume</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Parsed Data Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text-outline" size={20} color="#059669" />
            <Text style={styles.cardTitle}>Parsed Resume Data</Text>
          </View>
          <Text style={styles.cardDescription}>
            Extracted information from your resume
          </Text>

          {parsedData ? (
            <View style={styles.parsedDataContainer}>
              <View style={styles.successIndicator}>
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
                <Text style={styles.successText}>
                  Resume parsed successfully
                </Text>
              </View>

              {/* Basic Information */}
              <View style={styles.dataSection}>
                <Text style={styles.sectionTitle}>Basic Information</Text>
                <Text style={styles.dataText}>
                  Name: {parsedData["Full Name"]}
                </Text>
                <Text style={styles.dataText}>
                  Email: {parsedData["Email"]}
                </Text>
                {parsedData["Phone Number"] && (
                  <Text style={styles.dataText}>
                    Phone: {parsedData["Phone Number"]}
                  </Text>
                )}
                {parsedData["LinkedIn Profile"] && (
                  <Text style={styles.dataText}>
                    LinkedIn: {parsedData["LinkedIn Profile"]}
                  </Text>
                )}
              </View>

              {/* Skills */}
              {parsedData["Skills"] && parsedData["Skills"].length > 0 && (
                <View style={styles.dataSection}>
                  <Text style={styles.sectionTitle}>Skills</Text>
                  <View style={styles.skillsContainer}>
                    {parsedData["Skills"].map(renderSkillTag)}
                  </View>
                </View>
              )}

              {/* Experience */}
              {parsedData["Experience"] &&
                parsedData["Experience"].length > 0 && (
                  <View style={styles.dataSection}>
                    <Text style={styles.sectionTitle}>Experience</Text>
                    <View style={styles.experienceContainer}>
                      {parsedData["Experience"].map(renderExperienceItem)}
                    </View>
                  </View>
                )}

              {/* Education */}
              {parsedData["Education"] &&
                parsedData["Education"].length > 0 && (
                  <View style={styles.dataSection}>
                    <Text style={styles.sectionTitle}>Education</Text>
                    <View style={styles.educationContainer}>
                      {parsedData["Education"].map(renderEducationItem)}
                    </View>
                  </View>
                )}

              {/* Certifications */}
              {parsedData["Certifications"] &&
                parsedData["Certifications"].length > 0 && (
                  <View style={styles.dataSection}>
                    <Text style={styles.sectionTitle}>Certifications</Text>
                    <View style={styles.skillsContainer}>
                      {parsedData["Certifications"].map((cert, index) => (
                        <View key={index} style={styles.skillTag}>
                          <Text style={styles.skillText}>{cert}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

              {/* Projects */}
              {parsedData["Projects"] && parsedData["Projects"].length > 0 && (
                <View style={styles.dataSection}>
                  <Text style={styles.sectionTitle}>Projects</Text>
                  <View style={styles.projectContainer}>
                    {parsedData["Projects"].map(renderProjectItem)}
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color="#d1d5db"
              />
              <Text style={styles.emptyStateText}>
                Upload a resume to see parsed data here
              </Text>
            </View>
          )}
        </View>

        {/* Sign Out Section - Removed since we added it to header */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SeekerProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    paddingTop: Platform.OS === "ios" ? 20 : 20,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    width: "100%",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  signOutIconButton: {
    padding: 8,
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20,
    lineHeight: 20,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#fafafa",
  },
  uploadIcon: {
    width: 64,
    height: 64,
    backgroundColor: "#dbeafe",
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  uploadDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 20,
  },
  uploadSubtext: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 16,
  },
  chooseFileButton: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  chooseFileText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374751",
  },
  selectedFile: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#d1fae5",
    borderRadius: 8,
    alignItems: "center",
  },
  selectedFileName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#065f46",
    marginBottom: 4,
  },
  selectedFileSize: {
    fontSize: 12,
    color: "#059669",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374751",
    marginBottom: 8,
  },
  selectInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  selectText: {
    fontSize: 14,
    color: "#111827",
  },
  placeholder: {
    color: "#9ca3af",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  dropdownText: {
    fontSize: 14,
    color: "#111827",
  },
  uploadButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  uploadButtonDisabled: {
    backgroundColor: "#d1d5db",
  },
  uploadButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  parsedDataContainer: {
    maxHeight: 400,
  },
  successIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  successText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#059669",
    marginLeft: 8,
  },
  dataSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  dataText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
    lineHeight: 20,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillTag: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  skillText: {
    fontSize: 12,
    color: "#1e40af",
    fontWeight: "500",
  },
  experienceContainer: {
    gap: 8,
  },
  experienceItem: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
  },
  experienceTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  experienceCompany: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  experienceDescription: {
    fontSize: 12,
    color: "#374751",
    lineHeight: 16,
  },
  educationContainer: {
    gap: 8,
  },
  educationItem: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
  },
  educationDegree: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  educationInstitution: {
    fontSize: 12,
    color: "#6b7280",
  },
  projectContainer: {
    gap: 8,
  },
  projectItem: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
  },
  projectName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 12,
    color: "#374751",
    lineHeight: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 12,
    textAlign: "center",
  },
});
