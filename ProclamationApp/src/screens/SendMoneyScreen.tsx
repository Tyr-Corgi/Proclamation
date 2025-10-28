import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { apiService } from '../services';
import { FamilyMemberForTransaction, Transaction } from '../types';

interface SendMoneyScreenProps {
  onBack: () => void;
  onMoneySent: (transaction: Transaction) => void;
}

export const SendMoneyScreen: React.FC<SendMoneyScreenProps> = ({
  onBack,
  onMoneySent,
}) => {
  const [members, setMembers] = useState<FamilyMemberForTransaction[]>([]);
  const [selectedMember, setSelectedMember] = useState<FamilyMemberForTransaction | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const familyMembers = await apiService.getFamilyMembersForTransaction();
      setMembers(familyMembers);
    } catch (error: any) {
      console.error('Error loading family members:', error);
      Alert.alert('Error', 'Failed to load family members');
      onBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMoney = async () => {
    if (!selectedMember) {
      Alert.alert('Select Recipient', 'Please select a family member');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0');
      return;
    }

    setIsSending(true);
    try {
      const transaction = await apiService.sendMoney({
        toUserId: selectedMember.id,
        amount: amountNum,
        description: description.trim() || undefined,
      });

      Alert.alert(
        'Money Sent! 💰',
        `$${amountNum.toFixed(2)} sent to ${selectedMember.displayName}`,
        [
          {
            text: 'OK',
            onPress: () => onMoneySent(transaction),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error sending money:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to send money');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34C759" />
      </View>
    );
  }

  if (members.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.emptyTitle}>No Family Members</Text>
        <Text style={styles.emptyText}>
          Add family members to send them allowances
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Send Money 💰</Text>
      <Text style={styles.subtitle}>Send allowance to your family</Text>

      {/* Select Recipient */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Recipient</Text>
        {members.map((member) => (
          <TouchableOpacity
            key={member.id}
            style={[
              styles.memberCard,
              selectedMember?.id === member.id && styles.memberCardSelected,
            ]}
            onPress={() => setSelectedMember(member)}
          >
            <View style={styles.memberInfo}>
              <Text style={styles.memberIcon}>
                {member.role === 1 ? '👨‍👩‍👧‍👦' : '🧒'}
              </Text>
              <View style={styles.memberDetails}>
                <Text style={styles.memberName}>{member.displayName}</Text>
                <Text style={styles.memberBalance}>
                  Current balance: ${member.balance.toFixed(2)}
                </Text>
              </View>
            </View>
            {selectedMember?.id === member.id && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Amount Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Amount</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            editable={!isSending}
          />
        </View>

        {/* Quick Amount Buttons */}
        <View style={styles.quickAmounts}>
          {[5, 10, 20, 50].map((quickAmount) => (
            <TouchableOpacity
              key={quickAmount}
              style={styles.quickAmountButton}
              onPress={() => setAmount(quickAmount.toString())}
              disabled={isSending}
            >
              <Text style={styles.quickAmountText}>${quickAmount}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Description Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description (Optional)</Text>
        <TextInput
          style={styles.descriptionInput}
          placeholder="Weekly allowance, chore reward, etc."
          value={description}
          onChangeText={setDescription}
          maxLength={200}
          editable={!isSending}
        />
      </View>

      {/* Send Button */}
      <TouchableOpacity
        style={[
          styles.sendButton,
          (!selectedMember || !amount || isSending) && styles.sendButtonDisabled,
        ]}
        onPress={handleSendMoney}
        disabled={!selectedMember || !amount || isSending}
      >
        {isSending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.sendButtonText}>
            Send ${parseFloat(amount || '0').toFixed(2)}
          </Text>
        )}
      </TouchableOpacity>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>ℹ️ How it works</Text>
        <Text style={styles.infoText}>
          • Select a family member{'\n'}
          • Enter the amount to send{'\n'}
          • Add an optional note{'\n'}
          • Money is added instantly!
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 24,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 18,
    color: '#34C759',
    fontWeight: '600',
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  memberCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  memberCardSelected: {
    borderColor: '#34C759',
    backgroundColor: '#E8F5E9',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  memberBalance: {
    fontSize: 14,
    color: '#666',
  },
  checkmark: {
    fontSize: 24,
    color: '#34C759',
    fontWeight: 'bold',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#34C759',
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#34C759',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  quickAmountButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#34C759',
  },
  quickAmountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
    textAlign: 'center',
  },
  descriptionInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sendButton: {
    backgroundColor: '#34C759',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

