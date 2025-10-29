import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './src/contexts';
import {
  PhoneNumberScreen,
  VerificationCodeScreen,
  RegistrationScreen,
  DashboardScreen,
  CalendarScreen,
  FamilyCreateScreen,
  JoinFamilyScreen,
  FamilyMembersScreen,
  MessageScreen,
  SendMoneyScreen,
  TransactionScreen,
  ChoreListScreen,
  CreateChoreScreen,
  ChoreDetailScreen,
  AllowanceListScreen,
  CreateAllowanceScreen,
} from './src/screens';
import { AuthResponse } from './src/types';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthNavigator() {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const { login } = useAuth();

  const handleVerificationSent = (phone: string) => {
    setPhoneNumber(phone);
  };

  const handleVerified = (response: AuthResponse) => {
    if (response.requiresRegistration) {
      setNeedsRegistration(true);
    } else if (response.user) {
      login(response.user);
    }
  };

  const handleRegistered = (response: AuthResponse) => {
    if (response.user) {
      login(response.user);
    }
  };

  const handleBack = () => {
    setPhoneNumber('');
    setNeedsRegistration(false);
  };

  if (needsRegistration) {
    return (
      <RegistrationScreen
        phoneNumber={phoneNumber}
        onRegistered={handleRegistered}
      />
    );
  }

  if (phoneNumber) {
    return (
      <VerificationCodeScreen
        phoneNumber={phoneNumber}
        onVerified={handleVerified}
        onBack={handleBack}
      />
    );
  }

  return (
    <PhoneNumberScreen
      onVerificationSent={handleVerificationSent}
      onDevLogin={login}
    />
  );
}

// Bottom Tab Navigator for main app screens
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Chores') {
            iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else {
            iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e5e5',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        tabBarButton: (props) => (
          <TouchableOpacity
            {...props}
            activeOpacity={0.6}
            style={[
              props.style,
              { flex: 1 },
            ]}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Chores" component={ChoreListScreen} />
      <Tab.Screen name="Messages" component={MessageScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
    </Tab.Navigator>
  );
}

// Stack Navigator for the entire app (includes modals and sub-screens)
function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen 
        name="FamilyCreate" 
        component={FamilyCreateScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen 
        name="JoinFamily" 
        component={JoinFamilyScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen 
        name="FamilyMembers" 
        component={FamilyMembersScreen}
      />
      <Stack.Screen 
        name="SendMoney" 
        component={SendMoneyScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen 
        name="Transactions" 
        component={TransactionScreen}
      />
      <Stack.Screen 
        name="CreateChore" 
        component={CreateChoreScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen 
        name="ChoreDetail" 
        component={ChoreDetailScreen}
      />
      <Stack.Screen 
        name="Allowances" 
        component={AllowanceListScreen}
      />
      <Stack.Screen 
        name="CreateAllowance" 
        component={CreateAllowanceScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading Proclamation...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </AuthProvider>
  );
}
