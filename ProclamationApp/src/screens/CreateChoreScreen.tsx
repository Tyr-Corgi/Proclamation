import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { choreService } from '../services/choreService';
import { choreTemplates, getCategorizedTemplates, getCategoryDisplayName, ChoreTemplate } from '../data/choreTemplates';

export default function CreateChoreScreen() {
  const navigation = useNavigation();
  const [showTemplates, setShowTemplates] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const categorizedTemplates = getCategorizedTemplates();

  const handleCreateChore = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    const rewardAmount = parseFloat(reward);
    if (isNaN(rewardAmount) || rewardAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid reward amount');
      return;
    }

    setLoading(true);
    try {
      await choreService.createChore({
        title: title.trim(),
        description: description.trim(),
        reward: rewardAmount,
        dueDate: dueDate?.toISOString(),
      });

      Alert.alert('Success', 'Chore created successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create chore');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const handleTemplateSelect = (template: ChoreTemplate) => {
    setTitle(template.title);
    setDescription(template.description);
    setReward(template.reward.toFixed(2));
    setShowTemplates(false);
  };

  const handleCreateCustom = () => {
    setShowTemplates(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create New Chore</Text>
        <Text style={styles.headerSubtitle}>
          {showTemplates 
            ? 'Choose from common chores or create your own'
            : 'Set up a task with rewards for your kids to complete'}
        </Text>
      </View>

      {showTemplates ? (
        <View>
          <TouchableOpacity
            style={styles.customButton}
            onPress={handleCreateCustom}
          >
            <Text style={styles.customButtonText}>✏️ Create Custom Chore</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Quick Add Templates</Text>

          {Object.entries(categorizedTemplates).map(([category, templates]) => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{getCategoryDisplayName(category)}</Text>
              {templates.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={styles.templateCard}
                  onPress={() => handleTemplateSelect(template)}
                >
                  <View style={styles.templateInfo}>
                    <Text style={styles.templateTitle}>{template.title}</Text>
                    <Text style={styles.templateDescription} numberOfLines={2}>
                      {template.description}
                    </Text>
                  </View>
                  <View style={styles.templateReward}>
                    <Text style={styles.rewardAmount}>${template.reward.toFixed(2)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={styles.backToTemplatesButton}
            onPress={() => setShowTemplates(true)}
          >
            <Text style={styles.backToTemplatesText}>← Back to Templates</Text>
          </TouchableOpacity>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Clean your room"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe what needs to be done..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Reward ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            value={reward}
            onChangeText={setReward}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Due Date (Optional)</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {dueDate
                ? dueDate.toLocaleDateString()
                : 'Select due date (optional)'}
            </Text>
          </TouchableOpacity>
          {dueDate && (
            <TouchableOpacity
              style={styles.clearDateButton}
              onPress={() => setDueDate(undefined)}
            >
              <Text style={styles.clearDateText}>Clear date</Text>
            </TouchableOpacity>
          )}
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={dueDate || new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.createButton, loading && styles.buttonDisabled]}
          onPress={handleCreateChore}
          disabled={loading}
        >
          <Text style={styles.createButtonText}>
            {loading ? 'Creating...' : 'Create Chore'}
          </Text>
        </TouchableOpacity>
      </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#111827',
  },
  clearDateButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  clearDateText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  createButton: {
    backgroundColor: '#8b5cf6',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  customButton: {
    backgroundColor: '#8b5cf6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  customButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  templateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  templateInfo: {
    flex: 1,
    marginRight: 12,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  templateReward: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  rewardAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  backToTemplatesButton: {
    marginBottom: 16,
  },
  backToTemplatesText: {
    fontSize: 16,
    color: '#8b5cf6',
    fontWeight: '600',
  },
});

