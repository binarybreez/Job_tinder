import { useAuth } from "@clerk/clerk-expo";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface CompanyProfile {
  company_name: string;
  company_description: string;
  website: string;
  industry: string;
  company_size: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  contact: {
    email: string;
    phone: string;
  };
  social_links: {
    linkedin: string;
    twitter: string;
  };
  logo_url: string;
  is_verified: boolean;
}

const EmployerProfile = () => {
  const { signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const [profile, setProfile] = useState<CompanyProfile>({
    company_name: "TechCorp Solutions",
    company_description: "A leading technology company specializing in innovative software solutions for businesses worldwide.",
    website: "https://techcorp.com",
    industry: "Technology",
    company_size: "51-200",
    location: {
      address: "123 Tech Street",
      city: "San Francisco",
      state: "CA",
      country: "USA",
    },
    contact: {
      email: "hr@techcorp.com",
      phone: "+1 (555) 123-4567",
    },
    social_links: {
      linkedin: "https://linkedin.com/company/techcorp",
      twitter: "https://twitter.com/techcorp",
    },
    logo_url: "",
    is_verified: true,
  });

  const [tempProfile, setTempProfile] = useState<CompanyProfile>(profile);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // Replace with your API endpoint
      // const response = await fetch(`/api/employer/profile`);
      // const data = await response.json();
      // setProfile(data);
      // setTempProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Replace with your API endpoint
      // const response = await fetch('/api/employer/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(tempProfile),
      // });
      
      // Mock success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfile(tempProfile);
      setEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setEditing(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Error", "Failed to sign out");
    }
  };

  const companySizeOptions = [
    "1-10",
    "11-50",
    "51-200",
    "201-500",
    "501-1000",
    "1000+",
  ];

  const industryOptions = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Manufacturing",
    "Retail",
    "Consulting",
    "Other",
  ];

  const ProfileField = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder, 
    multiline = false,
    keyboardType = "default" as any
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    multiline?: boolean;
    keyboardType?: any;
  }) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {editing ? (
        <TextInput
          style={[styles.fieldInput, multiline && styles.textArea]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          keyboardType={keyboardType}
        />
      ) : (
        <Text style={styles.fieldValue}>{value || "Not specified"}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Company Profile</Text>
          {profile.is_verified && (
            <View style={styles.verifiedBadge}>
              <MaterialIcons name="verified" size={16} color="#10B981" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setShowLogoutModal(true)}
        >
          <MaterialIcons name="logout" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Company Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            {profile.logo_url ? (
              <Image source={{ uri: profile.logo_url }} style={styles.logo} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <MaterialIcons name="business" size={48} color="#6B7280" />
              </View>
            )}
          </View>
          {editing && (
            <TouchableOpacity style={styles.changeLogo}>
              <Text style={styles.changeLogoText}>Change Logo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <ProfileField
            label="Company Name"
            value={editing ? tempProfile.company_name : profile.company_name}
            onChangeText={(text) => setTempProfile(prev => ({ ...prev, company_name: text }))}
            placeholder="Enter company name"
          />

          <ProfileField
            label="Description"
            value={editing ? tempProfile.company_description : profile.company_description}
            onChangeText={(text) => setTempProfile(prev => ({ ...prev, company_description: text }))}
            placeholder="Describe your company"
            multiline
          />

          <ProfileField
            label="Website"
            value={editing ? tempProfile.website : profile.website}
            onChangeText={(text) => setTempProfile(prev => ({ ...prev, website: text }))}
            placeholder="https://yourcompany.com"
            keyboardType="url"
          />

          <ProfileField
            label="Industry"
            value={editing ? tempProfile.industry : profile.industry}
            onChangeText={(text) => setTempProfile(prev => ({ ...prev, industry: text }))}
            placeholder="Select industry"
          />

          <ProfileField
            label="Company Size"
            value={editing ? tempProfile.company_size : profile.company_size}
            onChangeText={(text) => setTempProfile(prev => ({ ...prev, company_size: text }))}
            placeholder="Select company size"
          />
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          
          <ProfileField
            label="Address"
            value={editing ? tempProfile.location.address : profile.location.address}
            onChangeText={(text) => setTempProfile(prev => ({
              ...prev,
              location: { ...prev.location, address: text }
            }))}
            placeholder="Street address"
          />

          <View style={styles.row}>
            <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.fieldLabel}>City</Text>
              {editing ? (
                <TextInput
                  style={styles.fieldInput}
                  value={tempProfile.location.city}
                  onChangeText={(text) => setTempProfile(prev => ({
                    ...prev,
                    location: { ...prev.location, city: text }
                  }))}
                  placeholder="City"
                />
              ) : (
                <Text style={styles.fieldValue}>{profile.location.city}</Text>
              )}
            </View>

            <View style={[styles.fieldContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.fieldLabel}>State</Text>
              {editing ? (
                <TextInput
                  style={styles.fieldInput}
                  value={tempProfile.location.state}
                  onChangeText={(text) => setTempProfile(prev => ({
                    ...prev,
                    location: { ...prev.location, state: text }
                  }))}
                  placeholder="State"
                />
              ) : (
                <Text style={styles.fieldValue}>{profile.location.state}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <ProfileField
            label="Email"
            value={editing ? tempProfile.contact.email : profile.contact.email}
            onChangeText={(text) => setTempProfile(prev => ({
              ...prev,
              contact: { ...prev.contact, email: text }
            }))}
            placeholder="contact@company.com"
            keyboardType="email-address"
          />

          <ProfileField
            label="Phone"
            value={editing ? tempProfile.contact.phone : profile.contact.phone}
            onChangeText={(text) => setTempProfile(prev => ({
              ...prev,
              contact: { ...prev.contact, phone: text }
            }))}
            placeholder="+1 (555) 123-4567"
            keyboardType="phone-pad"
          />
        </View>

        {/* Social Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Media</Text>
          
          <ProfileField
            label="LinkedIn"
            value={editing ? tempProfile.social_links.linkedin : profile.social_links.linkedin}
            onChangeText={(text) => setTempProfile(prev => ({
              ...prev,
              social_links: { ...prev.social_links, linkedin: text }
            }))}
            placeholder="https://linkedin.com/company/yourcompany"
            keyboardType="url"
          />

          <ProfileField
            label="Twitter"
            value={editing ? tempProfile.social_links.twitter : profile.social_links.twitter}
            onChangeText={(text) => setTempProfile(prev => ({
              ...prev,
              social_links: { ...prev.social_links, twitter: text }
            }))}
            placeholder="https://twitter.com/yourcompany"
            keyboardType="url"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {editing ? (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <AntDesign name="loading1" size={16} color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditing(true)}
            >
              <MaterialIcons name="edit" size={20} color="#3B82F6" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="notifications" size={20} color="#6B7280" />
              <Text style={styles.settingText}>Notification Preferences</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="security" size={20} color="#6B7280" />
              <Text style={styles.settingText}>Privacy & Security</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="help" size={20} color="#6B7280" />
              <Text style={styles.settingText}>Help & Support</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialIcons name="logout" size={48} color="#EF4444" />
            <Text style={styles.modalTitle}>Sign Out</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to sign out of your account?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleSignOut}
              >
                <Text style={styles.modalConfirmText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#065F46",
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  logoSection: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    marginBottom: 12,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  logoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  changeLogo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  changeLogoText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "500",
  },
  section: {
    backgroundColor: "#fff",
    marginBottom: 8,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  fieldValue: {
    fontSize: 16,
    color: "#1F2937",
    paddingVertical: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EBF8FF",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#3B82F6",
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: "#374151",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 24,
    minWidth: 300,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
  },
});

export default EmployerProfile;