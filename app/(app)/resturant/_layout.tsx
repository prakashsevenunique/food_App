import PolicyScreen from '@/app/(auth)/policy';
import { Stack } from 'expo-router';
import React from 'react';

export default function ResturantLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                    presentation: 'modal'
                }}
            />
            <Stack.Screen
                name="edit"
                options={{
                    headerShown: false,
                    presentation: 'modal'
                }}
            />

        </Stack>
    );
}