import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';

export const CalendarScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.comingSoonCard}>
          <Text style={styles.comingSoonTitle}>📅 Calendar Feature</Text>
          <Text style={styles.comingSoonText}>
            Calendar integration with Google Calendar and Outlook is coming soon!
          </Text>
          <Text style={styles.featureList}>
            {'\n'}Upcoming features:{'\n\n'}
            • Sync with Google Calendar{'\n'}
            • Sync with Outlook Calendar{'\n'}
            • Schedule chores{'\n'}
            • Family events{'\n'}
            • Allowance payment dates{'\n'}
            • Reminders and notifications
          </Text>
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
  header: {
    backgroundColor: '#007AFF',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 16,
  },
  comingSoonCard: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  comingSoonText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  featureList: {
    fontSize: 14,
    color: '#666',
    lineHeight: 24,
    marginTop: 8,
  },
});

