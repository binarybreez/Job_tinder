import { useAuth, useUser } from "@clerk/clerk-expo";
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface EmployerProfile {
  name: string;
  email: string;
  company: string;
  position: string;
  phone: string;
  website: string;
  description: string;
  logo: string;
}

interface JobPreference {
  auto_publish: boolean;
  email_notifications: boolean;
  application_alerts: boolean;
  weekly_reports: boolean;
}

interface ProfileStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  hiredCandidates: number;
}

const EmployerProfile = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState<EmployerProfile>({
    name: user?.fullName || "John Doe",
    email: user?.emailAddresses?.[0]?.emailAddress || "john@company.com",
    company: "Tech Solutions Inc.",
    position: "HR Manager",
    phone: "+1 (555) 123-4567",
    website: "https://techsolutions.com",
    description: "We're a growing tech company focused on innovative solutions.",
    logo: "https://via.placeholder.com/100",
  });

  const [preferences, setPreferences] = useState<JobPreference>({
    auto_publish: true,
    email_notifications: true,
    application_alerts: true,
    weekly_reports: false,
  });

  const [stats, setStats] = useState<ProfileStats>({
    totalJobs: 12,
    activeJobs: 8,
    totalApplications: 156,
    hiredCandidates: 23,
  });

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace("/sign-in");
            } catch (error) {
              console.error("Error signing out:", error);
            }
          },
        },
      ]
    );
  };

  const saveProfile = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      console.log('Saving profile:', profile);
      Alert.alert('Success', 'Profile updated successfully');
      setShowEditModal(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      console.log('Saving preferences:', preferences);
      Alert.alert('Success', 'Preferences updated successfully');
      setShowPreferences(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, color }: any) => (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <MaterialIcons name={icon} size={24} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const PreferenceItem = ({ 
    title, 
    description, 
    value, 
    onValueChange 
  }: {
    title: string;
    description: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View style={styles.preferenceItem}>
      <View style={styles.preferenceText}>
        <Text style={styles.preferenceTitle}>{title}</Text>
        <Text style={styles.preferenceDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#f3f4f6', true: '#dbeafe' }}
        thumbColor={value ? '#3b82f6' : '#9ca3af'}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: profile.logo }}
                style={styles.avatar}
                defaultSource={require('../../../../assets/images/react-logo.png')}
              />
              <TouchableOpacity style={styles.editAvatarButton}>
                <MaterialIcons name="camera-alt" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileCompany}>{profile.company}</Text>
              <Text style={styles.profilePosition}>{profile.position}</Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setShowEditModal(true)}
            >
              <MaterialIcons name="edit" size={20} color="#3b82f6" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="work"
              title="Total Jobs"
              value={stats.totalJobs}
              color="#3b82f6"
            />
            <StatCard
              icon="check-circle"
              title="Active Jobs"
              value={stats.activeJobs}
              color="#10b981"
            />
            <StatCard
              icon="assignment"
              title="Applications"
              value={stats.totalApplications}
              color="#f59e0b"
            />
            <StatCard
              icon="people"
              title="Hired"
              value={stats.hiredCandidates}
              color="#8b5cf6"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(protected)/employer/create')}
            >
              <View style={styles.actionIcon}>
                <AntDesign name="plus" size={24} color="#3b82f6" />
              </View>
              <Text style={styles.actionTitle}>Post New Job</Text>
              <Text style={styles.actionSubtitle}>Create a job posting</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(protected)/employer/EmployerJobs')}
            >
              <View style={styles.actionIcon}>
                <MaterialIcons name="work" size={24} color="#10b981" />
              </View>
              <Text style={styles.actionTitle}>Manage Jobs</Text>
              <Text style={styles.actionSubtitle}>View all your jobs</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(protected)/employer/ApplicationsList')}
            >
              <View style={styles.actionIcon}>
                <MaterialIcons name="assignment" size={24} color="#f59e0b" />
              </View>
              <Text style={styles.actionTitle}>Applications</Text>
              <Text style={styles.actionSubtitle}>Review candidates</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(protected)/employer/EmployerJobs')}
            >
              <View style={styles.actionIcon}>
                <MaterialIcons name="analytics" size={24} color="#8b5cf6" />
              </View>
              <Text style={styles.actionTitle}>Analytics</Text>
              <Text style={styles.actionSubtitle}>View job performance</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setShowPreferences(true)}
            >
              <View style={styles.settingLeft}>
                <MaterialIcons name="settings" size={24} color="#6b7280" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Job Preferences</Text>
                  <Text style={styles.settingSubtitle}>Notification and posting settings</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/employer/create')}
            >
              <View style={styles.settingLeft}>
                <MaterialIcons name="business" size={24} color="#6b7280" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Company Profile</Text>
                  <Text style={styles.settingSubtitle}>Update company information</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/employer/create')}
            >
              <View style={styles.settingLeft}>
                <MaterialIcons name="payment" size={24} color="#6b7280" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Billing & Plans</Text>
                  <Text style={styles.settingSubtitle}>Manage subscription</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="help" size={24} color="#6b7280" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Help & Support</Text>
                  <Text style={styles.settingSubtitle}>Get help with your account</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <View style={styles.dangerCard}>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleSignOut}
            >
              <MaterialIcons name="logout" size={20} color="#ef4444" />
              <Text style={styles.dangerButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={saveProfile} disabled={loading}>
              <Text style={[styles.modalSave, loading && styles.modalSaveDisabled]}>
                {loading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                value={profile.name}
                onChangeText={(text) => setProfile(prev => ({ ...prev, name: text }))}
                placeholder="Enter your full name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={profile.email}
                onChangeText={(text) => setProfile(prev => ({ ...prev, email: text }))}
                placeholder="Enter your email"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Company</Text>
              <TextInput
                style={styles.textInput}
                value={profile.company}
                onChangeText={(text) => setProfile(prev => ({ ...prev, company: text }))}
                placeholder="Enter company name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Position</Text>
              <TextInput
                style={styles.textInput}
                value={profile.position}
                onChangeText={(text) => setProfile(prev => ({ ...prev, position: text }))}
                placeholder="Enter your position"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={styles.textInput}
                value={profile.phone}
                onChangeText={(text) => setProfile(prev => ({ ...prev, phone: text }))}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Website</Text>
              <TextInput
                style={styles.textInput}
                value={profile.website}
                onChangeText={(text) => setProfile(prev => ({ ...prev, website: text }))}
                placeholder="Enter company website"
                keyboardType="url"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Company Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={profile.description}
                onChangeText={(text) => setProfile(prev => ({ ...prev, description: text }))}
                placeholder="Describe your company"
                multiline
                numberOfLines={4}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Preferences Modal */}
      <Modal
        visible={showPreferences}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPreferences(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Preferences</Text>
            <TouchableOpacity onPress={savePreferences} disabled={loading}>
              <Text style={[styles.modalSave, loading && styles.modalSaveDisabled]}>
                {loading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <PreferenceItem
              title="Auto Publish Jobs"
              description="Automatically publish jobs after creation"
              value={preferences.auto_publish}
              onValueChange={(value) => setPreferences(prev => ({ ...prev, auto_publish: value }))}
            />

            <PreferenceItem
              title="Email Notifications"
              description="Receive email updates about your jobs"
              value={preferences.email_notifications}
              onValueChange={(value) => setPreferences(prev => ({ ...prev, email_notifications: value }))}
            />

            <PreferenceItem
              title="Application Alerts"
              description="Get notified when someone applies"
              value={preferences.application_alerts}
              onValueChange={(value) => setPreferences(prev => ({ ...prev, application_alerts: value }))}
            />

            <PreferenceItem
              title="Weekly Reports"
              description="Receive weekly performance reports"
              value={preferences.weekly_reports}
              onValueChange={(value) => setPreferences(prev => ({ ...prev, weekly_reports: value }))}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    paddingBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e5e7eb',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3b82f6',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  profileCompany: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: 2,
  },
  profilePosition: {
    fontSize: 14,
    color: '#6b7280',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    borderTopWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  settingsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLeft: {
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  dangerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  dangerButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalCancel: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalSave: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  modalSaveDisabled: {
    color: '#9ca3af',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  preferenceText: {
    flex: 1,
    marginRight: 16,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default EmployerProfile;
