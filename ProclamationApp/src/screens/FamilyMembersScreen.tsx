import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { apiService } from '../services';
import { Family, User } from '../types';
import { useAuth } from '../contexts';

interface FamilyMembersScreenProps {
  family: Family;
  onBack: () => void;
}

export const FamilyMembersScreen: React.FC<FamilyMembersScreenProps> = ({
  family: initialFamily,
  onBack,
}) => {
  const { user } = useAuth();
  const [family, setFamily] = useState<Family>(initialFamily);
  const [members, setMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isParent = user?.role === 1;

  useEffect(() => {
    loadFamilyDetails();
  }, []);

  const loadFamilyDetails = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const [updatedFamily, familyMembers] = await Promise.all([
        apiService.getMyFamily(),
        apiService.getFamilyMembers(),
      ]);
      
      setFamily(updatedFamily);
      setMembers(familyMembers);
    } catch (error: any) {
      console.error('Error loading family details:', error);
      Alert.alert('Error', 'Failed to load family details');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleShareInviteCode = async () => {
    try {
      const message = `Join our family "${family.name}" on Proclamation!\n\nInvite Code: ${family.inviteCode}\n\nDownload the app and use this code to join.`;
      
      await Share.share({
        message,
        title: 'Join My Family on Proclamation',
      });
    } catch (error: any) {
      console.error('Error sharing invite code:', error);
    }
  };

  const copyInviteCode = () => {
    Alert.alert(
      'Invite Code',
      family.inviteCode,
      [
        { text: 'Share', onPress: handleShareInviteCode },
        { text: 'OK' },
      ]
    );
  };

  const getRoleIcon = (role: number) => {
    return role === 1 ? '👨‍👩‍👧‍👦' : '🧒';
  };

  const getRoleText = (role: number) => {
    return role === 1 ? 'Parent' : 'Child';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      {/* Family Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{family.name}</Text>
        <Text style={styles.memberCount}>
          {family.memberCount} {family.memberCount === 1 ? 'Member' : 'Members'}
        </Text>
      </View>

      {/* Invite Code Card */}
      {isParent && (
        <View style={styles.inviteCard}>
          <Text style={styles.inviteTitle}>Invite Code</Text>
          <TouchableOpacity
            style={styles.codeContainer}
            onPress={copyInviteCode}
          >
            <Text style={styles.inviteCode}>{family.inviteCode}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShareInviteCode}
          >
            <Text style={styles.shareButtonText}>Share Code 📤</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Settings Card (Parents only) */}
      {isParent && (
        <View style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>Family Settings</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Default Allowance</Text>
            <Text style={styles.settingValue}>
              ${family.defaultAllowance.toFixed(2)}/week
            </Text>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Children Can Create Chores</Text>
            <Text style={styles.settingValue}>
              {family.allowChildrenToCreateChores ? 'Yes ✓' : 'No ✗'}
            </Text>
          </View>
        </View>
      )}

      {/* Members List */}
      <View style={styles.membersSection}>
        <Text style={styles.sectionTitle}>Family Members</Text>
        
        {members.map((member) => (
          <View key={member.id} style={styles.memberCard}>
            <View style={styles.memberInfo}>
              <Text style={styles.memberIcon}>
                {getRoleIcon(member.role)}
              </Text>
              <View style={styles.memberDetails}>
                <Text style={styles.memberName}>
                  {member.displayName}
                  {member.id === user?.id && ' (You)'}
                </Text>
                <Text style={styles.memberRole}>
                  {getRoleText(member.role)}
                </Text>
              </View>
            </View>
            <View style={styles.memberBalance}>
              <Text style={styles.balanceLabel}>Balance</Text>
              <Text style={styles.balanceValue}>
                ${member.balance.toFixed(2)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Refresh Button */}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={() => loadFamilyDetails(true)}
        disabled={refreshing}
      >
        {refreshing ? (
          <ActivityIndicator color="#007AFF" />
        ) : (
          <Text style={styles.refreshButtonText}>Refresh 🔄</Text>
        )}
      </TouchableOpacity>
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
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 18,
    color: '#007AFF',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  memberCount: {
    fontSize: 16,
    color: '#666',
  },
  inviteCard: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  inviteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  codeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  inviteCode: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  shareButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsCard: {
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
  settingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  settingValue: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  membersSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  memberCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  memberRole: {
    fontSize: 14,
    color: '#666',
  },
  memberBalance: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  refreshButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  refreshButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

