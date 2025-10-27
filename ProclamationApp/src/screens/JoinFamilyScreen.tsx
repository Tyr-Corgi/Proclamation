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

interface JoinFamilyScreenProps {
  onFamilyJoined: (family: Family) => void;
  onBack: () => void;
}

export const JoinFamilyScreen: React.FC<JoinFamilyScreenProps> = ({
  onFamilyJoined,
  onBack,
}) => {
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinFamily = async () => {
    const code = inviteCode.trim().toUpperCase();
    
    if (!code) {
      Alert.alert('Missing Code', 'Please enter an invite code');
      return;
    }

    if (code.length !== 6) {
      Alert.alert('Invalid Code', 'Invite codes are 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const family = await apiService.joinFamily({ inviteCode: code });

      Alert.alert(
        'Welcome to the Family! 🎉',
        `You've successfully joined "${family.name}"`,
        [
          {
            text: 'OK',
            onPress: () => onFamilyJoined(family),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error joining family:', error);
      const message = error.response?.data?.message || 'Failed to join family';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatInviteCode = (text: string) => {
    // Only allow uppercase letters and numbers
    const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
    // Limit to 6 characters
    const limited = cleaned.substring(0, 6);
    // Add hyphen after 3rd character for readability
    if (limited.length > 3) {
      return `${limited.substring(0, 3)}-${limited.substring(3)}`;
    }
    return limited;
  };

  const handleCodeChange = (text: string) => {
    const formatted = formatInviteCode(text);
    setInviteCode(formatted);
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

        <Text style={styles.title}>Join a Family</Text>
        <Text style={styles.subtitle}>
          Enter the invite code shared by a family member
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Invite Code</Text>
          <TextInput
            style={styles.codeInput}
            placeholder="ABC-123"
            value={inviteCode}
            onChangeText={handleCodeChange}
            editable={!isLoading}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={7} // 6 characters + 1 hyphen
            autoFocus
          />

          <Text style={styles.hint}>
            Codes are 6 characters (letters and numbers)
          </Text>

          <TouchableOpacity
            style={[
              styles.button,
              (isLoading || inviteCode.replace('-', '').length !== 6) && styles.buttonDisabled
            ]}
            onPress={handleJoinFamily}
            disabled={isLoading || inviteCode.replace('-', '').length !== 6}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Join Family</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>ℹ️ Where to find invite codes</Text>
          <Text style={styles.infoText}>
            • Ask a parent in your family{'\n'}
            • They can find it in Family Settings{'\n'}
            • Codes are case-insensitive{'\n'}
            • Each family has a unique code
          </Text>
        </View>

        <View style={styles.exampleBox}>
          <Text style={styles.exampleTitle}>Example codes:</Text>
          <Text style={styles.exampleCode}>SMI-TH1</Text>
          <Text style={styles.exampleCode}>FAM-XY9</Text>
          <Text style={styles.exampleCode}>HOM-E20</Text>
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
  },
  codeInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
    padding: 20,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 2,
  },
  hint: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
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
    marginBottom: 16,
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
  exampleBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  exampleTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  exampleCode: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginVertical: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

