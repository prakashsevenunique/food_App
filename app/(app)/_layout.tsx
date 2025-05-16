import React, { useEffect } from 'react';
import { router, usePathname } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function ProtectedLayout() {
  useEffect(() => {
    async function tokenData() {
      const fetchToken = await AsyncStorage.getItem('userData');
      if (!fetchToken) {
        router.replace("/welcome")
      }
    }
    tokenData()
  }, [])

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: true,
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="profile"
          options={{ title: 'profile', headerShown: false }}
        />
        <Stack.Screen
          name="cartPage"
          options={{ title: 'cart', headerShown: false }}
        />
        <Stack.Screen
          name="orderDetails"
          options={{ title: 'orderDetails', headerShown: false }}
        />
        <Stack.Screen
          name="notification"
          options={{ title: 'notification', headerShown: false }}
        />
        <Stack.Screen
          name="resturant"
          options={{ title: 'resturant', headerShown: false }}
        />

      </Stack>
    </>

  );
}




