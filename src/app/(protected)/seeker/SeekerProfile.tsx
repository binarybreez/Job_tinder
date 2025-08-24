import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Add your API base URL - you can store this in environment variables
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface ParsedResumeData {
  // Personal Info
  "First Name"?: string;
  "Last Name"?: string;
  "Full Name"?: string;
  Email?: string;
  "Phone Number"?: string;
  Location?: string;
  "Willing to relocate"?: boolean;
  
  // Professional Info
  Role?: string;
  "Company details"?: string;
  "Resume file"?: string;
  
  // Skills
  "Technical Skills"?: string[];
  "Soft Skills"?: string[];
  Skills?: string[]; // Keep for backward compatibility
  
  // Experience & Education
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
  
  // Social Links
  "LinkedIn Profile"?: string;
  "GitHub Profile"?: string;
  "Portfolio URL"?: string;
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
  
  // New states for editing functionality
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ParsedResumeData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Set clerkId from authenticated user
  useEffect(() => {
    if (userId) {
      setClerkId(userId);
      if(!isNew){
        fetchUserProfile()
      }
    }
  }, []);

  // Update editedData when parsedData changes
  useEffect(() => {
    if (parsedData) {
      setEditedData({ ...parsedData });
    }
  }, [parsedData]);

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
        if (profile.skills || profile.experience || profile.technical_skills || profile.soft_skills) {
          const formattedData: ParsedResumeData = {
            // Personal Info
            "First Name": profile.first_name,
            "Last Name": profile.last_name,
            "Full Name": profile.full_name,
            Email: profile.email,
            "Phone Number": profile.phone,
            Location: profile.location,
            "Willing to relocate": profile.willing_to_relocate,
            
            // Professional Info
            Role: profile.role || "job_seeker",
            "Company details": profile.current_company,
            "Resume file": profile.resume_filename,
            
            // Skills - prioritize categorized skills over general skills
            "Technical Skills": profile.technical_skills && profile.technical_skills.length > 0 ? profile.technical_skills : null,
            "Soft Skills": profile.soft_skills && profile.soft_skills.length > 0 ? profile.soft_skills : null,
            Skills: profile.skills, // Keep for backward compatibility
            
            // Social Links
            "LinkedIn Profile": profile.social_links?.linkedin,
            "GitHub Profile": profile.social_links?.github,
            "Portfolio URL": profile.social_links?.portfolio,
            
            // Experience, Education, etc.
            Experience: profile.experience?.map((exp: any) => ({
              Company: exp.company,
              Role: exp.position,
              Duration: exp.duration,
              Description: exp.description,
            })),
            Education: profile.education?.map((edu: any) => ({
              Degree: edu.degree,
              University: edu.institution,
              Year: edu.Year || edu.year,
            })),
            Certifications: profile.certifications,
            Projects: profile.projects?.map((proj: any) => ({
              Name: proj.name,
              Description: proj.description,
            })),
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

  // New function to handle saving edited data
  const handleSaveChanges = async () => {
    if (!editedData || !userId) {
      showAlert("Error", "No data to save");
      return;
    }

    setIsSaving(true);

    try {
      // Prepare data for API call
      const updatedProfile = {
        clerk_id: userId,
        // Personal Info
        first_name: editedData["First Name"],
        last_name: editedData["Last Name"],
        full_name: editedData["Full Name"],
        email: editedData.Email,
        phone: editedData["Phone Number"],
        location: editedData.Location,
        willing_to_relocate: editedData["Willing to relocate"],
        
        // Professional Info
        role: editedData.Role,
        current_company: editedData["Company details"],
        
        // Skills
        technical_skills: editedData["Technical Skills"],
        soft_skills: editedData["Soft Skills"],
        skills: editedData.Skills, // Keep for backward compatibility
        
        // Social Links
        social_links: {
          linkedin: editedData["LinkedIn Profile"],
          github: editedData["GitHub Profile"],
          portfolio: editedData["Portfolio URL"]
        },
        
        // Experience, Education, etc.
        experience: editedData.Experience?.map(exp => ({
          company: exp.Company,
          position: exp.Role,
          duration: exp.Duration,
          description: exp.Description
        })),
        education: editedData.Education?.map(edu => ({
          degree: edu.Degree,
          institution: edu.University,
          year: edu.Year
        })),
        certifications: editedData.Certifications,
        projects: editedData.Projects?.map(proj => ({
          name: proj.Name,
          description: proj.Description
        }))
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/users/update-profile`,
        updatedProfile,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.status === 200) {
        setParsedData(editedData);
        setIsEditing(false);
        showAlert("Success", "Profile updated successfully!");
        await fetchUserProfile(); // Refresh the profile
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error: any) {
      console.error("Save error:", error);
      showAlert("Error", error.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedData(parsedData ? { ...parsedData } : null);
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Helper functions for editing
  const updateBasicInfo = (field: string, value: string | boolean) => {
    if (!editedData) return;
    setEditedData({
      ...editedData,
      [field]: value
    });
  };

  const updateSkill = (index: number, value: string) => {
    if (!editedData || !editedData.Skills) return;
    const updatedSkills = [...editedData.Skills];
    updatedSkills[index] = value;
    setEditedData({
      ...editedData,
      Skills: updatedSkills
    });
  };

  const addSkill = () => {
    if (!editedData) return;
    const updatedSkills = editedData.Skills ? [...editedData.Skills, ""] : [""];
    setEditedData({
      ...editedData,
      Skills: updatedSkills
    });
  };

  const removeSkill = (index: number) => {
    if (!editedData || !editedData.Skills) return;
    const updatedSkills = editedData.Skills.filter((_, i) => i !== index);
    setEditedData({
      ...editedData,
      Skills: updatedSkills
    });
  };

  // Render functions
  const renderSkillTag = (skill: string, index: number) => (
    <View key={index} style={styles.skillTag}>
      <Text style={styles.skillText}>{skill}</Text>
    </View>
  );

  const renderEditableSkills = () => {
    if (!editedData?.Skills) return null;
    
    return (
      <View style={styles.editableSkillsContainer}>
        {editedData.Skills.map((skill, index) => (
          <View key={index} style={styles.editableSkillItem}>
            <TextInput
              style={styles.skillInput}
              value={skill}
              onChangeText={(text) => updateSkill(index, text)}
              placeholder="Enter skill"
            />
            <TouchableOpacity
              onPress={() => removeSkill(index)}
              style={styles.removeSkillButton}
            >
              <Ionicons name="close-circle" size={20} color="#dc2626" />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity onPress={addSkill} style={styles.addSkillButton}>
          <Ionicons name="add-circle-outline" size={16} color="#2563eb" />
          <Text style={styles.addSkillText}>Add Skill</Text>
        </TouchableOpacity>
      </View>
    );
  };

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

  const renderEditableBasicInfo = () => {
    if (!editedData) return null;

    return (
      <View style={styles.editableSection}>
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>First Name</Text>
            <TextInput
              style={styles.textInput}
              value={editedData["First Name"] || ""}
              onChangeText={(text) => updateBasicInfo("First Name", text)}
              placeholder="Enter first name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Last Name</Text>
            <TextInput
              style={styles.textInput}
              value={editedData["Last Name"] || ""}
              onChangeText={(text) => updateBasicInfo("Last Name", text)}
              placeholder="Enter last name"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.textInput}
            value={editedData.Email || ""}
            onChangeText={(text) => updateBasicInfo("Email", text)}
            placeholder="Enter email"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.textInput}
              value={editedData["Phone Number"] || ""}
              onChangeText={(text) => updateBasicInfo("Phone Number", text)}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Location</Text>
            <TextInput
              style={styles.textInput}
              value={editedData.Location || ""}
              onChangeText={(text) => updateBasicInfo("Location", text)}
              placeholder="Enter location"
            />
          </View>
        </View>

        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => updateBasicInfo("Willing to relocate", !editedData["Willing to relocate"])}
          >
            <Ionicons
              name={editedData["Willing to relocate"] ? "checkbox" : "square-outline"}
              size={20}
              color={editedData["Willing to relocate"] ? "#2563eb" : "#9ca3af"}
            />
            <Text style={styles.checkboxLabel}>Willing to relocate</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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

        {/* Parsed Data Card - Now appears first */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text-outline" size={20} color="#059669" />
            <Text style={styles.cardTitle}>Professional Profile</Text>
            {parsedData && (
              <View style={styles.cardHeaderActions}>
                {isEditing ? (
                  <>
                    <TouchableOpacity
                      onPress={handleCancelEdit}
                      style={[styles.actionButton, styles.cancelButton]}
                      disabled={isSaving}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleSaveChanges}
                      style={[styles.actionButton, styles.saveButton]}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <>
                          <Ionicons name="checkmark" size={16} color="#ffffff" />
                          <Text style={styles.saveButtonText}>Save</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    onPress={() => setIsEditing(true)}
                    style={[styles.actionButton, styles.editButton]}
                  >
                    <Ionicons name="pencil" size={16} color="#2563eb" />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
          <Text style={styles.cardDescription}>
            {parsedData 
              ? "Your professional information extracted from your resume" 
              : "Upload a resume to extract and manage your professional information"
            }
          </Text>

          {parsedData ? (
            <View style={styles.parsedDataContainer}>
              {!isEditing && (
                <View style={styles.successIndicator}>
                  <Ionicons name="checkmark-circle" size={16} color="#059669" />
                  <Text style={styles.successText}>
                    Profile data available
                  </Text>
                </View>
              )}

              {/* Personal Information */}
              <View style={styles.dataSection}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                {isEditing ? (
                  renderEditableBasicInfo()
                ) : (
                  <View style={styles.infoContainer}>
                    <Text style={styles.dataText}>
                      Name: {parsedData["Full Name"] || [parsedData["First Name"], parsedData["Last Name"]].filter(Boolean).join(" ") || "Not provided"}
                    </Text>
                    <Text style={styles.dataText}>
                      Email: {parsedData.Email || "Not provided"}
                    </Text>
                    <Text style={styles.dataText}>
                      Phone: {parsedData["Phone Number"] || "Not provided"}
                    </Text>
                    {parsedData.Location && (
                      <Text style={styles.dataText}>Location: {parsedData.Location}</Text>
                    )}
                    <Text style={styles.dataText}>
                      Willing to relocate: {parsedData["Willing to relocate"] !== undefined ? (parsedData["Willing to relocate"] ? "Yes" : "No") : "Not specified"}
                    </Text>
                  </View>
                )}
              </View>

              {/* Professional Information */}
              <View style={styles.dataSection}>
                <Text style={styles.sectionTitle}>Professional Information</Text>
                <View style={styles.infoContainer}>
                  <Text style={styles.dataText}>
                    Role: {parsedData.Role || "job_seeker"}
                  </Text>
                  {parsedData["Company details"] && (
                    <Text style={styles.dataText}>Current Company: {parsedData["Company details"]}</Text>
                  )}
                  {parsedData["Resume file"] && (
                    <Text style={styles.dataText}>Resume File: {parsedData["Resume file"]}</Text>
                  )}
                </View>
              </View>

              {/* Skills Section */}
              {((parsedData.Skills && parsedData.Skills.length > 0) || 
                (parsedData["Technical Skills"] && parsedData["Technical Skills"].length > 0) || 
                (parsedData["Soft Skills"] && parsedData["Soft Skills"].length > 0)) && (
                <View style={styles.dataSection}>
                  <Text style={styles.sectionTitle}>Skills</Text>
                  
                  {/* If we have categorized skills, show them separately */}
                  {parsedData["Technical Skills"] && parsedData["Technical Skills"].length > 0 && (
                    <View style={styles.skillSubsection}>
                      <Text style={styles.skillSubtitle}>Technical Skills</Text>
                      <View style={styles.skillsContainer}>
                        {parsedData["Technical Skills"].map((skill, index) => (
                          <View key={index} style={[styles.skillTag, styles.technicalSkillTag]}>
                            <Text style={[styles.skillText, styles.technicalSkillText]}>{skill}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {parsedData["Soft Skills"] && parsedData["Soft Skills"].length > 0 && (
                    <View style={styles.skillSubsection}>
                      <Text style={styles.skillSubtitle}>Soft Skills</Text>
                      <View style={styles.skillsContainer}>
                        {parsedData["Soft Skills"].map((skill, index) => (
                          <View key={index} style={[styles.skillTag, styles.softSkillTag]}>
                            <Text style={[styles.skillText, styles.softSkillText]}>{skill}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* If we only have general skills (backward compatibility) */}
                  {parsedData.Skills && parsedData.Skills.length > 0 && 
                   (!parsedData["Technical Skills"] || parsedData["Technical Skills"].length === 0) && 
                   (!parsedData["Soft Skills"] || parsedData["Soft Skills"].length === 0) && (
                    <View style={styles.skillsContainer}>
                      {parsedData.Skills.map((skill, index) => (
                        <View key={index} style={styles.skillTag}>
                          <Text style={styles.skillText}>{skill}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Social Links */}
              {(parsedData["LinkedIn Profile"] || parsedData["GitHub Profile"] || parsedData["Portfolio URL"]) && (
                <View style={styles.dataSection}>
                  <Text style={styles.sectionTitle}>Social Links</Text>
                  <View style={styles.socialLinksContainer}>
                    {parsedData["LinkedIn Profile"] && (
                      <View style={styles.socialLinkItem}>
                        <Ionicons name="logo-linkedin" size={16} color="#0077b5" />
                        <Text style={styles.socialLinkText}>LinkedIn</Text>
                      </View>
                    )}
                    {parsedData["GitHub Profile"] && (
                      <View style={styles.socialLinkItem}>
                        <Ionicons name="logo-github" size={16} color="#333" />
                        <Text style={styles.socialLinkText}>GitHub</Text>
                      </View>
                    )}
                    {parsedData["Portfolio URL"] && (
                      <View style={styles.socialLinkItem}>
                        <Ionicons name="globe-outline" size={16} color="#059669" />
                        <Text style={styles.socialLinkText}>Portfolio</Text>
                      </View>
                    )}
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
                Upload a resume below to see your professional profile here
              </Text>
            </View>
          )}
        </View>

        {/* Resume Upload Card - Now appears below parsed data */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cloud-upload-outline" size={20} color="#2563eb" />
            <Text style={styles.cardTitle}>
              {parsedData ? "Update Resume" : "Upload Resume"}
            </Text>
          </View>
          <Text style={styles.cardDescription}>
            {parsedData 
              ? "Upload a new resume to update your professional information"
              : "Select your resume file to extract professional information"
            }
          </Text>

          {/* File Upload Area */}
          <TouchableOpacity style={styles.uploadArea} onPress={pickDocument}>
            <View style={styles.uploadIcon}>
              <Ionicons name="cloud-upload-outline" size={32} color="#2563eb" />
            </View>
            <Text style={styles.uploadTitle}>
              {parsedData ? "Upload new resume" : "Upload your resume"}
            </Text>
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
                <Text style={styles.uploadButtonText}>Processing...</Text>
              </View>
            ) : (
              <View style={styles.uploadButtonContent}>
                <Ionicons
                  name="cloud-upload-outline"
                  size={16}
                  color="#ffffff"
                />
                <Text style={styles.uploadButtonText}>
                  {parsedData ? "Update Resume" : "Upload Resume"}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
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
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  editButton: {
    backgroundColor: "#dbeafe",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#2563eb",
  },
  saveButton: {
    backgroundColor: "#059669",
  },
  saveButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#ffffff",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374751",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 8,
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20,
    lineHeight: 20,
  },
  // New styles for editing functionality
  editableSection: {
    gap: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374751",
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#ffffff",
    fontSize: 14,
    color: "#111827",
  },
  editableSkillsContainer: {
    gap: 8,
  },
  editableSkillItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  skillInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    padding: 8,
    backgroundColor: "#ffffff",
    fontSize: 12,
  },
  removeSkillButton: {
    padding: 4,
  },
  addSkillButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    gap: 4,
    marginTop: 4,
  },
  addSkillText: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "500",
  },
  // Existing styles continue...
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
  // Enhanced styles for better layout
  infoContainer: {
    gap: 6,
  },
  skillSubsection: {
    marginBottom: 16,
  },
  skillSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  socialLinksContainer: {
    gap: 8,
  },
  parsedDataContainer: {
    // Remove maxHeight to show all content
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
  // New styles for enhanced display
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  checkboxContainer: {
    marginTop: 8,
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#374751",
  },
  technicalSkillTag: {
    backgroundColor: "#dbeafe",
    borderColor: "#bfdbfe",
    borderWidth: 1,
  },
  technicalSkillText: {
    color: "#1e40af",
  },
  softSkillTag: {
    backgroundColor: "#ecfdf5",
    borderColor: "#d1fae5",
    borderWidth: 1,
  },
  softSkillText: {
    color: "#065f46",
  },
  socialLinkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
    paddingVertical: 4,
  },
  socialLinkText: {
    fontSize: 14,
    color: "#374751",
    flex: 1,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 12,
    textAlign: "center",
  },
})