import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts';
import { apiService } from '../services';
import { choreService } from '../services/choreService';
import { Chore, Message } from '../types';

export const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(user?.balance || 0);
  const [todayChores, setTodayChores] = useState<Chore[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      // Load balance
      const balanceData = await apiService.getBalance();
      setBalance(balanceData);

      // Load today's chores
      const chores = await choreService.getChores();
      setTodayChores(chores.filter(c => c.status === 'Available' || c.status === 'Claimed'));

      // Load unread message count
      const unreadCount = await apiService.getUnreadCount();
      setUnreadMessages(unreadCount);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadDashboardData();
  };

  const getCurrentDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('en-US', options);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.displayName}!</Text>
        <Text style={styles.date}>{getCurrentDate()}</Text>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{todayChores.length}</Text>
          <Text style={styles.statLabel}>Available Chores</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{unreadMessages}</Text>
          <Text style={styles.statLabel}>Unread Messages</Text>
        </View>
      </View>

      {/* Today's Chores Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Chores</Text>
        {todayChores.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No chores available</Text>
          </View>
        ) : (
          todayChores.slice(0, 5).map((chore) => (
            <View key={chore.id} style={styles.choreItem}>
              <View style={styles.choreInfo}>
                <Text style={styles.choreTitle}>{chore.title}</Text>
                <Text style={styles.choreReward}>${chore.reward.toFixed(2)}</Text>
              </View>
              <View style={[
                styles.choreStatus,
                chore.status === 'Claimed' && styles.choreStatusClaimed
              ]}>
                <Text style={styles.choreStatusText}>{chore.status}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Daily Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Summary</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>
            {user?.role === 0 ? (
              // Parent view
              `You have ${todayChores.length} chores posted and ${unreadMessages} unread messages.`
            ) : (
              // Child view
              `You have ${todayChores.filter(c => c.claimedByUserId === user?.id).length} chores claimed and ${unreadMessages} unread messages.`
            )}
          </Text>
        </View>
      </View>

      {/* Placeholder for Calendar Events - We'll implement this later */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Calendar integration coming soon!</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  balanceCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: -16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  choreItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  choreInfo: {
    flex: 1,
  },
  choreTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  choreReward: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
  },
  choreStatus: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  choreStatusClaimed: {
    backgroundColor: '#fff3cd',
  },
  choreStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
  },
});

