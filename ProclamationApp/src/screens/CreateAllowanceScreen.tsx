import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { allowanceService } from '../services/allowanceService';
import { AllowanceFrequency } from '../types/allowance';
import { apiService } from '../services';
import { FamilyMemberForTransaction } from '../types';

export default function CreateAllowanceScreen() {
  const navigation = useNavigation();
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberForTransaction[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<AllowanceFrequency>(AllowanceFrequency.Weekly);
  const [dayOfWeek, setDayOfWeek] = useState<number>(5); // Default to Friday
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFamilyMembers();
  }, []);

  const loadFamilyMembers = async () => {
    try {
      const members = await apiService.getFamilyMembersForTransaction();
      setFamilyMembers(members);
      if (members.length > 0) {
        setSelectedUserId(members[0].id);
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load family members');
    }
  };

  const handleCreateAllowance = async () => {
    if (!selectedUserId) {
      Alert.alert('Error', 'Please select a family member');
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      await allowanceService.createAllowance({
        userId: selectedUserId,
        amount: amountValue,
        frequency,
        dayOfWeek: frequency !== AllowanceFrequency.Monthly ? dayOfWeek : undefined,
        dayOfMonth: frequency === AllowanceFrequency.Monthly ? dayOfMonth : undefined,
      });

      Alert.alert('Success', 'Allowance created successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create allowance');
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Allowance</Text>
        <Text style={styles.headerSubtitle}>
          Set up recurring allowances for your family members
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Family Member</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.memberRow}>
              {familyMembers.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  style={[
                    styles.memberCard,
                    selectedUserId === member.id && styles.memberCardSelected,
                  ]}
                  onPress={() => setSelectedUserId(member.id)}
                >
                  <Text style={[
                    styles.memberName,
                    selectedUserId === member.id && styles.memberNameSelected,
                  ]}>
                    {member.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Frequency</Text>
          <View style={styles.frequencyRow}>
            <TouchableOpacity
              style={[
                styles.frequencyButton,
                frequency === AllowanceFrequency.Weekly && styles.frequencyButtonActive,
              ]}
              onPress={() => setFrequency(AllowanceFrequency.Weekly)}
            >
              <Text style={[
                styles.frequencyButtonText,
                frequency === AllowanceFrequency.Weekly && styles.frequencyButtonTextActive,
              ]}>
                Weekly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.frequencyButton,
                frequency === AllowanceFrequency.BiWeekly && styles.frequencyButtonActive,
              ]}
              onPress={() => setFrequency(AllowanceFrequency.BiWeekly)}
            >
              <Text style={[
                styles.frequencyButtonText,
                frequency === AllowanceFrequency.BiWeekly && styles.frequencyButtonTextActive,
              ]}>
                Bi-Weekly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.frequencyButton,
                frequency === AllowanceFrequency.Monthly && styles.frequencyButtonActive,
              ]}
              onPress={() => setFrequency(AllowanceFrequency.Monthly)}
            >
              <Text style={[
                styles.frequencyButtonText,
                frequency === AllowanceFrequency.Monthly && styles.frequencyButtonTextActive,
              ]}>
                Monthly
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {frequency !== AllowanceFrequency.Monthly && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Day of Week</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.dayRow}>
                {daysOfWeek.map((day) => (
                  <TouchableOpacity
                    key={day.value}
                    style={[
                      styles.dayButton,
                      dayOfWeek === day.value && styles.dayButtonActive,
                    ]}
                    onPress={() => setDayOfWeek(day.value)}
                  >
                    <Text style={[
                      styles.dayButtonText,
                      dayOfWeek === day.value && styles.dayButtonTextActive,
                    ]}>
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {frequency === AllowanceFrequency.Monthly && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Day of Month</Text>
            <TextInput
              style={styles.input}
              placeholder="1-31"
              value={dayOfMonth.toString()}
              onChangeText={(text) => {
                const num = parseInt(text) || 1;
                setDayOfMonth(Math.min(Math.max(num, 1), 31));
              }}
              keyboardType="number-pad"
            />
          </View>
        )}

        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>Preview</Text>
          <Text style={styles.previewText}>
            {selectedUserId && familyMembers.find(m => m.id === selectedUserId)?.name} will receive{' '}
            <Text style={styles.previewAmount}>${amount || '0.00'}</Text>
            {frequency === AllowanceFrequency.Weekly && ` every ${daysOfWeek.find(d => d.value === dayOfWeek)?.label}`}
            {frequency === AllowanceFrequency.BiWeekly && ` every other ${daysOfWeek.find(d => d.value === dayOfWeek)?.label}`}
            {frequency === AllowanceFrequency.Monthly && ` on the ${dayOfMonth}${dayOfMonth === 1 ? 'st' : dayOfMonth === 2 ? 'nd' : dayOfMonth === 3 ? 'rd' : 'th'} of each month`}
          </Text>
        </View>
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
          onPress={handleCreateAllowance}
          disabled={loading}
        >
          <Text style={styles.createButtonText}>
            {loading ? 'Creating...' : 'Create Allowance'}
          </Text>
        </TouchableOpacity>
      </View>
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
  memberRow: {
    flexDirection: 'row',
    gap: 12,
  },
  memberCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  memberCardSelected: {
    borderColor: '#8b5cf6',
    backgroundColor: '#f5f3ff',
  },
  memberName: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  memberNameSelected: {
    color: '#8b5cf6',
    fontWeight: '600',
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  frequencyButtonActive: {
    borderColor: '#8b5cf6',
    backgroundColor: '#f5f3ff',
  },
  frequencyButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  frequencyButtonTextActive: {
    color: '#8b5cf6',
    fontWeight: '600',
  },
  dayRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  dayButtonActive: {
    borderColor: '#8b5cf6',
    backgroundColor: '#f5f3ff',
  },
  dayButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  dayButtonTextActive: {
    color: '#8b5cf6',
    fontWeight: '600',
  },
  previewCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  previewAmount: {
    fontWeight: 'bold',
    color: '#10b981',
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
});


