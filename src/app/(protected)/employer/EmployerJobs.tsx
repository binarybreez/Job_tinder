import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Job {
  _id: string;
  title: string;
  description: string;
  employment_type: string;
  location: {
    city: string;
    state: string;
    is_remote: boolean;
  };
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  applications_count: number;
  new_applications: number;
  is_active: boolean;
  posted_at: string;
  expires_at: string;
}

interface Application {
  _id: string;
  applicant_name: string;
  applicant_email: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected';
  applied_at: string;
  resume_url?: string;
}

const EmployerJobs = () => {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [showApplications, setShowApplications] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'inactive' | 'all'>('active');

  const loadJobs = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockJobs: Job[] = [
        {
          _id: '1',
          title: 'Senior React Developer',
          description: 'We are looking for an experienced React developer...',
          employment_type: 'full_time',
          location: { city: 'New York', state: 'NY', is_remote: false },
          salary: { min: 80000, max: 120000, currency: 'USD' },
          applications_count: 34,
          new_applications: 5,
          is_active: true,
          posted_at: '2024-01-15',
          expires_at: '2024-02-15',
        },
        {
          _id: '2',
          title: 'UI/UX Designer',
          description: 'Join our design team to create amazing user experiences...',
          employment_type: 'full_time',
          location: { city: 'San Francisco', state: 'CA', is_remote: true },
          salary: { min: 70000, max: 100000, currency: 'USD' },
          applications_count: 28,
          new_applications: 8,
          is_active: true,
          posted_at: '2024-01-10',
          expires_at: '2024-02-10',
        },
        {
          _id: '3',
          title: 'Product Manager',
          description: 'Lead product development and strategy...',
          employment_type: 'full_time',
          location: { city: 'Austin', state: 'TX', is_remote: false },
          salary: { min: 90000, max: 130000, currency: 'USD' },
          applications_count: 19,
          new_applications: 3,
          is_active: false,
          posted_at: '2024-01-05',
          expires_at: '2024-02-05',
        },
      ];
      setJobs(mockJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async (jobId: string) => {
    try {
      // Mock data - replace with actual API call
      const mockApplications: Application[] = [
        {
          _id: '1',
          applicant_name: 'John Doe',
          applicant_email: 'john.doe@email.com',
          status: 'pending',
          applied_at: '2024-01-20',
          resume_url: 'https://example.com/resume1.pdf',
        },
        {
          _id: '2',
          applicant_name: 'Jane Smith',
          applicant_email: 'jane.smith@email.com',
          status: 'shortlisted',
          applied_at: '2024-01-19',
          resume_url: 'https://example.com/resume2.pdf',
        },
        {
          _id: '3',
          applicant_name: 'Mike Johnson',
          applicant_email: 'mike.johnson@email.com',
          status: 'reviewed',
          applied_at: '2024-01-18',
          resume_url: 'https://example.com/resume3.pdf',
        },
      ];
      setApplications(mockApplications);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const toggleJobStatus = async (jobId: string, currentStatus: boolean) => {
    try {
      // TODO: Replace with actual API call
      setJobs(prev => prev.map(job => 
        job._id === jobId ? { ...job, is_active: !currentStatus } : job
      ));
      Alert.alert('Success', `Job ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling job status:', error);
      Alert.alert('Error', 'Failed to update job status');
    }
  };

  const deleteJob = async (jobId: string) => {
    Alert.alert(
      'Delete Job',
      'Are you sure you want to delete this job? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Replace with actual API call
              setJobs(prev => prev.filter(job => job._id !== jobId));
              Alert.alert('Success', 'Job deleted successfully');
            } catch (error) {
              console.error('Error deleting job:', error);
              Alert.alert('Error', 'Failed to delete job');
            }
          },
        },
      ]
    );
  };

  const viewApplications = (job: Job) => {
    setSelectedJob(job);
    loadApplications(job._id);
    setShowApplications(true);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'active') return job.is_active;
    if (activeTab === 'inactive') return !job.is_active;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'reviewed': return '#3b82f6';
      case 'shortlisted': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusBadgeStyle = (status: string) => ({
    backgroundColor: getStatusColor(status) + '20',
    borderColor: getStatusColor(status),
    borderWidth: 1,
  });

  const JobCard = ({ job }: { job: Job }) => (
    <View style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.jobTitle} numberOfLines={1}>
            {job.title}
          </Text>
          <Text style={styles.jobLocation}>
            {job.location.city}, {job.location.state}
            {job.location.is_remote && ' • Remote'}
          </Text>
          <Text style={styles.jobSalary}>
            ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
          </Text>
        </View>
        <View style={[styles.statusBadge, job.is_active ? styles.activeBadge : styles.inactiveBadge]}>
          <Text style={[styles.statusText, job.is_active ? styles.activeText : styles.inactiveText]}>
            {job.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      <View style={styles.jobStats}>
        <View style={styles.statItem}>
          <Ionicons name="people-outline" size={16} color="#6b7280" />
          <Text style={styles.statText}>{job.applications_count} applicants</Text>
        </View>
        {job.new_applications > 0 && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>{job.new_applications} new</Text>
          </View>
        )}
      </View>

      <View style={styles.jobActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryAction]}
          onPress={() => viewApplications(job)}
        >
          <MaterialIcons name="assignment" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>View Applications</Text>
        </TouchableOpacity>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.iconButton, styles.editButton]}
          onPress={() => router.push(`/employer/create?jobId=${job._id}`)}
          >
            <MaterialIcons name="edit" size={18} color="#3b82f6" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, job.is_active ? styles.pauseButton : styles.playButton]}
            onPress={() => toggleJobStatus(job._id, job.is_active)}
          >
            <MaterialIcons 
              name={job.is_active ? "pause" : "play-arrow"} 
              size={18} 
              color={job.is_active ? "#f59e0b" : "#10b981"} 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, styles.deleteButton]}
            onPress={() => deleteJob(job._id)}
          >
            <MaterialIcons name="delete" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const ApplicationCard = ({ application }: { application: Application }) => (
    <TouchableOpacity
      style={styles.applicationCard}
      onPress={() => {
        setShowApplications(false);
        router.push(`/employer/ApplicantReview?jobId=${selectedJob?._id}&applicationId=${application._id}` as any);
      }}
    >
      <View style={styles.applicationHeader}>
        <Text style={styles.applicantName}>{application.applicant_name}</Text>
        <View style={[styles.statusBadge, getStatusBadgeStyle(application.status)]}>
          <Text style={[styles.statusText, { color: getStatusColor(application.status) }]}>
            {application.status}
          </Text>
        </View>
      </View>
      <Text style={styles.applicantEmail}>{application.applicant_email}</Text>
      <Text style={styles.appliedDate}>Applied: {new Date(application.applied_at).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Jobs</Text>
        <TouchableOpacity
          onPress={() => router.push('/employer/create')}
          style={styles.createButton}
        >
          <AntDesign name="plus" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {[
          { key: 'active', label: 'Active' },
          { key: 'inactive', label: 'Inactive' },
          { key: 'all', label: 'All Jobs' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <JobCard job={item} />}
        contentContainerStyle={styles.jobsList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <MaterialIcons name="work-off" size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No jobs found</Text>
            <Text style={styles.emptyText}>
              {activeTab === 'active' ? 'You have no active jobs' : 
               activeTab === 'inactive' ? 'You have no inactive jobs' :
               'Start by posting your first job'}
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/employer/create')}
            >
              <Text style={styles.emptyButtonText}>Post New Job</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Applications Modal */}
      <Modal
        visible={showApplications}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowApplications(false)}>
              <MaterialIcons name="close" size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Applications</Text>
            <View style={{ width: 24 }} />
          </View>

          {selectedJob && (
            <View style={styles.jobInfo}>
              <Text style={styles.jobInfoTitle}>{selectedJob.title}</Text>
              <Text style={styles.jobInfoText}>
                {applications.length} total applications
              </Text>
            </View>
          )}

          <FlatList
            data={applications}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <ApplicationCard application={item} />}
            contentContainerStyle={styles.applicationsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <MaterialIcons name="assignment" size={64} color="#9ca3af" />
                <Text style={styles.emptyTitle}>No applications yet</Text>
                <Text style={styles.emptyText}>
                  Applications will appear here when candidates apply
                </Text>
              </View>
            )}
          />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  createButton: {
    backgroundColor: '#3b82f6',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  jobsList: {
    padding: 20,
    paddingBottom: 100,
  },
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  jobLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  jobSalary: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activeBadge: {
    backgroundColor: '#dcfce7',
  },
  inactiveBadge: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: '#16a34a',
  },
  inactiveText: {
    color: '#d97706',
  },
  jobStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
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
  jobActions: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  primaryAction: {
    backgroundColor: '#3b82f6',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  editButton: {
    backgroundColor: '#eff6ff',
    borderColor: '#dbeafe',
  },
  pauseButton: {
    backgroundColor: '#fef3c7',
    borderColor: '#fed7aa',
  },
  playButton: {
    backgroundColor: '#dcfce7',
    borderColor: '#bbf7d0',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  jobInfo: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  jobInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  jobInfoText: {
    fontSize: 14,
    color: '#6b7280',
  },
  applicationsList: {
    padding: 20,
  },
  applicationCard: {
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
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  applicantEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  appliedDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
});

export default EmployerJobs;