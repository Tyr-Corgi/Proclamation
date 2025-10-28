import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts';
import { apiService } from '../services';
import { Family } from '../types';

interface HomeScreenProps {
  onCreateFamily: () => void;
  onJoinFamily: () => void;
  onViewFamily: (family: Family) => void;
  onOpenMessages: () => void;
  onSendMoney: () => void;
  onViewTransactions: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onCreateFamily,
  onJoinFamily,
  onViewFamily,
  onOpenMessages,
  onSendMoney,
  onViewTransactions,
}) => {
  const { user, logout } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [balance, setBalance] = useState<number>(user?.balance || 0);

  useEffect(() => {
    loadFamily();
    loadUnreadCount();
    loadBalance();
    
    // Poll for unread messages and balance every 10 seconds
    const interval = setInterval(() => {
      loadUnreadCount();
      loadBalance();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadFamily = async () => {
    try {
      const familyData = await apiService.getMyFamily();
      setFamily(familyData);
    } catch (error: any) {
      // User is not part of a family yet
      if (error.response?.status !== 404) {
        console.error('Error loading family:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await apiService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      // Silently fail - user might not be in a family yet
      console.log('Could not load unread count');
    }
  };

  const loadBalance = async () => {
    try {
      const currentBalance = await apiService.getBalance();
      setBalance(currentBalance);
    } catch (error) {
      console.log('Could not load balance');
    }
  };

  const handleViewFamily = () => {
    if (family) {
      onViewFamily(family);
    }
  };

  const isParent = user?.role === 1;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Welcome to Proclamation! 🎉</Text>
        
        {/* Balance Card - Prominent Display */}
        {user && (
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Your Balance</Text>
            <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
            
            <View style={styles.balanceActions}>
              {isParent && family && (
                <TouchableOpacity
                  style={styles.sendMoneyButton}
                  onPress={onSendMoney}
                >
                  <Text style={styles.sendMoneyText}>💰 Send Money</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.transactionButton}
                onPress={onViewTransactions}
              >
                <Text style={styles.transactionText}>📊 History</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{user.displayName}</Text>
            
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{user.phoneNumber}</Text>
            
            <Text style={styles.infoLabel}>Role:</Text>
            <Text style={styles.infoValue}>
              {isParent ? '👨‍👩‍👧‍👦 Parent' : '🧒 Child'}
            </Text>
          </View>
        )}

        {/* Family Section */}
        <View style={styles.familySection}>
          <Text style={styles.sectionTitle}>👨‍👩‍👧‍👦 Family</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : family ? (
            <View style={styles.familyCard}>
              <Text style={styles.familyName}>{family.name}</Text>
              <Text style={styles.familyInfo}>
                {family.memberCount} {family.memberCount === 1 ? 'member' : 'members'}
              </Text>
              
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleViewFamily}
              >
                <Text style={styles.primaryButtonText}>View Family</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.messagesButton}
                onPress={onOpenMessages}
              >
                <Text style={styles.messagesButtonText}>💬 Family Chat</Text>
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.noFamilyCard}>
              <Text style={styles.noFamilyText}>
                You're not part of a family yet
              </Text>
              
              {isParent && (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={onCreateFamily}
                >
                  <Text style={styles.primaryButtonText}>Create Family</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={onJoinFamily}
              >
                <Text style={styles.secondaryButtonText}>
                  Join with Invite Code
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Coming Soon Section */}
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonTitle}>Coming Soon:</Text>
          <Text style={styles.comingSoonItem}>🧹 Chore Marketplace</Text>
          <Text style={styles.comingSoonItem}>📅 Recurring Allowances</Text>
          <Text style={styles.comingSoonItem}>🎯 Savings Goals</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  balanceCard: {
    backgroundColor: '#34C759',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  balanceLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  balanceActions: {
    flexDirection: 'row',
    gap: 12,
  },
  sendMoneyButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  sendMoneyText: {
    color: '#34C759',
    fontSize: 16,
    fontWeight: '600',
  },
  transactionButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  transactionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  userInfo: {
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
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  familySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  familyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  familyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  familyInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  noFamilyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noFamilyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
    width: '100%',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  messagesButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
  },
  messagesButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  comingSoon: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 12,
  },
  comingSoonItem: {
    fontSize: 16,
    color: '#333',
    marginVertical: 6,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
