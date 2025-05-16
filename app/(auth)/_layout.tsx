import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AuthLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10, paddingTop: 5 }}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        ),
      }}
    >
      {/* Language screen without a header */}
      <Stack.Screen
        name="welcome"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="login"
        options={{ title: 'Login', headerShown: false }}
      />
      <Stack.Screen
        name="policy"
        options={{ title: 'Policy', headerShown: false }}
      />
      <Stack.Screen
        name="otp-verification"
        options={{ title: 'Otp', headerShown: false }}
      />
      <Stack.Screen
        name="user-details"
        options={{ title: 'userDetails', headerShown: false }}
      />
    </Stack>
  );
}
