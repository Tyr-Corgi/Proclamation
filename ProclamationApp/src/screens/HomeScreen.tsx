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
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onCreateFamily,
  onJoinFamily,
  onViewFamily,
}) => {
  const { user, logout } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFamily();
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
            
            <Text style={styles.infoLabel}>Balance:</Text>
            <Text style={styles.infoValue}>${user.balance.toFixed(2)}</Text>
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
          <Text style={styles.comingSoonItem}>💬 Family Messaging</Text>
          <Text style={styles.comingSoonItem}>💰 Allowance System</Text>
          <Text style={styles.comingSoonItem}>🧹 Chore Marketplace</Text>
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
