import PolicyScreen from '@/app/(auth)/policy';
import { Stack } from 'expo-router';
import React from 'react';

export default function OrderScreen() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false
        }}
      />
    </Stack>
  );
}