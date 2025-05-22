import PolicyScreen from '@/app/(auth)/policy';
import { Stack } from 'expo-router';
import React from 'react';

export default function CartLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="checkout"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="orderDetail"
        options={{
          headerShown: false
        }}
      />
    </Stack>
  );
}