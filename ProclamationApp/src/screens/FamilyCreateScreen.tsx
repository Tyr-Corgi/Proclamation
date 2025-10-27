import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { apiService } from '../services';
import { Family } from '../types';

interface FamilyCreateScreenProps {
  onFamilyCreated: (family: Family) => void;
  onBack: () => void;
}

export const FamilyCreateScreen: React.FC<FamilyCreateScreenProps> = ({
  onFamilyCreated,
  onBack,
}) => {
  const [familyName, setFamilyName] = useState('');
  const [defaultAllowance, setDefaultAllowance] = useState('0');
  const [allowChildrenToCreateChores, setAllowChildrenToCreateChores] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateFamily = async () => {
    if (!familyName.trim()) {
      Alert.alert('Missing Information', 'Please enter a family name');
      return;
    }

    setIsLoading(true);
    try {
      const family = await apiService.createFamily({
        name: familyName.trim(),
        defaultAllowance: parseFloat(defaultAllowance) || 0,
        allowChildrenToCreateChores,
      });

      Alert.alert(
        'Family Created! 🎉',
        `Your family "${family.name}" has been created!\n\nInvite Code: ${family.inviteCode}\n\nShare this code with family members to join.`,
        [
          {
            text: 'OK',
            onPress: () => onFamilyCreated(family),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating family:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to create family'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Create Your Family</Text>
        <Text style={styles.subtitle}>
          Set up your family to start managing allowances and chores
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Family Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="The Smiths"
            value={familyName}
            onChangeText={setFamilyName}
            editable={!isLoading}
            autoFocus
          />

          <Text style={styles.label}>Default Weekly Allowance</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={[styles.input, styles.inputWithPrefix]}
              placeholder="0.00"
              value={defaultAllowance}
              onChangeText={setDefaultAllowance}
              keyboardType="decimal-pad"
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setAllowChildrenToCreateChores(!allowChildrenToCreateChores)}
            disabled={isLoading}
          >
            <View style={[
              styles.checkbox,
              allowChildrenToCreateChores && styles.checkboxChecked
            ]}>
              {allowChildrenToCreateChores && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
            <Text style={styles.checkboxLabel}>
              Allow children to create chores
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleCreateFamily}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Family</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>ℹ️ What happens next?</Text>
          <Text style={styles.infoText}>
            • You'll get a unique invite code{'\n'}
            • Share it with family members{'\n'}
            • They can join using the code{'\n'}
            • Manage everything together!
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 18,
    color: '#007AFF',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  currencySymbol: {
    position: 'absolute',
    left: 16,
    fontSize: 16,
    color: '#666',
    zIndex: 1,
  },
  inputWithPrefix: {
    paddingLeft: 32,
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
});

