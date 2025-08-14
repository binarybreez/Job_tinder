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
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
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
      Alert.alert("Error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardStats();
  };

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    onPress, 
    subtitle 
  }: {
    title: string;
    value: number;
    icon: string;
    color: string;
    onPress?: () => void;
    subtitle?: string;
  }) => (
    <TouchableOpacity
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.statCardContent}>
        <View style={styles.statCardHeader}>
          <AntDesign name={icon as any} size={24} color={color} />
          <Text style={styles.statValue}>{value}</Text>
        </View>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </TouchableOpacity>
  );

  const QuickAction = ({ 
    title, 
    icon, 
    color, 
    onPress 
  }: {
    title: string;
    icon: string;
    color: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.quickActionCard, { backgroundColor: color + "15" }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <MaterialIcons name={icon as any} size={32} color={color} />
      <Text style={[styles.quickActionText, { color }]}>{title}</Text>
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
          <Text style={styles.headerTitle}>Employer Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            Welcome back! Here's your recruitment overview
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Jobs Posted"
            value={stats.totalJobs}
            icon="filetext1"
            color="#3B82F6"
            onPress={() => router.push("/(protected)/employer/EmployerJobs")}
          />
          
          <StatCard
            title="Active Jobs"
            value={stats.activeJobs}
            icon="checkcircle"
            color="#10B981"
            onPress={() => router.push("/(protected)/employer/EmployerJobs")}
            subtitle="Currently accepting applications"
          />
          
          <StatCard
            title="Inactive Jobs"
            value={stats.inactiveJobs}
            icon="pausecircle"
            color="#F59E0B"
            onPress={() => router.push("/(protected)/employer/EmployerJobs")}
            subtitle="Paused or closed"
          />
          
          <StatCard
            title="Total Applicants"
            value={stats.totalApplicants}
            icon="team"
            color="#8B5CF6"
            onPress={() => router.push("/(protected)/employer/EmployerJobs")}
          />
          
          <StatCard
            title="Applications Today"
            value={stats.applicantsToday}
            icon="calendar"
            color="#06B6D4"
            subtitle="New applications received"
          />
          
          <StatCard
            title="Expiring This Week"
            value={stats.jobsExpiringThisWeek}
            icon="clockcircle"
            color="#EF4444"
            onPress={() => router.push("/(protected)/employer/EmployerJobs")}
            subtitle="Jobs expiring soon"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickAction
              title="Post New Job"
              icon="add-circle-outline"
              color="#3B82F6"
onPress={() => router.push("/(protected)/employer/create")}
            />
            <QuickAction
              title="Review Applications"
              icon="assignment"
              color="#10B981"
              onPress={() => router.push("/(protected)/employer/EmployerJobs")}
            />
            <QuickAction
              title="Manage Jobs"
              icon="work-outline"
              color="#F59E0B"
              onPress={() => router.push("/(protected)/employer/EmployerJobs")}
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
              No recent activity to show. Start by posting your first job!
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