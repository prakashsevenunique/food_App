import { View, Text, Pressable, Image } from 'react-native';
import { Link, Stack } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops! Not Found', headerShown: false }} />
      <View className="flex-1 bg-[#0F172A] items-center justify-center p-8">
        {/* Illustration */}
        <View className="mb-8 relative">
          <Ionicons name="warning" size={120} color="#F59E0B" />
          <View className="absolute -inset-6 border-4 border-yellow-400/30 rounded-full animate-pulse" />
        </View>
        
        {/* Title */}
        <Text className="text-white text-4xl font-extrabold mb-3">404</Text>
        
        {/* Subtitle */}
        <Text className="text-gray-300 text-xl font-semibold mb-2">
          Page Not Found
        </Text>
        
        {/* Description */}
        <Text className="text-gray-400 text-center text-lg mb-8 max-w-md">
          The page you're looking for doesn't exist or may have been moved.
        </Text>
        
        {/* Home Button */}
        <Link href="/" asChild>
          <Pressable 
            className="bg-indigo-600 px-8 py-4 rounded-xl flex-row items-center 
             active:opacity-80 transition-all"
          >
            <Ionicons name="home" size={20} color="white" style={{ marginRight: 8 }} />
            <Text className="text-white text-lg font-semibold">
              Return Home
            </Text>
          </Pressable>
        </Link>
        
        {/* Additional Help */}
        <View className="mt-8 flex-row">
          <Text className="text-gray-500 mr-1">Need help?</Text>
          <Link href="/(auth)/policy" asChild>
            <Pressable>
              <Text className="text-indigo-400 font-medium">Contact support</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </>
  );
}