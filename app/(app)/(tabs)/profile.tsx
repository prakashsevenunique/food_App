import React, { useRef, useEffect, useState, useContext } from "react"
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import * as Haptics from "expo-haptics"
import { router } from "expo-router"
import { useFocusEffect } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { UserContext } from "@/hooks/userInfo"
import { imageBaseUrl } from "@/utils/helpingData"

// Food Delivery color palette
const COLORS = {
  primary: "#E23744", // Zomato-inspired red
  textDark: "#3D4152",
  textLight: "#93959F",
  lightGray: "#F8F8F8",
}

// Sample user data - in a real app, this would come from an API or storage
const USER_DATA = {
  name: "John Doe",
  email: "john.doe@example.com",
  profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
}

// Profile menu items
const MENU_ITEMS = [
  {
    id: "edit-profile",
    title: "Edit Profile",
    icon: "person-outline",
    route: "/profileDetails/edit",
  },
  {
    id: "wallet",
    title: "E-Wallet",
    icon: "wallet-outline",
    route: "/profileDetails/wallet",
  },
  {
    id: "wallet-statement",
    title: "Wallet Statement",
    icon: "document-text-outline",
    route: "/profileDetails/walletStatement",
  },
  {
    id: "orders",
    title: "Your Orders",
    icon: "receipt-outline",
    route: "/orders",
  },
  {
    id: "offers",
    title: "Offers",
    icon: "pricetags-outline",
    route: "/profileDetails/offers",
  },
  {
    id: "refer",
    title: "Refer and Earn",
    icon: "wallet-outline",
    route: "/profileDetails/referNearn",
  },
  {
    id: "addresses",
    title: "Saved Addresses",
    icon: "location-outline",
    route: "/profileDetails/address",
  },
  {
    id: "favorites",
    title: "Favorite Restaurants",
    icon: "heart-outline",
    route: "/profileDetails/favorites",
  },
  {
    id: "settings",
    title: "App Settings",
    icon: "settings-outline",
    route: "/profileDetails/setting",
  },
]

export default function ProfileScreen() {
  const [user, setUser] = useState(null)
  const [logoutModalVisible, setLogoutModalVisible] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const { userInfo } = useContext(UserContext) as any;

  console.log("userInfo", userInfo);

  const fadeAnim = useRef(new Animated.Value(0)).current
  const modalScaleAnim = useRef(new Animated.Value(0.9)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [])

  useEffect(() => {
    if (logoutModalVisible) {
      Animated.spring(modalScaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start()
    } else {
      modalScaleAnim.setValue(0.9)
    }
  }, [logoutModalVisible])


  const handleMenuItemPress = (route) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push(route)
  }

  const handleLogoutPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setLogoutModalVisible(true)
  }

  const handleCancelLogout = () => {
    setLogoutModalVisible(false)
  }

  const handleConfirmLogout = async () => {
    setLoggingOut(true)
    try {
      await AsyncStorage.removeItem("authToken")
      setLogoutModalVisible(false)
      setTimeout(() => {
        router.replace("/login")
      }, 100)
    } catch (error) {
      console.error("Error during logout:", error)
      Alert.alert("Logout Error", "There was a problem logging out. Please try again.")
    } finally {
      setLoggingOut(false)
    }
  }

  const renderLogoutModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={logoutModalVisible}
      onRequestClose={() => setLogoutModalVisible(false)}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <Animated.View
          className="bg-white rounded-xl w-[85%] overflow-hidden"
          style={{
            transform: [{ scale: modalScaleAnim }],
          }}
        >
          <View className="p-6">
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center mb-4">
                <Ionicons name="log-out-outline" size={32} color={COLORS.primary} />
              </View>
              <Text className="text-xl font-bold text-[#3D4152] text-center">Logout</Text>
              <Text className="text-[#93959F] text-center mt-2">
                Are you sure you want to logout from your account?
              </Text>
            </View>

            <View className="flex-row mt-4">
              <TouchableOpacity
                onPress={handleCancelLogout}
                className="flex-1 py-3 rounded-lg border border-gray-200 mr-2"
              >
                <Text className="text-center font-medium text-[#3D4152]">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmLogout}
                className="flex-1 py-3 rounded-lg bg-[#E23744] ml-2"
                disabled={loggingOut}
              >
                {loggingOut ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-center font-medium text-white">Logout</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )

  return (
    <View className="flex-1 bg-white">
      <View
        className="bg-white px-4 border-b border-gray-100"
        style={{
          paddingTop: 20,
          paddingBottom: 16,
        }}
      >
        <Text className="text-xl font-bold text-[#3D4152]">Profile</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile Card */}
        <Animated.View className="px-4 py-6 border-b border-gray-100" style={{ opacity: fadeAnim }}>
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => handleMenuItemPress("/profileDetails/edit")} className="relative">
              <Image source={{ uri: imageBaseUrl + "/" + userInfo.profilePicture }} className="w-16 h-16 rounded-full" />
              <View className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm">
                <Ionicons name="camera" size={14} color={COLORS.primary} />
              </View>
            </TouchableOpacity>

            <View className="ml-4 flex-1">
              <Text className="text-lg font-bold text-[#3D4152]">{userInfo?.fullName}</Text>
              <Text className="text-sm text-[#93959F]">{userInfo?.email}</Text>
              <Text className="text-sm text-[#93959F]">{userInfo?.mobileNumber}</Text>
            </View>

            <TouchableOpacity onPress={() => handleMenuItemPress("/profileDetails/edit")} className="p-2">
              <Ionicons name="pencil-outline" size={22} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Menu Items */}
        <View className="mt-4">
          {MENU_ITEMS.map((item, index) => (
            <Animated.View
              key={item.id}
              style={{
                opacity: fadeAnim,
              }}
            >
              <TouchableOpacity
                onPress={() => handleMenuItemPress(item.route)}
                className="px-4 py-4 flex-row items-center border-b border-gray-100"
              >
                <View className="w-10 h-10 rounded-full bg-[#F8F8F8] items-center justify-center mr-4">
                  <Ionicons name={item.icon} size={20} color={COLORS.primary} />
                </View>
                <Text className="flex-1 text-[#3D4152]">{item.title}</Text>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Logout Button */}
        <View className="mx-4 mt-6">
          <TouchableOpacity
            onPress={handleLogoutPress}
            className="bg-[#F8F8F8] rounded-lg p-4 flex-row items-center justify-center"
          >
            <Ionicons name="log-out-outline" size={20} color={COLORS.primary} />
            <Text className="ml-2 font-medium text-[#E23744]">Logout</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View className="mt-8 pb-16 items-center">
          <Text className="text-xs text-[#93959F]">Version 1.0.0</Text>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      {renderLogoutModal()}
    </View>
  )
}
