import { useAuth } from "@clerk/clerk-expo";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  inactiveJobs: number;
  totalApplicants: number;
  applicantsToday: number;
  jobsExpiringThisWeek: number;
}

interface ProfileStatus {
  profile_completed: boolean;
  first_name: string;
  last_name: string;
  company_name: string;
}

const EmployerDashboard = () => {
  const router = useRouter();
  const { userId } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    activeJobs: 0,
    inactiveJobs: 0,
    totalApplicants: 0,
    applicantsToday: 0,
    jobsExpiringThisWeek: 0,
  });
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>({
    profile_completed: false,
    first_name: "",
    last_name: "",
    company_name: "",
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkProfileStatus = async () => {
    try {
      // Replace with your API endpoint
      // const response = await fetch(`/api/employer/${userId}/profile/status`);
      // if (response.ok) {
      //   const data = await response.json();
      //   setProfileStatus(data);
      // } else {
      //   setProfileStatus({ profile_completed: false, first_name: "", last_name: "", company_name: "" });
      // }

      // Mock: Simulate profile check
      const mockProfileStatus = {
        profile_completed: false, // Change to true to test completed profile
        first_name: "",
        last_name: "",
        company_name: "",
      };
      setProfileStatus(mockProfileStatus);
    } catch (error) {
      console.error("Error checking profile status:", error);
      setProfileStatus({ profile_completed: false, first_name: "", last_name: "", company_name: "" });
    }
  };

  const fetchDashboardStats = async () => {
    try {
      if (!profileStatus.profile_completed) {
        // Don't fetch stats if profile is incomplete
        setStats({
          totalJobs: 0,
          activeJobs: 0,
          inactiveJobs: 0,
          totalApplicants: 0,
          applicantsToday: 0,
          jobsExpiringThisWeek: 0,
        });
        return;
      }

      // Replace with your API endpoint
      // const response = await fetch(`/api/employer/${userId}/dashboard-stats`);
      // const data = await response.json();
      
      // Mock data for demo
      const mockData: DashboardStats = {
        totalJobs: 12,
        activeJobs: 8,
        inactiveJobs: 4,
        totalApplicants: 145,
        applicantsToday: 7,
        jobsExpiringThisWeek: 2,
      };
      
      setStats(mockData);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      if (profileStatus.profile_completed) {
        Alert.alert("Error", "Failed to load dashboard data");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      await checkProfileStatus();
    };
    loadDashboard();
  }, []);

  useEffect(() => {
    if (profileStatus !== null) {
      fetchDashboardStats();
    }
  }, [profileStatus]);

  const onRefresh = () => {
    setRefreshing(true);
    checkProfileStatus().then(() => fetchDashboardStats());
  };

  const handleCompleteProfile = () => {
    router.push("/(protected)/employer/EmployerProfile");
  };

  const handlePostJob = () => {
    if (!profileStatus.profile_completed) {
      Alert.alert(
        "Complete Profile Required",
        "Please complete your profile before posting jobs.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Complete Profile", onPress: handleCompleteProfile }
        ]
      );
      return;
    }
    router.push("/(protected)/employer/create");
  };

  const handleViewJobs = () => {
    if (!profileStatus.profile_completed) {
      Alert.alert(
        "Complete Profile Required",
        "Please complete your profile to view and manage jobs.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Complete Profile", onPress: handleCompleteProfile }
        ]
      );
      return;
    }
    router.push("/(protected)/employer/EmployerJobs");
  };

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    onPress, 
    subtitle,
    disabled = false
  }: {
    title: string;
    value: number;
    icon: string;
    color: string;
    onPress?: () => void;
    subtitle?: string;
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      style={[
        styles.statCard, 
        { borderLeftColor: disabled ? "#D1D5DB" : color },
        disabled && styles.disabledCard
      ]}
      onPress={disabled ? undefined : onPress}
      activeOpacity={disabled ? 1 : 0.7}
    >
      <View style={styles.statCardContent}>
        <View style={styles.statCardHeader}>
          <AntDesign name={icon as any} size={24} color={disabled ? "#D1D5DB" : color} />
          <Text style={[styles.statValue, disabled && styles.disabledText]}>{value}</Text>
        </View>
        <Text style={[styles.statTitle, disabled && styles.disabledText]}>{title}</Text>
        {subtitle && <Text style={[styles.statSubtitle, disabled && styles.disabledText]}>{subtitle}</Text>}
        {disabled && (
          <Text style={styles.disabledMessage}>Complete profile to view</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const QuickAction = ({ 
    title, 
    icon, 
    color, 
    onPress,
    disabled = false
  }: {
    title: string;
    icon: string;
    color: string;
    onPress: () => void;
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      style={[
        styles.quickActionCard, 
        { backgroundColor: (disabled ? "#F3F4F6" : color) + "15" },
        disabled && styles.disabledCard
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <MaterialIcons name={icon as any} size={32} color={disabled ? "#9CA3AF" : color} />
      <Text style={[styles.quickActionText, { color: disabled ? "#9CA3AF" : color }]}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <AntDesign name="loading1" size={32} color="#3B82F6" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {profileStatus.profile_completed 
              ? `Welcome back, ${profileStatus.first_name}!`
              : "Employer Dashboard"
            }
          </Text>
          <Text style={styles.headerSubtitle}>
            {profileStatus.profile_completed 
              ? "Here's your recruitment overview"
              : "Complete your profile to get started"
            }
          </Text>
        </View>

        {/* Profile Incomplete Warning */}
        {!profileStatus.profile_completed && (
          <View style={styles.warningContainer}>
            <View style={styles.warningContent}>
              <MaterialIcons name="warning" size={24} color="#F59E0B" />
              <View style={styles.warningText}>
                <Text style={styles.warningTitle}>Profile Incomplete</Text>
                <Text style={styles.warningMessage}>
                  Complete your profile to post jobs and manage applications
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.warningButton}
              onPress={handleCompleteProfile}
            >
              <Text style={styles.warningButtonText}>Complete Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Jobs Posted"
            value={stats.totalJobs}
            icon="filetext1"
            color="#3B82F6"
            onPress={handleViewJobs}
            disabled={!profileStatus.profile_completed}
          />
          
          <StatCard
            title="Active Jobs"
            value={stats.activeJobs}
            icon="checkcircle"
            color="#10B981"
            onPress={handleViewJobs}
            subtitle={profileStatus.profile_completed ? "Currently accepting applications" : undefined}
            disabled={!profileStatus.profile_completed}
          />
          
          <StatCard
            title="Inactive Jobs"
            value={stats.inactiveJobs}
            icon="pausecircle"
            color="#F59E0B"
            onPress={handleViewJobs}
            subtitle={profileStatus.profile_completed ? "Paused or closed" : undefined}
            disabled={!profileStatus.profile_completed}
          />
          
          <StatCard
            title="Total Applicants"
            value={stats.totalApplicants}
            icon="team"
            color="#8B5CF6"
            onPress={handleViewJobs}
            disabled={!profileStatus.profile_completed}
          />
          
          <StatCard
            title="Applications Today"
            value={stats.applicantsToday}
            icon="calendar"
            color="#06B6D4"
            subtitle={profileStatus.profile_completed ? "New applications received" : undefined}
            disabled={!profileStatus.profile_completed}
          />
          
          <StatCard
            title="Expiring This Week"
            value={stats.jobsExpiringThisWeek}
            icon="clockcircle"
            color="#EF4444"
            onPress={handleViewJobs}
            subtitle={profileStatus.profile_completed ? "Jobs expiring soon" : undefined}
            disabled={!profileStatus.profile_completed}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickAction
              title={profileStatus.profile_completed ? "Post New Job" : "Complete Profile"}
              icon={profileStatus.profile_completed ? "add-circle-outline" : "person"}
              color="#3B82F6"
              onPress={profileStatus.profile_completed ? handlePostJob : handleCompleteProfile}
            />
            <QuickAction
              title="Review Applications"
              icon="assignment"
              color="#10B981"
              onPress={handleViewJobs}
              disabled={!profileStatus.profile_completed}
            />
            <QuickAction
              title="Manage Jobs"
              icon="work-outline"
              color="#F59E0B"
              onPress={handleViewJobs}
              disabled={!profileStatus.profile_completed}
            />
            <QuickAction
              title="Company Profile"
              icon="business"
              color="#8B5CF6"
              onPress={() => router.push("/(protected)/employer/EmployerProfile")}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentActivityContainer}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <Text style={styles.activityText}>
              {profileStatus.profile_completed 
                ? "No recent activity to show. Start by posting your first job!"
                : "Complete your profile to see activity here."
              }
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
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
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  warningContainer: {
    backgroundColor: "#FEF3C7",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  warningContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  warningText: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#92400E",
    marginBottom: 2,
  },
  warningMessage: {
    fontSize: 14,
    color: "#B45309",
  },
  warningButton: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  warningButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  statsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledCard: {
    opacity: 0.6,
  },
  statCardContent: {
    flex: 1,
  },
  statCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1F2937",
  },
  statTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  disabledText: {
    color: "#9CA3AF",
  },
  disabledMessage: {
    fontSize: 11,
    color: "#EF4444",
    fontStyle: "italic",
    marginTop: 4,
  },
  quickActionsContainer: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickActionCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  recentActivityContainer: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  activityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  activityText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
});

export default EmployerDashboard;