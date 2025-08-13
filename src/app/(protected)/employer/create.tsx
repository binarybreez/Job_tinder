import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship';

interface JobFormData {
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  employment_type: EmploymentType;
  salary_min: string;
  salary_max: string;
  currency: string;
  is_salary_public: boolean;
  city: string;
  state: string;
  country: string;
  is_remote: boolean;
  skills_required: string[];
  benefits: string[];
  expires_in_days: number;
}

const CreateJob = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    requirements: [''],
    responsibilities: [''],
    employment_type: 'full_time',
    salary_min: '',
    salary_max: '',
    currency: 'USD',
    is_salary_public: true,
    city: '',
    state: '',
    country: '',
    is_remote: false,
    skills_required: [''],
    benefits: [''],
    expires_in_days: 30,
  });

  const employmentTypes = [
    { label: 'Full Time', value: 'full_time' },
    { label: 'Part Time', value: 'part_time' },
    { label: 'Contract', value: 'contract' },
    { label: 'Internship', value: 'internship' },
  ];

  const addArrayItem = (field: keyof JobFormData, item: string = '') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), item]
    }));
  };

  const updateArrayItem = (field: keyof JobFormData, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) => i === index ? value : item)
    }));
  };

  const removeArrayItem = (field: keyof JobFormData, index: number) => {
    if ((formData[field] as string[]).length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: (prev[field] as string[]).filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Job title is required');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Job description is required');
      return false;
    }
    if (formData.requirements.every(req => !req.trim())) {
      Alert.alert('Error', 'At least one requirement is needed');
      return false;
    }
    if (formData.responsibilities.every(resp => !resp.trim())) {
      Alert.alert('Error', 'At least one responsibility is needed');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Filter out empty strings from arrays
      const cleanedData = {
        ...formData,
        requirements: formData.requirements.filter(req => req.trim()),
        responsibilities: formData.responsibilities.filter(resp => resp.trim()),
        skills_required: formData.skills_required.filter(skill => skill.trim()),
        benefits: formData.benefits.filter(benefit => benefit.trim()),
      };

      console.log('Submitting job:', cleanedData);
      // TODO: Replace with actual API call
      // await createJob(cleanedData);

      Alert.alert(
        'Success',
        'Job posted successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error creating job:', error);
      Alert.alert('Error', 'Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ArrayInput = ({ 
    label, 
    field, 
    placeholder 
  }: { 
    label: string; 
    field: keyof JobFormData; 
    placeholder: string; 
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      {(formData[field] as string[]).map((item, index) => (
        <View key={index} style={styles.arrayInputRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder={`${placeholder} ${index + 1}`}
            value={item}
            onChangeText={(text) => updateArrayItem(field, index, text)}
            multiline={field === 'responsibilities' || field === 'requirements'}
          />
          <TouchableOpacity
            onPress={() => removeArrayItem(field, index)}
            style={styles.removeButton}
          >
            <AntDesign name="close" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity
        onPress={() => addArrayItem(field)}
        style={styles.addButton}
      >
        <AntDesign name="plus" size={16} color="#3b82f6" />
        <Text style={styles.addButtonText}>Add {label.slice(0, -1)}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.title}>Post New Job</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.form}>
            {/* Basic Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Job Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Senior React Developer"
                  value={formData.title}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Job Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe the role, company culture, what you're looking for..."
                  multiline
                  numberOfLines={6}
                  value={formData.description}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Employment Type</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.employment_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, employment_type: value }))}
                    style={styles.picker}
                  >
                    {employmentTypes.map((type) => (
                      <Picker.Item key={type.value} label={type.label} value={type.value} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>

            {/* Requirements & Responsibilities */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Job Details</Text>
              
              <ArrayInput
                label="Requirements"
                field="requirements"
                placeholder="Enter requirement"
              />

              <ArrayInput
                label="Responsibilities"
                field="responsibilities"
                placeholder="Enter responsibility"
              />

              <ArrayInput
                label="Required Skills"
                field="skills_required"
                placeholder="Enter skill"
              />
            </View>

            {/* Salary & Benefits */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Compensation</Text>
              
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Min Salary</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="50000"
                    keyboardType="numeric"
                    value={formData.salary_min}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, salary_min: text }))}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Max Salary</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="80000"
                    keyboardType="numeric"
                    value={formData.salary_max}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, salary_max: text }))}
                  />
                </View>
              </View>

              <ArrayInput
                label="Benefits"
                field="benefits"
                placeholder="Enter benefit"
              />
            </View>

            {/* Location */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location</Text>
              
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>City</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="New York"
                    value={formData.city}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>State</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="NY"
                    value={formData.state}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, state: text }))}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setFormData(prev => ({ ...prev, is_remote: !prev.is_remote }))}
              >
                <View style={[styles.checkbox, formData.is_remote && styles.checkboxChecked]}>
                  {formData.is_remote && <MaterialIcons name="check" size={16} color="#fff" />}
                </View>
                <Text style={styles.checkboxLabel}>Remote work allowed</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Posting Job...' : 'Post Job'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  picker: {
    height: 50,
  },
  arrayInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  removeButton: {
    marginLeft: 8,
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbeafe',
    marginTop: 8,
  },
  addButtonText: {
    marginLeft: 8,
    color: '#3b82f6',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#374151',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateJob;