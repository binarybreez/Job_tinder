import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  matchPercentage: number;
  type: string;
  description: string;
  tags: string[];
  postedTime: string;
  requirements: string[];
  benefits: string[];
  hrContact: {
    name: string;
    position: string;
    email: string;
    phone: string;
    profileImage?: string;
  };
  companyDescription: string;
}

const { width } = Dimensions.get("window");

const SavedJobs = () => {
  // Mock saved jobs data - in real app, this would come from your state management
  const savedJobsData: Job[] = [
    {
      id: "1",
      title: "Frontend Developer",
      company: "Tech Corp",
      location: "Remote",
      salary: "$60k - $80k",
      matchPercentage: 85,
      type: "Full-time",
      description:
        "We are looking for a skilled frontend developer proficient in React Native and modern JavaScript frameworks. You'll work on cutting-edge mobile applications and collaborate with a dynamic team of designers and backend developers.",
      tags: ["React", "Native", "JavaScript", "TypeScript"],
      postedTime: "2 days ago",
      requirements: [
        "3+ years experience with React Native",
        "Strong knowledge of JavaScript/TypeScript",
        "Experience with RESTful APIs",
        "Knowledge of mobile app deployment processes",
        "Familiarity with version control (Git)",
      ],
      benefits: [
        "Health insurance",
        "Remote work flexibility",
        "Annual bonus",
        "Professional development budget",
        "Flexible PTO",
      ],
      hrContact: {
        name: "Sarah Johnson",
        position: "HR Manager",
        email: "sarah.johnson@techcorp.com",
        phone: "+1 (555) 123-4567",
      },
      companyDescription:
        "Tech Corp is a leading technology company specializing in innovative mobile solutions. We pride ourselves on creating user-centric applications that make a real difference in people's lives.",
    },
    {
      id: "3",
      title: "Mobile App Developer",
      company: "Innovation Labs",
      location: "San Francisco, CA",
      salary: "$85k - $105k",
      matchPercentage: 91,
      type: "Full-time",
      description:
        "Build cutting-edge mobile applications using React Native and Flutter. Work with a dynamic team on exciting projects that reach millions of users worldwide.",
      tags: ["React Native", "Flutter", "iOS", "Android"],
      postedTime: "3 days ago",
      requirements: [
        "5+ years mobile development experience",
        "Expertise in React Native and Flutter",
        "Experience with both iOS and Android platforms",
        "Knowledge of mobile UI/UX best practices",
        "Experience with app store deployment",
      ],
      benefits: [
        "Competitive salary",
        "Stock options",
        "Premium health coverage",
        "Gym membership",
        "Catered meals",
      ],
      hrContact: {
        name: "Michael Chen",
        position: "Talent Acquisition Lead",
        email: "michael.chen@innovationlabs.com",
        phone: "+1 (555) 987-6543",
      },
      companyDescription:
        "Innovation Labs is at the forefront of mobile technology innovation. We develop groundbreaking applications that transform industries and improve user experiences globally.",
    },
  ];

  const [savedJobs, setSavedJobs] = useState<Job[]>(savedJobsData);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);

  const handleJobPress = (job: Job) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  const handleUnsaveJob = (jobId: string) => {
    Alert.alert(
      "Remove Job",
      "Are you sure you want to remove this job from your saved list?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setSavedJobs(prev => prev.filter(job => job.id !== jobId));
          },
        },
      ]
    );
  };

  const handleApply = (job: Job) => {
    Alert.alert("Apply for Job", `Ready to apply for ${job.title}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Apply",
        onPress: () => {
          Alert.alert("Success!", "Your application has been submitted!");
          setShowJobModal(false);
        },
      },
    ]);
  };

  const handleContactHR = (hrContact: Job['hrContact']) => {
    Alert.alert(
      "Contact HR",
      `Contact ${hrContact.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Call", onPress: () => Alert.alert("Calling...", `${hrContact.phone}`) },
        { text: "Email", onPress: () => Alert.alert("Opening email...", `${hrContact.email}`) },
      ]
    );
  };

  const renderJobCard = (job: Job) => (
    <TouchableOpacity
      key={job.id}
      style={styles.jobCard}
      onPress={() => handleJobPress(job)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>{job.company.charAt(0)}</Text>
        </View>
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.company}>{job.company}</Text>
          <View style={styles.jobMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color="#94a3b8" />
              <Text style={styles.metaText}>{job.location}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="cash-outline" size={14} color="#94a3b8" />
              <Text style={styles.metaText}>{job.salary}</Text>
            </View>
          </View>
        </View>
        <View style={styles.cardActions}>
          <View style={styles.matchBadge}>
            <Text style={styles.matchText}>{job.matchPercentage}%</Text>
          </View>
          <TouchableOpacity
            style={styles.unsaveButton}
            onPress={() => handleUnsaveJob(job.id)}
          >
            <Ionicons name="bookmark" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.jobDescription} numberOfLines={2}>
        {job.description}
      </Text>
      
      <View style={styles.tags}>
        {job.tags.slice(0, 3).map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
        {job.tags.length > 3 && (
          <Text style={styles.moreTagsText}>+{job.tags.length - 3} more</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderJobModal = () => (
    <Modal
      visible={showJobModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowJobModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowJobModal(false)}
          >
            <Ionicons name="close" size={24} color="#f1f5f9" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Job Details</Text>
          <View style={styles.placeholder} />
        </View>

        {selectedJob && (
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Job Header */}
            <View style={styles.jobHeader}>
              <View style={styles.jobHeaderInfo}>
                <Text style={styles.modalJobTitle}>{selectedJob.title}</Text>
                <Text style={styles.modalCompany}>{selectedJob.company}</Text>
                <View style={styles.jobDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="location-outline" size={16} color="#94a3b8" />
                    <Text style={styles.detailText}>{selectedJob.location}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="cash-outline" size={16} color="#94a3b8" />
                    <Text style={styles.detailText}>{selectedJob.salary}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={16} color="#94a3b8" />
                    <Text style={styles.detailText}>{selectedJob.postedTime}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="briefcase-outline" size={16} color="#94a3b8" />
                    <Text style={styles.detailText}>{selectedJob.type}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.matchBadgeLarge}>
                <Text style={styles.matchTextLarge}>{selectedJob.matchPercentage}% match</Text>
              </View>
            </View>

            {/* Company Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About Company</Text>
              <Text style={styles.sectionContent}>{selectedJob.companyDescription}</Text>
            </View>

            {/* Job Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Job Description</Text>
              <Text style={styles.sectionContent}>{selectedJob.description}</Text>
            </View>

            {/* Requirements */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Requirements</Text>
              {selectedJob.requirements.map((req, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.listText}>{req}</Text>
                </View>
              ))}
            </View>

            {/* Benefits */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Benefits</Text>
              {selectedJob.benefits.map((benefit, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.listText}>{benefit}</Text>
                </View>
              ))}
            </View>

            {/* Skills */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Required Skills</Text>
              <View style={styles.skillTags}>
                {selectedJob.tags.map((tag, index) => (
                  <View key={index} style={styles.skillTag}>
                    <Text style={styles.skillTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* HR Contact */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>HR Contact</Text>
              <TouchableOpacity
                style={styles.hrCard}
                onPress={() => handleContactHR(selectedJob.hrContact)}
              >
                <View style={styles.hrAvatar}>
                  <Text style={styles.hrAvatarText}>
                    {selectedJob.hrContact.name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <View style={styles.hrInfo}>
                  <Text style={styles.hrName}>{selectedJob.hrContact.name}</Text>
                  <Text style={styles.hrPosition}>{selectedJob.hrContact.position}</Text>
                  <Text style={styles.hrEmail}>{selectedJob.hrContact.email}</Text>
                  <Text style={styles.hrPhone}>{selectedJob.hrContact.phone}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalFooterSpacer} />
          </ScrollView>
        )}

        {/* Fixed Apply Button */}
        {selectedJob && (
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => handleApply(selectedJob)}
            >
              <Text style={styles.applyButtonText}>Apply Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Jobs</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{savedJobs.length}</Text>
        </View>
      </View>

      {savedJobs.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bookmark-outline" size={64} color="#64748b" />
          <Text style={styles.emptyTitle}>No Saved Jobs</Text>
          <Text style={styles.emptyDescription}>
            Jobs you bookmark will appear here for easy access
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.jobsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.jobsListContent}
        >
          {savedJobs.map(renderJobCard)}
        </ScrollView>
      )}

      {renderJobModal()}
    </SafeAreaView>
  );
};

export default SavedJobs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f1f5f9",
    marginRight: 8,
  },
  headerBadge: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: "center",
  },
  headerBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f1f5f9",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#cbd5e1",
    textAlign: "center",
    lineHeight: 20,
  },
  jobsList: {
    flex: 1,
  },
  jobsListContent: {
    padding: 16,
  },
  jobCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  logoText: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#1e3a8a",
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  company: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  jobMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 4,
  },
  cardActions: {
    alignItems: "flex-end",
  },
  matchBadge: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#22c55e",
    marginBottom: 8,
  },
  matchText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#22c55e",
  },
  unsaveButton: {
    padding: 4,
  },
  jobDescription: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
    marginBottom: 12,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  tag: {
    backgroundColor: "#f1f5f9",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 10,
    color: "#475569",
    fontWeight: "500",
  },
  moreTagsText: {
    fontSize: 10,
    color: "#6b7280",
    fontStyle: "italic",
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#1e293b",
    backgroundImage: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
    backgroundColor: "rgba(30, 41, 59, 0.8)",
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f1f5f9",
  },
  placeholder: {
    width: 32,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  jobHeader: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
    marginBottom: 20,
  },
  jobHeaderInfo: {
    marginBottom: 16,
  },
  modalJobTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#f1f5f9",
    marginBottom: 4,
  },
  modalCompany: {
    fontSize: 16,
    color: "#cbd5e1",
    marginBottom: 16,
  },
  jobDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#e2e8f0",
    marginLeft: 6,
  },
  matchBadgeLarge: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#22c55e",
    alignSelf: "flex-start",
  },
  matchTextLarge: {
    fontSize: 14,
    fontWeight: "600",
    color: "#22c55e",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f1f5f9",
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 14,
    color: "#cbd5e1",
    lineHeight: 22,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 14,
    color: "#3b82f6",
    marginRight: 8,
    marginTop: 2,
  },
  listText: {
    fontSize: 14,
    color: "#cbd5e1",
    flex: 1,
    lineHeight: 20,
  },
  skillTags: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillTag: {
    backgroundColor: "#dbeafe",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  skillTagText: {
    fontSize: 12,
    color: "#1e40af",
    fontWeight: "500",
  },
  hrCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
  },
  hrAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  hrAvatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  hrInfo: {
    flex: 1,
  },
  hrName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f1f5f9",
    marginBottom: 2,
  },
  hrPosition: {
    fontSize: 14,
    color: "#cbd5e1",
    marginBottom: 4,
  },
  hrEmail: {
    fontSize: 12,
    color: "#3b82f6",
    marginBottom: 2,
  },
  hrPhone: {
    fontSize: 12,
    color: "#94a3b8",
  },
  modalFooterSpacer: {
    height: 80,
  },
  modalFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(30, 41, 59, 0.9)",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#374151",
  },
  applyButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});