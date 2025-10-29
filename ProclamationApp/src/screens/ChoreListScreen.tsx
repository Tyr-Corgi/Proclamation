import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { choreService } from '../services/choreService';
import { Chore, ChoreStatus } from '../types/chore';
import { useAuth } from '../contexts/AuthContext';

export default function ChoreListScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [chores, setChores] = useState<Chore[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchChores = async () => {
    try {
      console.log('Fetching chores...');
      const data = await choreService.getChores();
      console.log('Chores loaded:', data?.length || 0);
      setChores(data || []);
    } catch (error: any) {
      console.error('Error fetching chores:', error?.response?.status, error?.message);
      setChores([]);
      // Don't show alert, just log error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchChores();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchChores();
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

  const getStatusBadge = (chore: Chore) => {
    let emoji = '';
    switch (chore.status) {
      case ChoreStatus.Available:
        emoji = '🆓';
        break;
      case ChoreStatus.InProgress:
        emoji = '⏳';
        break;
      case ChoreStatus.PendingApproval:
        emoji = '⏱️';
        break;
      case ChoreStatus.Completed:
        emoji = '✅';
        break;
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(chore.status) }]}>
        <Text style={styles.statusEmoji}>{emoji}</Text>
        <Text style={styles.statusText}>{chore.statusName}</Text>
      </View>
    );
  };

  const renderChore = ({ item }: { item: Chore }) => (
    <TouchableOpacity
      style={styles.choreCard}
      onPress={() => navigation.navigate('ChoreDetail' as never, { choreId: item.id } as never)}
    >
      <View style={styles.choreHeader}>
        <Text style={styles.choreTitle}>{item.title}</Text>
        {getStatusBadge(item)}
      </View>

      <Text style={styles.choreDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.choreFooter}>
        <View style={styles.rewardContainer}>
          <Text style={styles.rewardLabel}>Reward:</Text>
          <Text style={styles.rewardAmount}>${item.reward.toFixed(2)}</Text>
        </View>

        {item.assignedToName && (
          <View style={styles.assignedContainer}>
            <Text style={styles.assignedLabel}>Assigned to:</Text>
            <Text style={styles.assignedName}>{item.assignedToName}</Text>
          </View>
        )}
      </View>

      {item.dueDate && (
        <Text style={styles.dueDate}>
          Due: {new Date(item.dueDate).toLocaleDateString()}
        </Text>
      )}
    </TouchableOpacity>
  );

  const availableChores = chores.filter((c) => c.status === ChoreStatus.Available);
  const myChores = chores.filter((c) => c.assignedToId === user?.id && c.status !== ChoreStatus.Completed);
  const pendingApproval = chores.filter((c) => c.status === ChoreStatus.PendingApproval);
  const completedChores = chores.filter((c) => c.status === ChoreStatus.Completed);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Loading chores...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chore Marketplace</Text>
        {user?.isParent && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateChore' as never)}
          >
            <Text style={styles.createButtonText}>+ Create</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={chores}
        renderItem={renderChore}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View style={styles.stats}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{availableChores.length}</Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{myChores.length}</Text>
              <Text style={styles.statLabel}>My Chores</Text>
            </View>
            {user?.isParent && (
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{pendingApproval.length}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No chores available</Text>
            {user?.isParent && (
              <Text style={styles.emptySubtext}>Create a chore to get started!</Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  createButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  choreCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  choreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  choreTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusEmoji: {
    fontSize: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  choreDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  choreFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rewardLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  rewardAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  assignedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  assignedLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  assignedName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  dueDate: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 8,
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
});

