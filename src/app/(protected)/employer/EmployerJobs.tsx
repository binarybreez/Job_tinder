import { useAuth } from "@clerk/clerk-expo";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Job {
  _id: string;
  title: string;
  description: string;
  employment_type: string;
  location: {
    city: string;
    state: string;
    remote: boolean;
  };
  salary: {
    min: number;
    max: number;
    is_public: boolean;
  };
  is_active: boolean;
  posted_at: string;
  expires_at: string;
  applicants_count: number;
}

interface Applicant {
  _id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  resume_url: string;
  applied_at: string;
}

const EmployerJobs = () => {
  const router = useRouter();
  const { userId } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showApplicants, setShowApplicants] = useState(false);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  const fetchJobs = async () => {
    try {
      // Replace with your API endpoint
      // const response = await fetch(`/api/employer/${userId}/jobs`);
      // const data = await response.json();
      
      // Mock data for demo
      const mockJobs: Job[] = [
        {
          _id: "1",
          title: "Senior React Native Developer",
          description: "We are looking for an experienced React Native developer to join our mobile team...",
          employment_type: "full_time",
          location: { city: "San Francisco", state: "CA", remote: true },
          salary: { min: 90000, max: 120000, is_public: true },
          is_active: true,
          posted_at: "2024-01-15T10:00:00Z",
          expires_at: "2024-02-15T10:00:00Z",
          applicants_count: 24,
        },
        {
          _id: "2",
          title: "UI/UX Designer",
          description: "Join our design team to create amazing user experiences...",
          employment_type: "full_time",
          location: { city: "New York", state: "NY", remote: false },
          salary: { min: 70000, max: 95000, is_public: false },
          is_active: false,
          posted_at: "2024-01-10T10:00:00Z",
          expires_at: "2024-02-10T10:00:00Z",
          applicants_count: 18,
        },
        {
          _id: "3",
          title: "Backend Engineer",
          description: "Looking for a Python/Django developer to work on our API...",
          employment_type: "contract",
          location: { city: "Austin", state: "TX", remote: true },
          salary: { min: 80000, max: 110000, is_public: true },
          is_active: true,
          posted_at: "2024-01-20T10:00:00Z",
          expires_at: "2024-02-20T10:00:00Z",
          applicants_count: 12,
        },
      ];
      
      setJobs(mockJobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      Alert.alert("Error", "Failed to load jobs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchApplicants = async (jobId: string) => {
    setLoadingApplicants(true);
    try {
      // Replace with your API endpoint
      // const response = await fetch(`/api/jobs/${jobId}/applicants`);
      // const data = await response.json();
      
      // Mock data for demo
      const mockApplicants: Applicant[] = [
        {
          _id: "1",
          name: "John Doe",
          email: "john.doe@email.com",
          phone: "+1 (555) 123-4567",
          skills: ["React Native", "JavaScript", "TypeScript", "Node.js"],
          resume_url: "https://example.com/resume1.pdf",
          applied_at: "2024-01-16T10:00:00Z",
        },
        {
          _id: "2",
          name: "Jane Smith",
          email: "jane.smith@email.com",
          phone: "+1 (555) 987-6543",
          skills: ["React Native", "Swift", "Kotlin", "Firebase"],
          resume_url: "https://example.com/resume2.pdf",
          applied_at: "2024-01-17T14:30:00Z",
        },
        {
          _id: "3",
          name: "Mike Johnson",
          email: "mike.johnson@email.com",
          phone: "+1 (555) 456-7890",
          skills: ["React Native", "Redux", "GraphQL", "AWS"],
          resume_url: "https://example.com/resume3.pdf",
          applied_at: "2024-01-18T09:15:00Z",
        },
      ];
      
      setApplicants(mockApplicants);
    } catch (error) {
      console.error("Error fetching applicants:", error);
      Alert.alert("Error", "Failed to load applicants");
    } finally {
      setLoadingApplicants(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs();
  };

  const toggleJobStatus = async (job: Job) => {
    Alert.alert(
      job.is_active ? "Deactivate Job" : "Activate Job",
      `Are you sure you want to ${job.is_active ? "deactivate" : "activate"} this job posting?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: job.is_active ? "Deactivate" : "Activate",
          style: job.is_active ? "destructive" : "default",
          onPress: async () => {
            try {
              // API call to toggle job status
              setJobs(prev => prev.map(j => 
                j._id === job._id ? { ...j, is_active: !j.is_active } : j
              ));
              Alert.alert("Success", `Job ${job.is_active ? "deactivated" : "activated"} successfully`);
            } catch (error) {
              Alert.alert("Error", "Failed to update job status");
            }
          },
        },
      ]
    );
  };

  const deleteJob = async (job: Job) => {
    Alert.alert(
      "Delete Job",
      "Are you sure you want to delete this job posting? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // API call to delete job
              setJobs(prev => prev.filter(j => j._id !== job._id));
              Alert.alert("Success", "Job deleted successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to delete job");
            }
          },
        },
      ]
    );
  };

  const openResume = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Unable to open resume");
    });
  };

  const showJobDetailsModal = (job: Job) => {
    setSelectedJob(job);
    setShowJobDetails(true);
  };

  const showApplicantsModal = (job: Job) => {
    setSelectedJob(job);
    fetchApplicants(job._id);
    setShowApplicants(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatSalary = (salary: Job['salary']) => {
    if (!salary.is_public) return "Salary not disclosed";
    return `$${salary.min.toLocaleString()} - $${salary.max.toLocaleString()}`;
  };

  const JobCard = ({ job }: { job: Job }) => (
    <View style={[styles.jobCard, !job.is_active && styles.inactiveJobCard]}>
      <View style={styles.jobHeader}>
        <View style={styles.jobTitleContainer}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <View style={[styles.statusBadge, job.is_active ? styles.activeBadge : styles.inactiveBadge]}>
            <Text style={[styles.statusText, job.is_active ? styles.activeText : styles.inactiveText]}>
              {job.is_active ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <MaterialIcons name="more-vert" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <Text style={styles.jobLocation}>
        {job.location.city}, {job.location.state} {job.location.remote && "• Remote"}
      </Text>
      
      <Text style={styles.jobSalary}>{formatSalary(job.salary)}</Text>
      
      <Text style={styles.jobDescription} numberOfLines={2}>
        {job.description}
      </Text>

      <View style={styles.jobStats}>
        <View style={styles.statItem}>
          <MaterialIcons name="people" size={16} color="#6B7280" />
          <Text style={styles.statText}>{job.applicants_count} applicants</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialIcons name="schedule" size={16} color="#6B7280" />
          <Text style={styles.statText}>Expires {formatDate(job.expires_at)}</Text>
        </View>
      </View>

      <View style={styles.jobActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => showJobDetailsModal(job)}
        >
          <MaterialIcons name="visibility" size={18} color="#3B82F6" />
          <Text style={styles.actionButtonText}>View Details</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => showApplicantsModal(job)}
        >
          <MaterialIcons name="people" size={18} color="#10B981" />
          <Text style={[styles.actionButtonText, { color: "#10B981" }]}>
            View Applicants ({job.applicants_count})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => toggleJobStatus(job)}
        >
          <MaterialIcons 
            name={job.is_active ? "pause" : "play-arrow"} 
            size={18} 
            color={job.is_active ? "#F59E0B" : "#10B981"} 
          />
          <Text style={[styles.actionButtonText, { color: job.is_active ? "#F59E0B" : "#10B981" }]}>
            {job.is_active ? "Deactivate" : "Activate"}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => deleteJob(job)}
        >
          <MaterialIcons name="delete" size={18} color="#EF4444" />
          <Text style={[styles.actionButtonText, { color: "#EF4444" }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const ApplicantCard = ({ applicant }: { applicant: Applicant }) => (
    <View style={styles.applicantCard}>
      <View style={styles.applicantHeader}>
        <View>
          <Text style={styles.applicantName}>{applicant.name}</Text>
          <Text style={styles.applicantEmail}>{applicant.email}</Text>
          <Text style={styles.applicantPhone}>{applicant.phone}</Text>
        </View>
        <TouchableOpacity
          style={styles.resumeButton}
          onPress={() => openResume(applicant.resume_url)}
        >
          <MaterialIcons name="description" size={20} color="#3B82F6" />
          <Text style={styles.resumeButtonText}>Resume</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.skillsContainer}>
        <Text style={styles.skillsTitle}>Skills:</Text>
        <View style={styles.skillsList}>
          {applicant.skills.map((skill, index) => (
            <View key={index} style={styles.skillTag}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <Text style={styles.appliedDate}>
        Applied on {formatDate(applicant.applied_at)}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <AntDesign name="loading1" size={32} color="#3B82F6" />
          <Text style={styles.loadingText}>Loading your jobs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Jobs</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push("/(protected)/employer/create")}
        >
          <AntDesign name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={jobs}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <JobCard job={item} />}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="work-off" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No jobs posted yet</Text>
            <Text style={styles.emptySubtitle}>
              Start by creating your first job posting
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push("/(protected)/employer/create")}
            >
              <Text style={styles.emptyButtonText}>Create Job</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Job Details Modal */}
      <Modal
        visible={showJobDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowJobDetails(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Job Details</Text>
            <TouchableOpacity onPress={() => setShowJobDetails(false)}>
              <AntDesign name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>
          
          {selectedJob && (
            <ScrollView style={styles.modalContent}>
              <Text style={styles.detailTitle}>{selectedJob.title}</Text>
              <Text style={styles.detailLocation}>
                {selectedJob.location.city}, {selectedJob.location.state}
                {selectedJob.location.remote && " • Remote"}
              </Text>
              <Text style={styles.detailSalary}>{formatSalary(selectedJob.salary)}</Text>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Description</Text>
                <Text style={styles.detailText}>{selectedJob.description}</Text>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Employment Type</Text>
                <Text style={styles.detailText}>
                  {selectedJob.employment_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Posted</Text>
                <Text style={styles.detailText}>{formatDate(selectedJob.posted_at)}</Text>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Expires</Text>
                <Text style={styles.detailText}>{formatDate(selectedJob.expires_at)}</Text>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* Applicants Modal */}
      <Modal
        visible={showApplicants}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowApplicants(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Applicants {selectedJob && `(${selectedJob.applicants_count})`}
            </Text>
            <TouchableOpacity onPress={() => setShowApplicants(false)}>
              <AntDesign name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>
          
          {loadingApplicants ? (
            <View style={styles.loadingContainer}>
              <AntDesign name="loading1" size={32} color="#3B82F6" />
              <Text style={styles.loadingText}>Loading applicants...</Text>
            </View>
          ) : (
            <FlatList
              data={applicants}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => <ApplicantCard applicant={item} />}
              contentContainerStyle={styles.applicantsContainer}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="people-outline" size={64} color="#D1D5DB" />
                  <Text style={styles.emptyTitle}>No applicants yet</Text>
                  <Text style={styles.emptySubtitle}>
                    Applications will appear here when candidates apply
                  </Text>
                </View>
              }
            />
          )}
        </SafeAreaView>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  createButton: {
    backgroundColor: "#3B82F6",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
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
  listContainer: {
    paddingVertical: 16,
    paddingBottom: 100,
  },
  jobCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inactiveJobCard: {
    opacity: 0.7,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  jobTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: "#D1FAE5",
  },
  inactiveBadge: {
    backgroundColor: "#FEF3C7",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  activeText: {
    color: "#065F46",
  },
  inactiveText: {
    color: "#92400E",
  },
  menuButton: {
    padding: 4,
  },
  jobLocation: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  jobSalary: {
    fontSize: 14,
    color: "#059669",
    fontWeight: "500",
    marginBottom: 8,
  },
  jobDescription: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 12,
  },
  jobStats: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: "#6B7280",
  },
  jobActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#3B82F6",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  detailLocation: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 4,
  },
  detailSalary: {
    fontSize: 16,
    color: "#059669",
    fontWeight: "500",
    marginBottom: 24,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  applicantsContainer: {
    paddingVertical: 16,
  },
  applicantCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  applicantHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  applicantEmail: {
    fontSize: 14,
    color: "#3B82F6",
    marginBottom: 2,
  },
  applicantPhone: {
    fontSize: 14,
    color: "#6B7280",
  },
  resumeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EBF8FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  resumeButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#3B82F6",
  },
  skillsContainer: {
    marginBottom: 12,
  },
  skillsTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  skillsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  skillTag: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillText: {
    fontSize: 12,
    color: "#374151",
  },
  appliedDate: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
  },
});

export default EmployerJobs;