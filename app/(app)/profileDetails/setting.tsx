import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import * as Haptics from "expo-haptics"
import { router } from "expo-router"

// Food Delivery color palette
const COLORS = {
  primary: "#E23744",
  textDark: "#3D4152",
  textLight: "#93959F",
  lightGray: "#F8F8F8",
}

// Sample settings - in a real app, this would come from an API or storage
const INITIAL_SETTINGS = {
  notifications: {
    pushNotifications: true,
    emailNotifications: true,
    orderUpdates: true,
  },
  appSettings: {
    darkMode: false,
    saveSearchHistory: true,
  },
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets()
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState(null)
  const [savingSettings, setSavingSettings] = useState({})
  
  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true)
      try {
        // In a real app, this would be an API call
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800))
        setSettings(INITIAL_SETTINGS)
      } catch (error) {
        console.error("Error fetching settings:", error)
        Alert.alert("Error", "Failed to load settings")
      } finally {
        setLoading(false)
      }
    }
    
    fetchSettings()
  }, [])
  
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.back()
  }

  const handleToggleSetting = async (category, key) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    
    // Create a unique ID for this setting
    const settingId = `${category}.${key}`
    
    // Set loading state for this specific setting
    setSavingSettings(prev => ({
      ...prev,
      [settingId]: true
    }))
    
    try {
      // In a real app, this would be an API call
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400))
      
      // Update local state
      setSettings(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [key]: !prev[category][key]
        }
      }))
    } catch (error) {
      console.error("Error updating setting:", error)
      Alert.alert("Error", "Failed to update setting")
    } finally {
      setSavingSettings(prev => ({
        ...prev,
        [settingId]: false
      }))
    }
  }
  
  const handleNavigate = (route) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    // Navigate to the specified route
    Alert.alert("Navigation", `This would navigate to: ${route}`)
  }

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <View 
          style={{ 
            paddingTop: 20,
            paddingBottom: 16
          }}
          className="absolute top-0 left-0 right-0 bg-white px-4 border-b border-gray-100 flex-row items-center"
        >
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-[#3D4152] ml-4">Settings</Text>
        </View>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text className="mt-2 text-[#93959F]">Loading settings...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View 
        className="bg-white px-4 border-b border-gray-100 flex-row items-center"
        style={{ 
          paddingTop: 20,
          paddingBottom: 16
        }}
      >
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-[#3D4152] ml-4">Settings</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Notification Settings */}
        <View className="p-4 border-b border-gray-100">
          <Text className="text-base font-medium text-[#3D4152] mb-3">Notifications</Text>
          
          <View className="mb-4 flex-row justify-between items-center">
            <Text className="text-[#3D4152]">Push Notifications</Text>
            {savingSettings["notifications.pushNotifications"] ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Switch
                trackColor={{ false: "#D4D5D9", true: "#60B246" }}
                thumbColor={"#FFFFFF"}
                ios_backgroundColor="#D4D5D9"
                onValueChange={() => handleToggleSetting("notifications", "pushNotifications")}
                value={settings.notifications.pushNotifications}
              />
            )}
          </View>
          
          <View className="mb-4 flex-row justify-between items-center">
            <Text className="text-[#3D4152]">Email Notifications</Text>
            {savingSettings["notifications.emailNotifications"] ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Switch
                trackColor={{ false: "#D4D5D9", true: "#60B246" }}
                thumbColor={"#FFFFFF"}
                ios_backgroundColor="#D4D5D9"
                onValueChange={() => handleToggleSetting("notifications", "emailNotifications")}
                value={settings.notifications.emailNotifications}
              />
            )}
          </View>
          
          <View className="flex-row justify-between items-center">
            <Text className="text-[#3D4152]">Order Updates</Text>
            {savingSettings["notifications.orderUpdates"] ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Switch
                trackColor={{ false: "#D4D5D9", true: "#60B246" }}
                thumbColor={"#FFFFFF"}
                ios_backgroundColor="#D4D5D9"
                onValueChange={() => handleToggleSetting("notifications", "orderUpdates")}
                value={settings.notifications.orderUpdates}
              />
            )}
          </View>
        </View>

        
        {/* Other Settings */}
        <View className="p-4">
          <Text className="text-base font-medium text-[#3D4152] mb-3">Other</Text>
          
          <TouchableOpacity 
            className="flex-row justify-between items-center py-4"
            onPress={() => handleNavigate("/privacy-policy")}
          >
            <Text className="text-[#3D4152]">Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-row justify-between items-center py-4"
            onPress={() => handleNavigate("/terms-of-service")}
          >
            <Text className="text-[#3D4152]">Terms of Service</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-row justify-between items-center py-4"
            onPress={() => handleNavigate("/about")}
          >
            <Text className="text-[#3D4152]">About</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>
        
        {/* App Version */}
        <View className="items-center mt-4 mb-8">
          <Text className="text-xs text-[#93959F]">Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  )
}