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
import { allowanceService } from '../services/allowanceService';
import { Allowance, AllowanceFrequency } from '../types/allowance';
import { useAuth } from '../contexts/AuthContext';

export default function AllowanceListScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllowances = async () => {
    try {
      const data = await allowanceService.getAllowances();
      setAllowances(data);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load allowances');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAllowances();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllowances();
  };

  const handleProcessAllowances = async () => {
    Alert.alert(
      'Process Allowances',
      'Process all pending allowance payments now?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Process',
          onPress: async () => {
            try {
              const result = await allowanceService.processAllowances();
              Alert.alert('Success', `Processed ${result.count} allowances`);
              fetchAllowances();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to process allowances');
            }
          },
        },
      ]
    );
  };

  const getFrequencyEmoji = (frequency: AllowanceFrequency) => {
    switch (frequency) {
      case AllowanceFrequency.Weekly:
        return '📅';
      case AllowanceFrequency.BiWeekly:
        return '📆';
      case AllowanceFrequency.Monthly:
        return '🗓️';
      default:
        return '📋';
    }
  };

  const getScheduleText = (allowance: Allowance) => {
    if (allowance.frequency === AllowanceFrequency.Weekly || allowance.frequency === AllowanceFrequency.BiWeekly) {
      return `Every ${allowance.frequency === AllowanceFrequency.BiWeekly ? 'other ' : ''}${allowance.dayOfWeekName}`;
    } else if (allowance.frequency === AllowanceFrequency.Monthly) {
      const suffix = allowance.dayOfMonth === 1 ? 'st' : allowance.dayOfMonth === 2 ? 'nd' : allowance.dayOfMonth === 3 ? 'rd' : 'th';
      return `${allowance.dayOfMonth}${suffix} of each month`;
    }
    return '';
  };

  const renderAllowance = ({ item }: { item: Allowance }) => (
    <TouchableOpacity
      style={[styles.allowanceCard, !item.isActive && styles.inactiveCard]}
      onPress={() => navigation.navigate('AllowanceDetail' as never, { allowanceId: item.id } as never)}
    >
      <View style={styles.allowanceHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.frequencyEmoji}>{getFrequencyEmoji(item.frequency)}</Text>
          <View>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.scheduleText}>{getScheduleText(item)}</Text>
          </View>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
        </View>
      </View>

      {item.nextPaymentDate && (
        <View style={styles.nextPaymentContainer}>
          <Text style={styles.nextPaymentLabel}>Next Payment:</Text>
          <Text style={styles.nextPaymentDate}>
            {new Date(item.nextPaymentDate).toLocaleDateString()}
          </Text>
        </View>
      )}

      {!item.isActive && (
        <View style={styles.inactiveBadge}>
          <Text style={styles.inactiveBadgeText}>Inactive</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const totalMonthly = allowances
    .filter(a => a.isActive)
    .reduce((sum, a) => {
      const monthlyAmount = 
        a.frequency === AllowanceFrequency.Weekly ? a.amount * 4.33 :
        a.frequency === AllowanceFrequency.BiWeekly ? a.amount * 2.17 :
        a.amount;
      return sum + monthlyAmount;
    }, 0);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading allowances...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Allowances</Text>
        {user?.isParent && (
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.processButton}
              onPress={handleProcessAllowances}
            >
              <Text style={styles.processButtonText}>⚡ Process</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('CreateAllowance' as never)}
            >
              <Text style={styles.createButtonText}>+ Create</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {allowances.length > 0 && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Estimated Monthly Total</Text>
          <Text style={styles.summaryAmount}>${totalMonthly.toFixed(2)}</Text>
        </View>
      )}

      <FlatList
        data={allowances}
        renderItem={renderAllowance}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📅</Text>
            <Text style={styles.emptyText}>No allowances set up yet</Text>
            {user?.isParent && (
              <Text style={styles.emptySubtext}>Create recurring allowances for your family!</Text>
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
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  processButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  processButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  summaryCard: {
    backgroundColor: '#10b981',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginBottom: 8,
  },
  summaryAmount: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  allowanceCard: {
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
  inactiveCard: {
    opacity: 0.6,
    backgroundColor: '#f9fafb',
  },
  allowanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  frequencyEmoji: {
    fontSize: 32,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  scheduleText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  nextPaymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  nextPaymentLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  nextPaymentDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  inactiveBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  inactiveBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

