import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView, PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

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
}

interface JobSwipeCardProps {
  job: Job;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onBookmark: () => void;
  isTop: boolean;
  isSaved: boolean;
}

const { width } = Dimensions.get("window");
const SWIPE_THRESHOLD = 120;

export default function SeekerJobs() {
  const jobsData: Job[] = [
    {
      id: "1",
      title: "Frontend Developer",
      company: "Tech Corp",
      location: "Remote",
      salary: "$60k - $80k",
      matchPercentage: 85,
      type: "Full-time",
      description:
        "We are looking for a skilled frontend developer proficient in React Native and modern JavaScript frameworks.",
      tags: ["React", "Native", "JavaScript", "TypeScript"],
      postedTime: "2 days ago",
    },
    {
      id: "2",
      title: "Backend Engineer",
      company: "Data Systems",
      location: "New York, USA",
      salary: "$90k - $110k",
      matchPercentage: 72,
      type: "Full-time",
      description:
        "Join our backend team to build scalable microservices with Node.js and PostgreSQL. Experience with cloud platforms required.",
      tags: ["Node.js", "PostgreSQL", "AWS", "Docker"],
      postedTime: "1 week ago",
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
        "Build cutting-edge mobile applications using React Native and Flutter. Work with a dynamic team on exciting projects.",
      tags: ["React Native", "Flutter", "iOS", "Android"],
      postedTime: "3 days ago",
    },
    {
      id: "4",
      title: "DevOps Engineer",
      company: "Cloud Solutions",
      location: "Austin, TX",
      salary: "$95k - $120k",
      matchPercentage: 68,
      type: "Full-time",
      description:
        "Manage CI/CD pipelines and cloud infrastructure. Experience with Kubernetes and terraform preferred.",
      tags: ["DevOps", "Kubernetes", "Terraform", "CI/CD"],
      postedTime: "5 days ago",
    },
  ];

  const [jobs, setJobs] = useState<Job[]>(jobsData);
  const [swipedJobs, setSwipedJobs] = useState<{ job: Job; action: string }[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  const handleSwipeLeft = (job: Job) => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    // Delay the state update to allow animation to complete
    setTimeout(() => {
      setJobs((prev) => prev.slice(1));
      setSwipedJobs((prev) => [...prev, { job, action: "rejected" }]);
      setIsAnimating(false);
    }, 300); // Match this with animation duration
  };

  const handleSwipeRight = (job: Job) => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    // Delay the state update to allow animation to complete
    setTimeout(() => {
      setJobs((prev) => prev.slice(1));
      setSwipedJobs((prev) => [...prev, { job, action: "liked" }]);
      Alert.alert("Job Liked!", `You liked ${job.title} at ${job.company}`);
      setIsAnimating(false);
    }, 300); // Match this with animation duration
  };

  const handleBookmark = (job: Job) => {
    const isCurrentlySaved = savedJobs.has(job.id);
    
    if (isCurrentlySaved) {
      // Remove from saved jobs
      setSavedJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(job.id);
        return newSet;
      });
      Alert.alert("Removed!", `${job.title} has been removed from your bookmarks.`);
    } else {
      // Add to saved jobs
      setSavedJobs(prev => new Set(prev).add(job.id));
      Alert.alert("Bookmarked!", `${job.title} has been saved to your bookmarks.`);
    }
  };

  const resetJobs = () => {
    setJobs(jobsData);
    setSwipedJobs([]);
    setIsAnimating(false);
    setSavedJobs(new Set()); // Reset saved jobs too
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Job Matches</Text>
        {swipedJobs.length > 0 && (
          <TouchableOpacity style={styles.resetButton} onPress={resetJobs}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.cardContainer}>
        {jobs.length > 0 ? (
          <>
            {/* Show next card behind current card for better UX */}
            {jobs.length > 1 && (
              <View style={[styles.card, styles.backgroundCard]}>
                <JobCardContent job={jobs[1]} />
              </View>
            )}
            <JobSwipeCard
              key={jobs[0].id} // Add key to force re-render
              job={jobs[0]}
              isTop={true}
              isSaved={savedJobs.has(jobs[0].id)}
              onSwipeLeft={() => handleSwipeLeft(jobs[0])}
              onSwipeRight={() => handleSwipeRight(jobs[0])}
              onBookmark={() => handleBookmark(jobs[0])}
            />
          </>
        ) : (
          <View style={styles.noJobsContainer}>
            <Text style={styles.noJobs}>🎉 No more jobs to review!</Text>
            <TouchableOpacity style={styles.resetButton} onPress={resetJobs}>
              <Text style={styles.resetButtonText}>Start Over</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {swipedJobs.length > 0 && (
        <View style={styles.stats}>
          <Text style={styles.statsText}>
            Liked: {swipedJobs.filter(item => item.action === "liked").length} | 
            Rejected: {swipedJobs.filter(item => item.action === "rejected").length} |
            Saved: {savedJobs.size}
          </Text>
        </View>
      )}
    </GestureHandlerRootView>
  );
}

function JobSwipeCard({ job, onSwipeLeft, onSwipeRight, onBookmark, isTop, isSaved }: JobSwipeCardProps) {
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      scale.value = withSpring(0.95);
    },
    onActive: (event) => {
      translateX.value = event.translationX;
      rotate.value = interpolate(
        event.translationX,
        [-width, 0, width],
        [-15, 0, 15],
        Extrapolate.CLAMP
      );
    },
    onEnd: (event) => {
      scale.value = withSpring(1);
      
      if (event.translationX > SWIPE_THRESHOLD) {
        // Use withTiming for more controlled animation
        translateX.value = withTiming(width * 1.5, 
          { duration: 300 }, 
          (finished) => {
            if (finished) {
              runOnJS(onSwipeRight)();
              // Reset values for next card
              translateX.value = 0;
              rotate.value = 0;
            }
          }
        );
        rotate.value = withTiming(15, { duration: 300 });
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-width * 1.5, 
          { duration: 300 }, 
          (finished) => {
            if (finished) {
              runOnJS(onSwipeLeft)();
              // Reset values for next card
              translateX.value = 0;
              rotate.value = 0;
            }
          }
        );
        rotate.value = withTiming(-15, { duration: 300 });
      } else {
        translateX.value = withSpring(0);
        rotate.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD, width],
      [1, 0.8, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { rotate: `${rotate.value}deg` },
        { scale: scale.value },
      ],
      opacity,
    };
  });

  const likeOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity,
    };
  });

  const rejectOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolate.CLAMP
    );

    return {
      opacity,
    };
  });

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <JobCardContent job={job} />
        
        {/* Swipe overlays */}
        <Animated.View style={[styles.likeOverlay, likeOverlayStyle]}>
          <View style={[styles.overlayContent, styles.likeOverlayContent]}>
            <Text style={[styles.overlayText, styles.likeOverlayText]}>
              LIKE
            </Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.rejectOverlay, rejectOverlayStyle]}>
          <View style={[styles.overlayContent, styles.rejectOverlayContent]}>
            <Text style={[styles.overlayText, styles.rejectOverlayText]}>
              PASS
            </Text>
          </View>
        </Animated.View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.rejectButton]}
            onPress={onSwipeLeft}
          >
            <Ionicons name="close" size={28} color="#ef4444" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.bookmarkButton, isSaved && styles.bookmarkButtonActive]}
            onPress={onBookmark}
          >
            <Ionicons 
              name={isSaved ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color={isSaved ? "#3b82f6" : "#374151"} 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.likeButton]}
            onPress={onSwipeRight}
          >
            <Ionicons name="heart" size={28} color="#22c55e" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
}

function JobCardContent({ job }: { job: Job }) {
  return (
    <>
      <View style={styles.cardHeader}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>{job.company.charAt(0)}</Text>
        </View>
        <View style={styles.companyInfo}>
          <Text style={styles.company}>{job.company}</Text>
          <Text style={styles.type}>{job.type}</Text>
        </View>
        <View style={styles.matchBadge}>
          <Text style={styles.matchText}>{job.matchPercentage}% match</Text>
        </View>
      </View>

      <Text style={styles.title}>{job.title}</Text>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{job.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{job.salary}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{job.postedTime}</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={3}>
        {job.description}
      </Text>

      <View style={styles.tags}>
        {job.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
  },
  resetButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  resetButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  cardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  noJobsContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  noJobs: {
    fontSize: 18,
    color: "#6b7280",
    marginBottom: 20,
    textAlign: "center",
  },
  stats: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: "center",
  },
  statsText: {
    fontSize: 14,
    color: "#6b7280",
  },
  card: {
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    position: "absolute",
  },
  backgroundCard: {
    transform: [{ scale: 0.95 }],
    opacity: 0.5,
    zIndex: 0,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  likeOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  rejectOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  overlayContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "transparent",
  },
  likeOverlayContent: {
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
  },
  rejectOverlayContent: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  },
  overlayText: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 2,
  },
  likeOverlayText: {
    color: '#22c55e',
  },
  rejectOverlayText: {
    color: '#ef4444',
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  logoText: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#1e3a8a",
  },
  companyInfo: {
    flex: 1,
  },
  company: {
    fontWeight: "600",
    fontSize: 16,
    color: "#1f2937",
  },
  type: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  matchBadge: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#22c55e",
  },
  matchText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#22c55e",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    color: "#1f2937",
  },
  details: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#4b5563",
  },
  description: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
    marginBottom: 16,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  tag: {
    backgroundColor: "#f1f5f9",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  tagText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  button: {
    padding: 16,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rejectButton: {
    backgroundColor: "#fee2e2",
  },
  bookmarkButton: {
    backgroundColor: "#f3f4f6",
  },
  bookmarkButtonActive: {
    backgroundColor: "#dbeafe",
  },
  likeButton: {
    backgroundColor: "#dcfce7",
  },
});