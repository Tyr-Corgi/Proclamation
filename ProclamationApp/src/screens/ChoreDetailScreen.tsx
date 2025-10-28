import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { choreService } from '../services/choreService';
import { Chore, ChoreStatus } from '../types/chore';
import { useAuth } from '../contexts/AuthContext';

export default function ChoreDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { choreId } = route.params as { choreId: number };

  const [chore, setChore] = useState<Chore | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');

  useEffect(() => {
    fetchChore();
  }, [choreId]);

  const fetchChore = async () => {
    try {
      const data = await choreService.getChore(choreId);
      setChore(data);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load chore');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleClaimChore = async () => {
    if (!chore) return;

    Alert.alert(
      'Claim Chore',
      `Are you sure you want to claim "${chore.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Claim',
          onPress: async () => {
            setActionLoading(true);
            try {
              await choreService.claimChore(chore.id);
              Alert.alert('Success', 'Chore claimed! Get to work!');
              fetchChore();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to claim chore');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCompleteChore = async () => {
    if (!chore) return;

    setActionLoading(true);
    try {
      await choreService.completeChore(chore.id, completionNotes);
      Alert.alert('Success', 'Chore submitted for approval!');
      fetchChore();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to complete chore');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveChore = async () => {
    if (!chore) return;

    Alert.alert(
      'Approve Chore',
      `Approve "${chore.title}" and pay ${chore.assignedToName} $${chore.reward.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            setActionLoading(true);
            try {
              await choreService.approveChore(chore.id);
              Alert.alert('Success', `Payment of $${chore.reward.toFixed(2)} sent!`);
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to approve chore');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRejectChore = async () => {
    if (!chore) return;

    Alert.alert(
      'Reject Chore',
      `Are you sure you want to reject "${chore.title}"? The status will return to "In Progress".`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await choreService.rejectChore(chore.id);
              Alert.alert('Rejected', 'Chore needs more work');
              fetchChore();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to reject chore');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteChore = async () => {
    if (!chore) return;

    Alert.alert(
      'Delete Chore',
      `Are you sure you want to delete "${chore.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await choreService.deleteChore(chore.id);
              Alert.alert('Deleted', 'Chore deleted successfully');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete chore');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: ChoreStatus) => {
    switch (status) {
      case ChoreStatus.Available:
        return '#10b981';
      case ChoreStatus.InProgress:
        return '#f59e0b';
      case ChoreStatus.PendingApproval:
        return '#3b82f6';
      case ChoreStatus.Completed:
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  if (!chore) {
    return null;
  }

  const isMyChore = chore.assignedToId === user?.id;
  const canClaim = chore.status === ChoreStatus.Available && !user?.isParent;
  const canComplete = isMyChore && chore.status === ChoreStatus.InProgress;
  const canApprove = user?.isParent && chore.status === ChoreStatus.PendingApproval;
  const canDelete = user?.isParent;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{chore.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(chore.status) }]}>
          <Text style={styles.statusText}>{chore.statusName}</Text>
        </View>
      </View>

      <View style={styles.rewardCard}>
        <Text style={styles.rewardLabel}>Reward</Text>
        <Text style={styles.rewardAmount}>${chore.reward.toFixed(2)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{chore.description}</Text>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Created by</Text>
          <Text style={styles.infoValue}>{chore.createdByName}</Text>
        </View>

        {chore.assignedToName && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Assigned to</Text>
            <Text style={styles.infoValue}>{chore.assignedToName}</Text>
          </View>
        )}

        {chore.dueDate && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Due date</Text>
            <Text style={styles.infoValue}>
              {new Date(chore.dueDate).toLocaleDateString()}
            </Text>
          </View>
        )}

        {chore.claimedAt && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Claimed on</Text>
            <Text style={styles.infoValue}>
              {new Date(chore.claimedAt).toLocaleDateString()}
            </Text>
          </View>
        )}

        {chore.completedAt && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Completed on</Text>
            <Text style={styles.infoValue}>
              {new Date(chore.completedAt).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>

      {chore.completionNotes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completion Notes</Text>
          <Text style={styles.description}>{chore.completionNotes}</Text>
        </View>
      )}

      {canComplete && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completion Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add any notes about the completed chore..."
            value={completionNotes}
            onChangeText={setCompletionNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      )}

      <View style={styles.actions}>
        {canClaim && (
          <TouchableOpacity
            style={[styles.actionButton, styles.claimButton]}
            onPress={handleClaimChore}
            disabled={actionLoading}
          >
            <Text style={styles.actionButtonText}>
              {actionLoading ? 'Claiming...' : 'Claim This Chore'}
            </Text>
          </TouchableOpacity>
        )}

        {canComplete && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={handleCompleteChore}
            disabled={actionLoading}
          >
            <Text style={styles.actionButtonText}>
              {actionLoading ? 'Submitting...' : 'Submit for Approval'}
            </Text>
          </TouchableOpacity>
        )}

        {canApprove && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={handleApproveChore}
              disabled={actionLoading}
            >
              <Text style={styles.actionButtonText}>
                {actionLoading ? 'Approving...' : 'Approve & Pay'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={handleRejectChore}
              disabled={actionLoading}
            >
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
          </>
        )}

        {canDelete && chore.status !== ChoreStatus.Completed && (
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteChore}
            disabled={actionLoading}
          >
            <Text style={styles.deleteButtonText}>Delete Chore</Text>
          </TouchableOpacity>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  rewardCard: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  rewardLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  rewardAmount: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  infoGrid: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoItem: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    minHeight: 100,
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  claimButton: {
    backgroundColor: '#10b981',
  },
  completeButton: {
    backgroundColor: '#3b82f6',
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
});

