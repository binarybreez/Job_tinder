import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface JobStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  newApplications: number;
  shortlisted: number;
  rejected: number;
}

interface RecentJob {
  id: string;
  title: string;
  applications: number;
  newApplications: number;
  posted_at: string;
}

const Dashboard = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<JobStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    newApplications: 0,
    shortlisted: 0,
    rejected: 0,
  });
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);

  const loadDashboardData = async () => {
    try {
      // Mock data - replace with actual API calls
      setStats({
        totalJobs: 12,
        activeJobs: 8,
        totalApplications: 156,
        newApplications: 23,
        shortlisted: 45,
        rejected: 88,
      });

      setRecentJobs([
        {
          id: '1',
          title: 'Senior React Developer',
          applications: 34,
          newApplications: 5,
          posted_at: '2 days ago',
        },
        {
          id: '2',
          title: 'UI/UX Designer',
          applications: 28,
          newApplications: 8,
          posted_at: '5 days ago',
        },
        {
          id: '3',
          title: 'Product Manager',
          applications: 19,
          newApplications: 3,
          posted_at: '1 week ago',
        },
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const StatCard = ({ icon, title, value, color, onPress }: any) => (
    <TouchableOpacity
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.statCardContent}>
        <View style={styles.statHeader}>
          <MaterialIcons name={icon} size={24} color={color} />
          <Text style={styles.statValue}>{value}</Text>
        </View>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  const JobCard = ({ job }: { job: RecentJob }) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => router.push(`/job-details/${job.id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.jobCardHeader}>
        <Text style={styles.jobTitle} numberOfLines={1}>
          {job.title}
        </Text>
        <Text style={styles.jobDate}>{job.posted_at}</Text>
      </View>
      <View style={styles.jobStats}>
        <View style={styles.jobStat}>
          <Ionicons name="people-outline" size={16} color="#6b7280" />
          <Text style={styles.jobStatText}>{job.applications} applicants</Text>
        </View>
        {job.newApplications > 0 && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>{job.newApplications} new</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Welcome back! Here's your overview</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="work"
            title="Total Jobs"
            value={stats.totalJobs}
            color="#3b82f6"
            onPress={() => router.push('/EmployerJobs')}
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
            onPress={() => router.push('/applications')}
          />
          <StatCard
            icon="fiber-new"
            title="New Applications"
            value={stats.newApplications}
            color="#ef4444"
          />
          <StatCard
            icon="star"
            title="Shortlisted"
            value={stats.shortlisted}
            color="#8b5cf6"
          />
          <StatCard
            icon="close"
            title="Rejected"
            value={stats.rejected}
            color="#6b7280"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/create')}
            >
              <AntDesign name="plus" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Post New Job</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryAction]}
              onPress={() => router.push('/applications')}
            >
              <MaterialIcons name="assignment" size={20} color="#3b82f6" />
              <Text style={[styles.actionButtonText, { color: '#3b82f6' }]}>
                View Applications
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Jobs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Jobs</Text>
            <TouchableOpacity onPress={() => router.push('/EmployerJobs')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statCardContent: {
    alignItems: 'flex-start',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statTitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  viewAllText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryAction: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  jobDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  jobStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jobStatText: {
    fontSize: 14,
    color: '#6b7280',
  },
  newBadge: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  newBadgeText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
  },
});

export default Dashboard;