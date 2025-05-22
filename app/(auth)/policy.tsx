import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';


export default function PolicyScreen() {
    const { policyType } = useLocalSearchParams();
    if (policyType === "privacyPolicy") {
        return (
            <View className="flex-1 bg-white">

            </View>
        );
    }
    else if (policyType === "terms") {
        return (
            <View className="flex-1 bg-white">
                <StatusBar style="auto" />
                {/* Header with Back Button */}
                <View className="flex-row items-center p-2 bg-pink-500 h-20 pt-8">
                    <TouchableOpacity onPress={() => router.back()} className="p-2">
                        <MaterialIcons name="arrow-back" size={23} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-lg font-bold ml-2">Terms and Conditions</Text>
                </View>
            </View>
        );
    }
    else {
        return (
            <View className="flex-1 bg-white">
                <StatusBar style="auto" />
                {/* Header with Back Button */}
                <View className="flex-row items-center p-2 bg-pink-500 h-20 pt-8">
                    <TouchableOpacity onPress={() => router.back()} className="p-2">
                        <MaterialIcons name="arrow-back" size={23} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-lg font-bold ml-2">Content Policy</Text>
                </View>
            </View>
        );
    }

}
