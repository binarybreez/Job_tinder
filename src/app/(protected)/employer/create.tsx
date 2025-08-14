import { useAuth } from "@clerk/clerk-expo";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface JobFormData {
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  employment_type: "full_time" | "part_time" | "contract" | "internship";
  salary: {
    min: number;
    max: number;
    currency: string;
    is_public: boolean;
  };
  location: {
    city: string;
    state: string;
    country: string;
    remote: boolean;
  };
  skills_required: string[];
  benefits: string[];
  expires_at: Date;
}

const CreateJob = () => {
  const router = useRouter();
  const { userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEmploymentModal, setShowEmploymentModal] = useState(false);
  
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    description: "",
    requirements: [],
    responsibilities: [],
    employment_type: "full_time",
    salary: {
      min: 0,
      max: 0,
      currency: "USD",
      is_public: true,
    },
    location: {
      city: "",
      state: "",
      country: "USA",
      remote: false,
    },
    skills_required: [],
    benefits: [],
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  });

  const [tempInputs, setTempInputs] = useState({
    requirement: "",
    responsibility: "",
    skill: "",
    benefit: "",
  });

  const employmentTypes = [
    { label: "Full Time", value: "full_time" },
    { label: "Part Time", value: "part_time" },
    { label: "Contract", value: "contract" },
    { label: "Internship", value: "internship" },
  ];

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      Alert.alert("Error", "Job title is required");
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert("Error", "Job description is required");
      return;
    }
    if (!formData.location.city.trim()) {
      Alert.alert("Error", "City is required");
      return;
    }

    setLoading(true);
    try {
      const jobData = {
        ...formData,
        employer_id: userId,
        is_active: true,
        posted_at: new Date(),
      };

      // Mock success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        "Success",
        "Job posted successfully!",
        [
          {
            text: "OK",
            onPress: () => router.push("/(protected)/employer/EmployerJobs"),
          },
        ]
      );
    } catch (error) {
      console.error("Error creating job:", error);
      Alert.alert("Error", "Failed to create job posting");
    } finally {
      setLoading(false);
    }
  };

  const addToList = (field: 'requirements' | 'responsibilities' | 'skills_required' | 'benefits', inputKey: string) => {
    const value = tempInputs[inputKey as keyof typeof tempInputs].trim();
    if (value) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value],
      }));
      setTempInputs(prev => ({ ...prev, [inputKey]: "" }));
    }
  };

  const removeFromList = (field: 'requirements' | 'responsibilities' | 'skills_required' | 'benefits', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const ListInput = ({ 
    title, 
    field, 
    inputKey, 
    placeholder 
  }: {
    title: string;
    field: 'requirements' | 'responsibilities' | 'skills_required' | 'benefits';
    inputKey: string;
    placeholder: string;
  }) => (
    <View style={styles.listInputContainer}>
      <Text style={styles.label}>{title}</Text>
      <View style={styles.addItemContainer}>
        <TextInput
          style={styles.addItemInput}
          placeholder={placeholder}
          value={tempInputs[inputKey as keyof typeof tempInputs]}
          onChangeText={(text) => setTempInputs(prev => ({ ...prev, [inputKey]: text }))}
          multiline
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => addToList(field, inputKey)}
        >
          <AntDesign name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.listContainer}>
        {formData[field].map((item, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.listItemText}>{item}</Text>
            <TouchableOpacity
              onPress={() => removeFromList(field, index)}
              style={styles.removeButton}
            >
              <AntDesign name="close" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <AntDesign name="arrowleft" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Job Posting</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Job Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Senior Software Engineer"
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Job Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the role, company culture, and what you're looking for..."
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={6}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Employment Type</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowEmploymentModal(true)}
            >
              <Text style={styles.dropdownText}>
                {employmentTypes.find(type => type.value === formData.employment_type)?.label}
              </Text>
              <AntDesign name="down" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                placeholder="New York"
                value={formData.location.city}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, city: text }
                }))}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>State</Text>
              <TextInput
                style={styles.input}
                placeholder="NY"
                value={formData.location.state}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, state: text }
                }))}
              />
            </View>
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.label}>Remote Work Available</Text>
            <Switch
              value={formData.location.remote}
              onValueChange={(value) => setFormData(prev => ({
                ...prev,
                location: { ...prev.location, remote: value }
              }))}
              trackColor={{ false: "#D1D5DB", true: "#3B82F6" }}
              thumbColor={formData.location.remote ? "#fff" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Salary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Salary Range</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Minimum ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="50000"
                value={formData.salary.min.toString()}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev,
                  salary: { ...prev.salary, min: parseInt(text) || 0 }
                }))}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Maximum ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="80000"
                value={formData.salary.max.toString()}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev,
                  salary: { ...prev.salary, max: parseInt(text) || 0 }
                }))}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.label}>Make Salary Public</Text>
            <Switch
              value={formData.salary.is_public}
              onValueChange={(value) => setFormData(prev => ({
                ...prev,
                salary: { ...prev.salary, is_public: value }
              }))}
              trackColor={{ false: "#D1D5DB", true: "#3B82F6" }}
              thumbColor={formData.salary.is_public ? "#fff" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Expiration Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Posting Expiration</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <MaterialIcons name="date-range" size={24} color="#3B82F6" />
            <Text style={styles.dateButtonText}>
              {formData.expires_at.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lists */}
        <ListInput
          title="Requirements"
          field="requirements"
          inputKey="requirement"
          placeholder="Add a job requirement..."
        />

        <ListInput
          title="Responsibilities"
          field="responsibilities"
          inputKey="responsibility"
          placeholder="Add a responsibility..."
        />

        <ListInput
          title="Required Skills"
          field="skills_required"
          inputKey="skill"
          placeholder="Add a required skill..."
        />

        <ListInput
          title="Benefits"
          field="benefits"
          inputKey="benefit"
          placeholder="Add a benefit..."
        />

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <AntDesign name="loading1" size={20} color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Post Job</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Employment Type Modal */}
      <Modal
        visible={showEmploymentModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEmploymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Employment Type</Text>
            <FlatList
              data={employmentTypes}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, employment_type: item.value as any }));
                    setShowEmploymentModal(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{item.label}</Text>
                  {formData.employment_type === item.value && (
                    <AntDesign name="check" size={20} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.expires_at}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setFormData(prev => ({ ...prev, expires_at: selectedDate }));
            }
          }}
        />
      )}
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  dropdownText: {
    fontSize: 16,
    color: "#1F2937",
  },
  row: {
    flexDirection: "row",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  dateButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#1F2937",
  },
  listInputContainer: {
    backgroundColor: "#fff",
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  addItemContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  addItemInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    marginRight: 8,
  },
  addButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    gap: 8,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  listItemText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
  },
  removeButton: {
    padding: 4,
  },
  submitButton: {
    backgroundColor: "#3B82F6",
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    minWidth: 280,
    maxHeight: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
    textAlign: "center",
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#374151",
  },
});

export default CreateJob;
