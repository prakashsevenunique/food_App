import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import * as Haptics from "expo-haptics"
import { router } from "expo-router"
import * as ImagePicker from "expo-image-picker"

// Food Delivery color palette
const COLORS = {
  primary: "#E23744",
  textDark: "#3D4152",
  textLight: "#93959F",
  lightGray: "#F8F8F8",
}

// Sample user data - in a real app, this would come from an API or storage
const USER_DATA = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 123-456-7890",
  profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
}

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [profileImage, setProfileImage] = useState("")
  const [imageLoading, setImageLoading] = useState(false)
  
  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      try {
        // In a real app, this would be an API call
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800))
        setName(USER_DATA.name)
        setEmail(USER_DATA.email)
        setPhone(USER_DATA.phone)
        setProfileImage(USER_DATA.profileImage)
      } catch (error) {
        console.error("Error fetching user data:", error)
        Alert.alert("Error", "Failed to load profile data")
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserData()
  }, [])
  
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty")
      return
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setSaving(true)
    
    try {
      // In a real app, this would be an API call to update the user profile
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Success notification
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      router.back()
    } catch (error) {
      console.error("Error saving profile:", error)
      Alert.alert("Error", "Failed to save profile changes")
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    } finally {
      setSaving(false)
    }
  }
  
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.back()
  }
  
  const handleChangePhoto = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "We need camera roll permission to change your profile picture")
      return
    }
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageLoading(true)
        
        // In a real app, you would upload the image to a server here
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setProfileImage(result.assets[0].uri)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      }
    } catch (error) {
      console.error("Error picking image:", error)
      Alert.alert("Error", "Failed to change profile picture")
    } finally {
      setImageLoading(false)
    }
  }

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <StatusBar barStyle="dark-content" />
        <View 
          style={{ 
            paddingTop:20,
            paddingBottom: 16
          }}
          className="absolute top-0 left-0 right-0 bg-white px-4 border-b border-gray-100 flex-row items-center"
        >
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-[#3D4152] ml-4">Edit Profile</Text>
        </View>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text className="mt-2 text-[#93959F]">Loading profile data...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white">
      <View 
        className="bg-white px-4 border-b border-gray-100 flex-row items-center justify-between"
        style={{ 
          paddingTop: 20,
          paddingBottom: 16
        }}
      >
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-[#3D4152]">Edit Profile</Text>
        {saving ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <TouchableOpacity onPress={handleSave}>
            <Text className="text-[#E23744] font-medium">Save</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Profile Image */}
        <View className="items-center mb-6">
          <View className="relative">
            {imageLoading ? (
              <View className="w-24 h-24 rounded-full bg-[#F8F8F8] items-center justify-center">
                <ActivityIndicator color={COLORS.primary} />
              </View>
            ) : (
              <Image 
                source={{ uri: profileImage }} 
                className="w-24 h-24 rounded-full mb-2" 
              />
            )}
            <TouchableOpacity 
              onPress={handleChangePhoto}
              className="absolute bottom-2 right-0 bg-white rounded-full p-2 shadow-sm"
              disabled={imageLoading}
            >
              <Ionicons name="camera" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            className="bg-[#F8F8F8] px-4 py-2 rounded-full mt-2"
            onPress={handleChangePhoto}
            disabled={imageLoading}
          >
            <Text className="text-[#3D4152] font-medium">Change Photo</Text>
          </TouchableOpacity>
        </View>
        
        {/* Form Fields */}
        <View className="mb-4">
          <Text className="text-[#93959F] mb-1 ml-1">Full Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            className="bg-[#F8F8F8] p-3 rounded-lg text-[#3D4152]"
            placeholder="Enter your full name"
          />
        </View>
        
        <View className="mb-4">
          <Text className="text-[#93959F] mb-1 ml-1">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            className="bg-[#F8F8F8] p-3 rounded-lg text-[#3D4152]"
            placeholder="Enter your email"
            keyboardType="email-address"
          />
        </View>
        
        <View className="mb-4">
          <Text className="text-[#93959F] mb-1 ml-1">Phone Number</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            className="bg-[#F8F8F8] p-3 rounded-lg text-[#3D4152]"
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />
        </View>
      </ScrollView>
    </View>
  )
}