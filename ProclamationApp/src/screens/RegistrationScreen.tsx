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
} from 'react-native';
import { apiService } from '../services';
import { UserRole, AuthResponse } from '../types';

interface RegistrationScreenProps {
  phoneNumber: string;
  onRegistered: (response: AuthResponse) => void;
}

export const RegistrationScreen: React.FC<RegistrationScreenProps> = ({
  phoneNumber,
  onRegistered,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!displayName.trim()) {
      Alert.alert('Missing Information', 'Please enter your name');
      return;
    }

    if (!selectedRole) {
      Alert.alert('Missing Information', 'Please select your role');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.register(
        phoneNumber,
        displayName.trim(),
        selectedRole
      );
      onRegistered(response);
    } catch (error: any) {
      console.error('Error registering:', error);
      Alert.alert(
        'Registration Failed',
        error.response?.data?.message || 'Failed to register user'
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
      <View style={styles.content}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>
          Tell us a bit about yourself
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Your Name"
          value={displayName}
          onChangeText={setDisplayName}
          editable={!isLoading}
          autoFocus
        />

        <Text style={styles.roleLabel}>I am a:</Text>

        <TouchableOpacity
          style={[
            styles.roleButton,
            selectedRole === UserRole.Parent && styles.roleButtonSelected,
          ]}
          onPress={() => setSelectedRole(UserRole.Parent)}
          disabled={isLoading}
        >
          <Text
            style={[
              styles.roleButtonText,
              selectedRole === UserRole.Parent && styles.roleButtonTextSelected,
            ]}
          >
            👨‍👩‍👧‍👦 Parent
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleButton,
            selectedRole === UserRole.Child && styles.roleButtonSelected,
          ]}
          onPress={() => setSelectedRole(UserRole.Child)}
          disabled={isLoading}
        >
          <Text
            style={[
              styles.roleButtonText,
              selectedRole === UserRole.Child && styles.roleButtonTextSelected,
            ]}
          >
            🧒 Child
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Complete Registration</Text>
          )}
        </TouchableOpacity>
      </View>
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
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    marginBottom: 24,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  roleButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  roleButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  roleButtonText: {
    fontSize: 18,
    color: '#666',
  },
  roleButtonTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
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
});

