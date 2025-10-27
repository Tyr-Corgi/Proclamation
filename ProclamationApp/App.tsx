import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/contexts';
import {
  PhoneNumberScreen,
  VerificationCodeScreen,
  RegistrationScreen,
  HomeScreen,
} from './src/screens';
import { AuthResponse } from './src/types';

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

function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // You can add a loading screen here
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Home" component={HomeScreen} />
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
