import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Applicant {
  _id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  experience: string;
  skills: string[];
  education: string;
  resume_url: string;
  cover_letter: string;
  applied_at: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected';
  match_score: number;
}

interface Job {
  _id: string;
  title: string;
  company: string;
}

const ApplicantReview = () => {
  const router = useRouter();
  const { jobId, applicantId } = useLocalSearchParams();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadData();
  }, [jobId]);

  const loadData = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockJob: Job = {
        _id: jobId as string,
        title: 'Senior React Developer',
        company: 'Tech Solutions Inc.',
      };

      const mockApplicants: Applicant[] = [
        {
          _id: '1',
          name: 'John Doe',
          email: 'john.doe@email.com',
          phone: '+1 (555) 123-4567',
          location: 'New York, NY',
          experience: '5+ years',
          skills: ['React', 'JavaScript', 'TypeScript', 'Node.js', 'MongoDB'],
          education: 'BS Computer Science - MIT',
          resume_url: 'https://example.com/resume1.pdf',
          cover_letter: 'I am excited to apply for this position because...',
          applied_at: '2024-01-20',
          status: 'pending',
          match_score: 92,
        },
        {
          _id: '2',
          name: 'Jane Smith',
          email: 'jane.smith@email.com',
          phone: '+1 (555) 987-6543',
          location: 'San Francisco, CA',
          experience: '7+ years',
          skills: ['React', 'Vue.js', 'Python', 'AWS', 'Docker'],
          education: 'MS Software Engineering - Stanford',
          resume_url: 'https://example.com/resume2.pdf',
          cover_letter: 'With my extensive experience in React development...',
          applied_at: '2024-01-19',
          status: 'pending',
          match_score: 87,
        },
        {
          _id: '3',
          name: 'Mike Johnson',
          email: 'mike.johnson@email.com',
          phone: '+1 (555) 456-7890',
          location: 'Austin, TX',
          experience: '3+ years',
          skills: ['React', 'JavaScript', 'GraphQL', 'PostgreSQL'],
          education: 'BS Computer Engineering - UT Austin',
          resume_url: 'https://example.com/resume3.pdf',
          cover_letter: 'I believe my skills align perfectly with your requirements...',
          applied_at: '2024-01-18',
          status: 'pending',
          match_score: 78,
        },
      ];

      setJob(mockJob);
      setApplicants(mockApplicants);
      
      // If specific applicant ID is provided, set it as current
      if (applicantId) {
        const index = mockApplicants.findIndex(a => a._id === applicantId);
        if (index !== -1) setCurrentIndex(index);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    const currentApplicant = applicants[currentIndex];
    const newStatus = direction === 'right' ? 'shortlisted' : 'rejected';
    
    // Animate the card out
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: direction === 'right' ? screenWidth : -screenWidth,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Update applicant status
      updateApplicantStatus(currentApplicant._id, newStatus);
      
      // Reset animation values
      translateX.setValue(0);
      translateY.setValue(0);
      rotate.setValue(0);
      opacity.setValue(1);
      
      // Move to next applicant
      if (currentIndex < applicants.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // No more applicants
        Alert.alert(
          'Review Complete',
          'You have reviewed all applicants for this job.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    });
  };

  const updateApplicantStatus = async (applicantId: string, status: string) => {
    try {
      // TODO: Replace with actual API call
      console.log(`Updating applicant ${applicantId} status to ${status}`);
      setApplicants(prev => prev.map(app => 
        app._id === applicantId ? { ...app, status: status as any } : app
      ));
    } catch (error) {
      console.error('Error updating applicant status:', error);
    }
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent;
      
      if (Math.abs(translationX) > screenWidth * 0.3 || Math.abs(velocityX) > 1000) {
        handleSwipe(translationX > 0 ? 'right' : 'left');
      } else {
        // Snap back
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const openResume = (url: string) => {
    Linking.openURL(url);
  };

  const sendEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const callApplicant = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading applicants...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (currentIndex >= applicants.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <MaterialIcons name="check-circle" size={64} color="#10b981" />
          <Text style={styles.emptyTitle}>All Done!</Text>
          <Text style={styles.emptyText}>You've reviewed all applicants</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Back to Jobs</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentApplicant = applicants[currentIndex];
  const rotateValue = rotate.interpolate({
    inputRange: [-screenWidth, 0, screenWidth],
    outputRange: ['-30deg', '0deg', '30deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{job?.title}</Text>
          <Text style={styles.headerSubtitle}>
            {currentIndex + 1} of {applicants.length} applicants
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(protected)/employer/ApplicationsList')}>
          <MaterialIcons name="list" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentIndex + 1) / applicants.length) * 100}%` }
            ]} 
          />
        </View>
      </View>

      {/* Card Stack */}
      <View style={styles.cardContainer}>
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View
            style={[
              styles.card,
              {
                transform: [
                  { translateX },
                  { translateY },
                  { rotate: rotateValue },
                ],
                opacity,
              },
            ]}
          >
            {/* Match Score */}
            <View style={styles.matchScore}>
              <Text style={styles.matchScoreText}>{currentApplicant.match_score}% Match</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Basic Info */}
              <View style={styles.section}>
                <Text style={styles.applicantName}>{currentApplicant.name}</Text>
                <View style={styles.contactInfo}>
                  <TouchableOpacity
                    style={styles.contactItem}
                    onPress={() => sendEmail(currentApplicant.email)}
                  >
                    <MaterialIcons name="email" size={16} color="#3b82f6" />
                    <Text style={styles.contactText}>{currentApplicant.email}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.contactItem}
                    onPress={() => callApplicant(currentApplicant.phone)}
                  >
                    <MaterialIcons name="phone" size={16} color="#10b981" />
                    <Text style={styles.contactText}>{currentApplicant.phone}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.infoRow}>
                  <MaterialIcons name="location-on" size={16} color="#6b7280" />
                  <Text style={styles.infoText}>{currentApplicant.location}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialIcons name="work" size={16} color="#6b7280" />
                  <Text style={styles.infoText}>{currentApplicant.experience} experience</Text>
                </View>
              </View>

              {/* Education */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Education</Text>
                <Text style={styles.educationText}>{currentApplicant.education}</Text>
              </View>

              {/* Skills */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Skills</Text>
                <View style={styles.skillsContainer}>
                  {currentApplicant.skills.map((skill, index) => (
                    <View key={index} style={styles.skillTag}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Cover Letter */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cover Letter</Text>
                <Text style={styles.coverLetterText}>{currentApplicant.cover_letter}</Text>
              </View>

              {/* Resume */}
              <View style={styles.section}>
                <TouchableOpacity
                  style={styles.resumeButton}
                  onPress={() => openResume(currentApplicant.resume_url)}
                >
                  <MaterialIcons name="description" size={20} color="#3b82f6" />
                  <Text style={styles.resumeButtonText}>View Resume</Text>
                  <MaterialIcons name="open-in-new" size={16} color="#3b82f6" />
                </TouchableOpacity>
              </View>

              {/* Application Date */}
              <View style={styles.section}>
                <Text style={styles.appliedDate}>
                  Applied on {new Date(currentApplicant.applied_at).toLocaleDateString()}
                </Text>
              </View>
            </ScrollView>
          </Animated.View>
        </PanGestureHandler>

        {/* Next Card Preview */}
        {currentIndex < applicants.length - 1 && (
          <View style={[styles.card, styles.nextCard]}>
            <Text style={styles.nextCardName}>{applicants[currentIndex + 1].name}</Text>
            <Text style={styles.nextCardMatch}>
              {applicants[currentIndex + 1].match_score}% Match
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleSwipe('left')}
        >
          <MaterialIcons name="close" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => {
            Alert.alert(
              'Applicant Info',
              `Name: ${currentApplicant.name}\nEmail: ${currentApplicant.email}\nPhone: ${currentApplicant.phone}`,
              [
                { text: 'Call', onPress: () => callApplicant(currentApplicant.phone) },
                { text: 'Email', onPress: () => sendEmail(currentApplicant.email) },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          }}
        >
          <MaterialIcons name="info" size={24} color="#6b7280" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleSwipe('right')}
        >
          <MaterialIcons name="favorite" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Swipe Indicators */}
      <Animated.View
        style={[
          styles.swipeIndicator,
          styles.rejectIndicator,
          {
            opacity: translateX.interpolate({
              inputRange: [-screenWidth / 2, 0],
              outputRange: [1, 0],
              extrapolate: 'clamp',
            }),
          },
        ]}
      >
        <Text style={styles.indicatorText}>REJECT</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.swipeIndicator,
          styles.approveIndicator,
          {
            opacity: translateX.interpolate({
              inputRange: [0, screenWidth / 2],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            }),
          },
        ]}
      >
        <Text style={styles.indicatorText}>SHORTLIST</Text>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  cardContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    height: screenHeight * 0.65,
  },
  nextCard: {
    position: 'absolute',
    top: 20,
    left: 30,
    right: 30,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  nextCardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 8,
  },
  nextCardMatch: {
    fontSize: 14,
    color: '#9ca3af',
  },
  matchScore: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 1,
  },
  matchScoreText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  applicantName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  contactInfo: {
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  contactText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  educationText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  skillText: {
    fontSize: 14,
    color: '#1d4ed8',
    fontWeight: '500',
  },
  coverLetterText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
    gap: 8,
  },
  resumeButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  appliedDate: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  infoButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  swipeIndicator: {
    position: 'absolute',
    top: '40%',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 3,
  },
  rejectIndicator: {
    left: 40,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#ef4444',
  },
  approveIndicator: {
    right: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10b981',
  },
  indicatorText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ApplicantReview;