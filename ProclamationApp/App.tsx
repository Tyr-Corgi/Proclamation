import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/contexts';
import {
  PhoneNumberScreen,
  VerificationCodeScreen,
  RegistrationScreen,
  HomeScreen,
  FamilyCreateScreen,
  JoinFamilyScreen,
  FamilyMembersScreen,
  MessageScreen,
  SendMoneyScreen,
  TransactionScreen,
  ChoreListScreen,
  CreateChoreScreen,
  ChoreDetailScreen,
} from './src/screens';
import { AuthResponse, Family } from './src/types';

const Stack = createNativeStackNavigator();

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

  return <PhoneNumberScreen onVerificationSent={handleVerificationSent} />;
}

function MainNavigator() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'createFamily' | 'joinFamily' | 'viewFamily' | 'messages' | 'sendMoney' | 'transactions' | 'chores' | 'createChore' | 'choreDetail'>('home');
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [selectedChoreId, setSelectedChoreId] = useState<number | null>(null);

  const handleCreateFamily = () => {
    setCurrentScreen('createFamily');
  };

  const handleJoinFamily = () => {
    setCurrentScreen('joinFamily');
  };

  const handleViewFamily = (family: Family) => {
    setSelectedFamily(family);
    setCurrentScreen('viewFamily');
  };

  const handleOpenMessages = () => {
    setCurrentScreen('messages');
  };

  const handleSendMoney = () => {
    setCurrentScreen('sendMoney');
  };

  const handleViewTransactions = () => {
    setCurrentScreen('transactions');
  };

  const handleViewChores = () => {
    setCurrentScreen('chores');
  };

  const handleFamilyCreated = (family: Family) => {
    setSelectedFamily(family);
    setCurrentScreen('viewFamily');
  };

  const handleFamilyJoined = (family: Family) => {
    setSelectedFamily(family);
    setCurrentScreen('viewFamily');
  };

  const handleBack = () => {
    setCurrentScreen('home');
    setSelectedFamily(null);
  };

  if (currentScreen === 'createFamily') {
    return (
      <FamilyCreateScreen
        onFamilyCreated={handleFamilyCreated}
        onBack={handleBack}
      />
    );
  }

  if (currentScreen === 'joinFamily') {
    return (
      <JoinFamilyScreen
        onFamilyJoined={handleFamilyJoined}
        onBack={handleBack}
      />
    );
  }

  if (currentScreen === 'viewFamily' && selectedFamily) {
    return (
      <FamilyMembersScreen
        family={selectedFamily}
        onBack={handleBack}
      />
    );
  }

  if (currentScreen === 'messages') {
    return (
      <MessageScreen
        onBack={handleBack}
      />
    );
  }

  if (currentScreen === 'sendMoney') {
    return (
      <SendMoneyScreen
        onBack={handleBack}
        onMoneySent={() => handleBack()}
      />
    );
  }

  if (currentScreen === 'transactions') {
    return (
      <TransactionScreen
        onBack={handleBack}
      />
    );
  }

  if (currentScreen === 'chores') {
    return (
      <ChoreListScreen />
    );
  }

  if (currentScreen === 'createChore') {
    return (
      <CreateChoreScreen />
    );
  }

  if (currentScreen === 'choreDetail' && selectedChoreId) {
    return (
      <ChoreDetailScreen />
    );
  }

  return (
    <HomeScreen
      onCreateFamily={handleCreateFamily}
      onJoinFamily={handleJoinFamily}
      onViewFamily={handleViewFamily}
      onOpenMessages={handleOpenMessages}
      onSendMoney={handleSendMoney}
      onViewTransactions={handleViewTransactions}
      onViewChores={handleViewChores}
    />
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
