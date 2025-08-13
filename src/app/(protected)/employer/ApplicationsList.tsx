import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Application {
  _id: string;
  job_id: string;
  job_title: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  location: string;
  experience: string;
  skills: string[];
  education: string;
  resume_url: string;
  cover_letter: string;
  applied_at: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  match_score: number;
  notes?: string;
}

interface FilterOptions {
  status: string;
  job: string;
  dateRange: string;
  minMatchScore: number;
}

const ApplicationsList = () => {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    job: 'all',
    dateRange: 'all',
    minMatchScore: 0,
  });

  const statusOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Reviewed', value: 'reviewed' },
    { label: 'Shortlisted', value: 'shortlisted' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Hired', value: 'hired' },
  ];

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applications, filters, searchQuery]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockApplications: Application[] = [
        {
          _id: '1',
          job_id: 'job1',
          job_title: 'Senior React Developer',
          applicant_name: 'John Doe',
          applicant_email: 'john.doe@email.com',
          applicant_phone: '+1 (555) 123-4567',
          location: 'New York, NY',
          experience: '5+ years',
          skills: ['React', 'JavaScript', 'TypeScript', 'Node.js'],
          education: 'BS Computer Science - MIT',
          resume_url: 'https://example.com/resume1.pdf',
          cover_letter: 'I am excited to apply for this position...',
          applied_at: '2024-01-20T10:30:00Z',
          status: 'pending',
          match_score: 92,
          notes: '',
        },
        {
          _id: '2',
          job_id: 'job1',
          job_title: 'Senior React Developer',
          applicant_name: 'Jane Smith',
          applicant_email: 'jane.smith@email.com',
          applicant_phone: '+1 (555) 987-6543',
          location: 'San Francisco, CA',
          experience: '7+ years',
          skills: ['React', 'Vue.js', 'Python', 'AWS'],
          education: 'MS Software Engineering - Stanford',
          resume_url: 'https://example.com/resume2.pdf',
          cover_letter: 'With my extensive experience...',
          applied_at: '2024-01-19T14:15:00Z',
          status: 'shortlisted',
          match_score: 87,
          notes: 'Great candidate, strong technical background',
        },
        {
          _id: '3',
          job_id: 'job2',
          job_title: 'UI/UX Designer',
          applicant_name: 'Mike Johnson',
          applicant_email: 'mike.johnson@email.com',
          applicant_phone: '+1 (555) 456-7890',
          location: 'Austin, TX',
          experience: '3+ years',
          skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping'],
          education: 'BFA Design - Parsons',
          resume_url: 'https://example.com/resume3.pdf',
          cover_letter: 'I believe my design skills...',
          applied_at: '2024-01-18T09:45:00Z',
          status: 'reviewed',
          match_score: 78,
          notes: '',
        },
      ];
      setApplications(mockApplications);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = applications;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app =>
        app.applicant_name.toLowerCase().includes(query) ||
        app.applicant_email.toLowerCase().includes(query) ||
        app.job_title.toLowerCase().includes(query) ||
        app.skills.some(skill => skill.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(app => app.status === filters.status);
    }

    // Match score filter
    if (filters.minMatchScore > 0) {
      filtered = filtered.filter(app => app.match_score >= filters.minMatchScore);
    }

    // Sort by applied date (newest first)
    filtered.sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime());

    setFilteredApplications(filtered);
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      // TODO: Replace with actual API call
      setApplications(prev => prev.map(app =>
        app._id === applicationId ? { ...app, status: newStatus as any } : app
      ));
      Alert.alert('Success', `Application status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update application status');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadApplications();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'reviewed': return '#3b82f6';
      case 'shortlisted': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'hired': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getStatusBadgeStyle = (status: string) => ({
    backgroundColor: getStatusColor(status) + '20',
    borderColor: getStatusColor(status),
    borderWidth: 1,
  });

  const ApplicationCard = ({ application }: { application: Application }) => (
    <TouchableOpacity
      style={styles.applicationCard}
      onPress={() => {
        setSelectedApplication(application);
        setShowDetails(true);
      }}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.applicantInfo}>
          <Text style={styles.applicantName} numberOfLines={1}>
            {application.applicant_name}
          </Text>
          <Text style={styles.jobTitle} numberOfLines={1}>
            {application.job_title}
          </Text>
        </View>
        <View style={styles.cardRight}>
          <View style={[styles.statusBadge, getStatusBadgeStyle(application.status)]}>
            <Text style={[styles.statusText, { color: getStatusColor(application.status) }]}>
              {application.status}
            </Text>
          </View>
          <View style={styles.matchScore}>
            <MaterialIcons name="star" size={14} color="#f59e0b" />
            <Text style={styles.matchScoreText}>{application.match_score}%</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <MaterialIcons name="location-on" size={14} color="#6b7280" />
          <Text style={styles.infoText}>{application.location}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="work" size={14} color="#6b7280" />
          <Text style={styles.infoText}>{application.experience}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="schedule" size={14} color="#6b7280" />
          <Text style={styles.infoText}>
            Applied {new Date(application.applied_at).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.skillsPreview}>
        {application.skills.slice(0, 3).map((skill, index) => (
          <View key={index} style={styles.skillTag}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
        {application.skills.length > 3 && (
          <Text style={styles.moreSkills}>+{application.skills.length - 3} more</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const StatusButton = ({ status, label, color }: any) => (
    <TouchableOpacity
      style={[styles.statusButton, { backgroundColor: color + '20', borderColor: color }]}
      onPress={() => {
        if (selectedApplication) {
          updateApplicationStatus(selectedApplication._id, status);
          setShowDetails(false);
        }
      }}
    >
      <Text style={[styles.statusButtonText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Applications</Text>
        <TouchableOpacity onPress={() => setShowFilters(true)}>
          <MaterialIcons name="filter-list" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search applications..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="clear" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Quick Filters */}
      <View style={styles.quickFilters}>
        {statusOptions.slice(0, 4).map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.quickFilter,
              filters.status === option.value && styles.activeQuickFilter
            ]}
            onPress={() => setFilters(prev => ({ ...prev, status: option.value }))}
          >
            <Text
              style={[
                styles.quickFilterText,
                filters.status === option.value && styles.activeQuickFilterText
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Results Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''} found
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(protected)/employer/ApplicantReview')}
          style={styles.reviewButton}
        >
          <MaterialIcons name="swipe" size={16} color="#3b82f6" />
          <Text style={styles.reviewButtonText}>Review Mode</Text>
        </TouchableOpacity>
      </View>

      {/* Applications List */}
      <FlatList
        data={filteredApplications}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <ApplicationCard application={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <MaterialIcons name="assignment" size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No applications found</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Try adjusting your search terms' : 'Applications will appear here when candidates apply'}
            </Text>
          </View>
        )}
      />

      {/* Application Details Modal */}
      <Modal
        visible={showDetails}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDetails(false)}>
              <MaterialIcons name="close" size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Application Details</Text>
            <TouchableOpacity
              onPress={() => {
                if (selectedApplication) {
                  setShowDetails(false);
                  router.push({
                    pathname: '/(protected)/employer/ApplicantReview',
                    params: { 
                      jobId: selectedApplication.job_id,
                      applicationId: selectedApplication._id 
                    }
                  });
                }
              }}
            >
              <MaterialIcons name="swipe" size={24} color="#3b82f6" />
            </TouchableOpacity>
          </View>

          {selectedApplication && (
            <View style={styles.modalContent}>
              <View style={styles.detailsHeader}>
                <Text style={styles.detailsName}>{selectedApplication.applicant_name}</Text>
                <View style={styles.detailsMatch}>
                  <MaterialIcons name="star" size={16} color="#f59e0b" />
                  <Text style={styles.detailsMatchText}>{selectedApplication.match_score}% Match</Text>
                </View>
              </View>

              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Contact Information</Text>
                <Text style={styles.detailsText}>Email: {selectedApplication.applicant_email}</Text>
                <Text style={styles.detailsText}>Phone: {selectedApplication.applicant_phone}</Text>
                <Text style={styles.detailsText}>Location: {selectedApplication.location}</Text>
              </View>

              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Professional Info</Text>
                <Text style={styles.detailsText}>Experience: {selectedApplication.experience}</Text>
                <Text style={styles.detailsText}>Education: {selectedApplication.education}</Text>
              </View>

              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Skills</Text>
                <View style={styles.skillsContainer}>
                  {selectedApplication.skills.map((skill, index) => (
                    <View key={index} style={styles.skillTag}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Cover Letter</Text>
                <Text style={styles.coverLetterText}>{selectedApplication.cover_letter}</Text>
              </View>

              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Application Status</Text>
                <View style={styles.statusActions}>
                  <StatusButton status="reviewed" label="Mark Reviewed" color="#3b82f6" />
                  <StatusButton status="shortlisted" label="Shortlist" color="#10b981" />
                  <StatusButton status="rejected" label="Reject" color="#ef4444" />
                  <StatusButton status="hired" label="Hire" color="#8b5cf6" />
                </View>
              </View>

              <View style={styles.detailsSection}>
                <TouchableOpacity
                  style={styles.resumeButton}
                  onPress={() => {
                    // TODO: Open resume URL
                    console.log('Opening resume:', selectedApplication.resume_url);
                  }}
                >
                  <MaterialIcons name="description" size={20} color="#3b82f6" />
                  <Text style={styles.resumeButtonText}>View Resume</Text>
                  <MaterialIcons name="open-in-new" size={16} color="#3b82f6" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity
              onPress={() => {
                applyFilters();
                setShowFilters(false);
              }}
            >
              <Text style={styles.modalSave}>Apply</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filtersContent}>
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Status</Text>
              {statusOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterOption,
                    filters.status === option.value && styles.activeFilterOption
                  ]}
                  onPress={() => setFilters(prev => ({ ...prev, status: option.value }))}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      filters.status === option.value && styles.activeFilterOptionText
                    ]}
                  >
                    {option.label}
                  </Text>
                  {filters.status === option.value && (
                    <MaterialIcons name="check" size={20} color="#3b82f6" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Minimum Match Score</Text>
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>{filters.minMatchScore}%</Text>
                {/* Note: You would implement a proper slider component here */}
                <View style={styles.sliderButtons}>
                  {[0, 50, 70, 80, 90].map((score) => (
                    <TouchableOpacity
                      key={score}
                      style={[
                        styles.sliderButton,
                        filters.minMatchScore === score && styles.activeSliderButton
                      ]}
                      onPress={() => setFilters(prev => ({ ...prev, minMatchScore: score }))}
                    >
                      <Text
                        style={[
                          styles.sliderButtonText,
                          filters.minMatchScore === score && styles.activeSliderButtonText
                        ]}
                      >
                        {score}%
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.resetFiltersButton}
              onPress={() => setFilters({ status: 'all', job: 'all', dateRange: 'all', minMatchScore: 0 })}
            >
              <Text style={styles.resetFiltersText}>Reset All Filters</Text>
            </TouchableOpacity>
          </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
  },
  quickFilters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    gap: 8,
  },
  quickFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  activeQuickFilter: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  quickFilterText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeQuickFilterText: {
    color: '#fff',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  summaryText: {
    fontSize: 14,
    color: '#6b7280',
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbeafe',
    gap: 4,
  },
  reviewButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  applicationCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  applicantInfo: {
    flex: 1,
    marginRight: 12,
  },
  applicantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  matchScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  matchScoreText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
  },
  cardBody: {
    marginBottom: 12,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
  },
  skillsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillTag: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  skillText: {
    fontSize: 12,
    color: '#1d4ed8',
    fontWeight: '500',
  },
  moreSkills: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
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
    lineHeight: 24,
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
  modalContent: {
    flex: 1,
    padding: 20,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  detailsName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  detailsMatch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsMatchText: {
    fontSize: 16,
    color: '#f59e0b',
    fontWeight: '600',
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  detailsText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  coverLetterText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  statusActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbeafe',
    gap: 8,
  },
  resumeButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  filtersContent: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 32,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeFilterOption: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  activeFilterOptionText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  sliderContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sliderLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  sliderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  activeSliderButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  sliderButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeSliderButtonText: {
    color: '#fff',
  },
  resetFiltersButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
  },
  resetFiltersText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
});

export default ApplicationsList;