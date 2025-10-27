import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../contexts';

export const HomeScreen: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Proclamation! 🎉</Text>
        
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{user.displayName}</Text>
            
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{user.phoneNumber}</Text>
            
            <Text style={styles.infoLabel}>Role:</Text>
            <Text style={styles.infoValue}>
              {user.role === 1 ? '👨‍👩‍👧‍👦 Parent' : '🧒 Child'}
            </Text>
            
            <Text style={styles.infoLabel}>Balance:</Text>
            <Text style={styles.infoValue}>${user.balance.toFixed(2)}</Text>
          </View>
        )}

        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonTitle}>Coming Soon:</Text>
          <Text style={styles.comingSoonItem}>💬 Family Messaging</Text>
          <Text style={styles.comingSoonItem}>💰 Currency System</Text>
          <Text style={styles.comingSoonItem}>🧹 Chore Marketplace</Text>
          <Text style={styles.comingSoonItem}>👨‍👩‍👧‍👦 Family Management</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 32,
    textAlign: 'center',
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
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

