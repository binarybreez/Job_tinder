import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Add your API base URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';

interface Application {
  id: string;
  company_name: string;
  position_title: string;
  application_type: 'internship' | 'job';
  application_date: string;
  status: 'applied' | 'under_review' | 'interview_scheduled' | 'rejected' | 'accepted';
  keyword_match_percentage: number;
  matched_keywords: string[];
  total_keywords: number;
  job_description: string;
  application_platform: string;
  notes?: string;
  interview_date?: string;
  salary_range?: string;
  location: string;
  remote_option: boolean;
}

const ApplicationsIndex = () => {
  const { userId, getToken } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'internship' | 'job'>('all');
  const [sortBy, setSortBy] = useState<'percentage' | 'date' | 'company'>('percentage');

  useEffect(() => {
    if (userId) {
      fetchApplications();
    }
  }, [userId, filter, sortBy]);

  const fetchApplications = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${API_BASE_URL}/applications?clerk_id=${userId}&filter=${filter}&sort_by=${sortBy}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Sort by keyword match percentage in descending order
        const sortedData = data.sort((a: Application, b: Application) => {
          if (sortBy === 'percentage') {
            return b.keyword_match_percentage - a.keyword_match_percentage;
          } else if (sortBy === 'date') {
            return new Date(b.application_date).getTime() - new Date(a.application_date).getTime();
          } else {
            return a.company_name.localeCompare(b.company_name);
          }
        });
        setApplications(sortedData);
      } else {
        Alert.alert('Error', 'Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      Alert.alert('Error', 'Failed to fetch applications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchApplications();
  };

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'applied': return '#3b82f6';
      case 'under_review': return '#f59e0b';
      case 'interview_scheduled': return '#8b5cf6';
      case 'accepted': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: Application['status']) => {
    return status.replace('_', ' ').toUpperCase();
  };

  const getMatchPercentageColor = (percentage: number) => {
    if (percentage >= 80) return '#10b981'; // Green
    if (percentage >= 60) return '#f59e0b'; // Amber
    if (percentage >= 40) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const handleApplicationPress = (application: Application) => {
    // Show application details in an alert for now
    // You can replace this with navigation to an existing route or create the application-details route
    Alert.alert(
      'Application Details',
      `Company: ${application.company_name}\nPosition: ${application.position_title}\nStatus: ${getStatusText(application.status)}\nMatch: ${application.keyword_match_percentage}%\nLocation: ${application.location}${application.remote_option ? ' • Remote' : ''}\nPlatform: ${application.application_platform}\nDate Applied: ${new Date(application.application_date).toLocaleDateString()}${application.salary_range ? `\nSalary: ${application.salary_range}` : ''}${application.notes ? `\nNotes: ${application.notes}` : ''}`,
      [
        {
          text: 'Close',
          style: 'cancel'
        },
        {
          text: 'Track Application',
          onPress: () => trackApplication(application.id)
        }
      ]
    );
  };

  const trackApplication = async (applicationId: string) => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${API_BASE_URL}/applications/${applicationId}/track`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const trackingData = await response.json();
        Alert.alert('Tracking Info', `Application tracked successfully. Status: ${trackingData.status}`);
        fetchApplications(); // Refresh data
      } else {
        Alert.alert('Error', 'Failed to track application');
      }
    } catch (error) {
      console.error('Error tracking application:', error);
      Alert.alert('Error', 'Failed to track application');
    }
  };

  const renderApplicationItem = ({ item }: { item: Application }) => (
    <TouchableOpacity 
      style={styles.applicationCard}
      onPress={() => handleApplicationPress(item)}
      activeOpacity={0.7}
    >
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{item.company_name}</Text>
          <Text style={styles.positionTitle}>{item.position_title}</Text>
        </View>
        <View style={styles.typeAndStatus}>
          <View style={[styles.typeBadge, { 
            backgroundColor: item.application_type === 'internship' ? '#dbeafe' : '#fef3c7' 
          }]}>
            <Text style={[styles.typeText, { 
              color: item.application_type === 'internship' ? '#1e40af' : '#92400e' 
            }]}>
              {item.application_type.toUpperCase()}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>
      </View>

      {/* Keywords Match Row */}
      <View style={styles.keywordRow}>
        <View style={styles.matchPercentage}>
          <Text style={styles.matchLabel}>Match:</Text>
          <Text style={[styles.matchValue, { color: getMatchPercentageColor(item.keyword_match_percentage) }]}>
            {item.keyword_match_percentage}%
          </Text>
        </View>
        <Text style={styles.keywordCount}>
          {item.matched_keywords.length}/{item.total_keywords} keywords
        </Text>
      </View>

      {/* Details Row */}
      <View style={styles.detailsRow}>
        <View style={styles.locationInfo}>
          <Ionicons name="location-outline" size={14} color="#6b7280" />
          <Text style={styles.locationText}>
            {item.location} {item.remote_option && '• Remote'}
          </Text>
        </View>
        <Text style={styles.dateText}>
          {new Date(item.application_date).toLocaleDateString()}
        </Text>
      </View>

      {/* Platform and Salary */}
      <View style={styles.platformRow}>
        <Text style={styles.platformText}>via {item.application_platform}</Text>
        {item.salary_range && (
          <Text style={styles.salaryText}>{item.salary_range}</Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={styles.trackButton}
          onPress={(e) => {
            e.stopPropagation();
            trackApplication(item.id);
          }}
        >
          <Ionicons name="eye-outline" size={16} color="#2563eb" />
          <Text style={styles.trackButtonText}>Track</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => handleApplicationPress(item)}
        >
          <Ionicons name="arrow-forward-outline" size={16} color="#059669" />
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>

      {/* Matched Keywords Preview */}
      <View style={styles.keywordsPreview}>
        <Text style={styles.keywordsLabel}>Matched Keywords:</Text>
        <View style={styles.keywordsContainer}>
          {item.matched_keywords.slice(0, 3).map((keyword, index) => (
            <View key={index} style={styles.keywordTag}>
              <Text style={styles.keywordText}>{keyword}</Text>
            </View>
          ))}
          {item.matched_keywords.length > 3 && (
            <Text style={styles.moreKeywords}>+{item.matched_keywords.length - 3} more</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>My Applications</Text>
      
      {/* Filters */}
      <View style={styles.filtersRow}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Type:</Text>
          <View style={styles.filterButtons}>
            {['all', 'internship', 'job'].map((filterOption) => (
              <TouchableOpacity
                key={filterOption}
                style={[
                  styles.filterButton,
                  filter === filterOption && styles.activeFilterButton
                ]}
                onPress={() => setFilter(filterOption as any)}
              >
                <Text style={[
                  styles.filterButtonText,
                  filter === filterOption && styles.activeFilterButtonText
                ]}>
                  {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Sort:</Text>
          <View style={styles.filterButtons}>
            {[
              { key: 'percentage', label: 'Match %' },
              { key: 'date', label: 'Date' },
              { key: 'company', label: 'Company' }
            ].map((sortOption) => (
              <TouchableOpacity
                key={sortOption.key}
                style={[
                  styles.filterButton,
                  sortBy === sortOption.key && styles.activeFilterButton
                ]}
                onPress={() => setSortBy(sortOption.key as any)}
              >
                <Text style={[
                  styles.filterButtonText,
                  sortBy === sortOption.key && styles.activeFilterButtonText
                ]}>
                  {sortOption.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{applications.length}</Text>
          <Text style={styles.statLabel}>Total Applications</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {applications.filter(app => app.application_type === 'internship').length}
          </Text>
          <Text style={styles.statLabel}>Internships</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {applications.filter(app => app.status === 'interview_scheduled').length}
          </Text>
          <Text style={styles.statLabel}>Interviews</Text>
        </View>
      </View>
    </View>
  );

  if (loading && applications.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading applications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={applications}
        renderItem={renderApplicationItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyStateTitle}>No Applications Yet</Text>
            <Text style={styles.emptyStateText}>
              Start applying to internships and jobs to see them here
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default ApplicationsIndex;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  listContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  filtersRow: {
    marginBottom: 16,
  },
  filterGroup: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374751',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  activeFilterButton: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeFilterButtonText: {
    color: '#ffffff',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  applicationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  positionTitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  typeAndStatus: {
    alignItems: 'flex-end',
    gap: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  keywordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  matchPercentage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matchLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374751',
  },
  matchValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  keywordCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#6b7280',
  },
  dateText: {
    fontSize: 12,
    color: '#6b7280',
  },
  platformRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  platformText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  salaryText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#dbeafe',
    borderRadius: 8,
  },
  trackButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2563eb',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#d1fae5',
    borderRadius: 8,
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#059669',
  },
  keywordsPreview: {
    marginTop: 8,
  },
  keywordsLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374751',
    marginBottom: 4,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    alignItems: 'center',
  },
  keywordTag: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  keywordText: {
    fontSize: 10,
    color: '#065f46',
    fontWeight: '500',
  },
  moreKeywords: {
    fontSize: 10,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});