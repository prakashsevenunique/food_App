"use client"

import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
  Switch,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native"
import { Ionicons, Feather, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import * as Haptics from "expo-haptics"
import { router } from "expo-router"
import * as ImagePicker from "expo-image-picker"
import { LinearGradient } from "expo-linear-gradient"
import React from "react"

const COLORS = {
  primary: "#E23744", // Zomato-inspired red
  secondary: "#FC8019", // Swiggy-inspired orange
  accent: "#60B246", // Green for success/confirmation
  background: "#FFFFFF",
  textDark: "#3D4152",
  textLight: "#93959F",
  lightGray: "#F8F8F8",
  gray: "#EEEEEE",
  border: "#E8E8E8",
}

// Sample user data
const USER = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 123-456-7890",
  profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
  addresses: [
    {
      id: 1,
      type: "Home",
      address: "123 Main Street, Apt 4B, New York, NY 10001",
      default: true,
    },
    {
      id: 2,
      type: "Work",
      address: "456 Business Ave, Suite 200, New York, NY 10002",
      default: false,
    },
  ],
  paymentMethods: [
    {
      id: 1,
      type: "Credit Card",
      name: "Visa ending in 4242",
      default: true,
    },
    {
      id: 2,
      type: "UPI",
      name: "johndoe@upi",
      default: false,
    },
  ],
  preferences: {
    notifications: {
      pushNotifications: true,
      emailNotifications: true,
      smsNotifications: false,
      orderUpdates: true,
      promotions: true,
    },
    appSettings: {
      darkMode: false,
      biometricLogin: true,
      autoSaveReceipts: true,
      saveSearchHistory: true,
    },
  },
}

// Profile menu items
const MENU_ITEMS = [
  {
    id: "orders",
    title: "Your Orders",
    icon: "receipt-outline",
    iconType: "ionicons",
    route: "/(tabs)/orders",
  },
  {
    id: "favorites",
    title: "Favorite Restaurants",
    icon: "heart-outline",
    iconType: "ionicons",
    route: "/favorites",
  },
  {
    id: "help",
    title: "Help Center",
    icon: "help-circle-outline",
    iconType: "ionicons",
    route: "/help",
  },
  {
    id: "about",
    title: "About Us",
    icon: "information-circle-outline",
    iconType: "ionicons",
    route: "/about",
  },
]

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const [user, setUser] = useState(USER)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(user.name)
  const [editedEmail, setEditedEmail] = useState(user.email)
  const [editedPhone, setEditedPhone] = useState(user.phone)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showPreferencesModal, setShowPreferencesModal] = useState(false)
  const [preferences, setPreferences] = useState(user.preferences)
  const [loading, setLoading] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const profileScaleAnim = useRef(new Animated.Value(1)).current
  const headerOpacityAnim = useRef(new Animated.Value(0)).current

  // Menu item animations
  const menuItemAnimations = useRef(MENU_ITEMS.map(() => new Animated.Value(0))).current

  // Address and payment animations
  const addressesAnim = useRef(new Animated.Value(0)).current
  const paymentsAnim = useRef(new Animated.Value(0)).current

  // Success message animation
  const successMsgAnim = useRef(new Animated.Value(0)).current
  const [showSuccessMsg, setShowSuccessMsg] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")

  useEffect(() => {
    // Initial animations
    Animated.stagger(200, [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(addressesAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(paymentsAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start()

    // Animate menu items
    Animated.stagger(
      100,
      menuItemAnimations.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ),
    ).start()
  }, [])

  const handleProfilePress = () => {
    // Profile press animation
    Animated.sequence([
      Animated.timing(profileScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(profileScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    if (!isEditing) {
      setIsEditing(true)
    }
  }

  const handleSaveProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      // Update user data
      setUser((prev) => ({
        ...prev,
        name: editedName,
        email: editedEmail,
        phone: editedPhone,
      }))

      setIsEditing(false)
      setLoading(false)

      // Show success message
      showSuccessMessage("Profile updated successfully!")
    }, 1000)
  }

  const handlePickImage = async () => {
    // Image press animation
    Animated.sequence([
      Animated.timing(profileScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(profileScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) {
      setUser((prev) => ({
        ...prev,
        profileImage: result.assets[0].uri,
      }))

      showSuccessMessage("Profile picture updated!")
    }
  }

  const handleMenuItemPress = (item) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    if (item.route) {
      router.push(item.route)
    }
  }

  const handleLogout = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setShowLogoutConfirm(false)
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      router.replace("/login")
    }, 1000)
  }

  const showSuccessMessage = (message) => {
    setSuccessMsg(message)
    setShowSuccessMsg(true)

    Animated.sequence([
      Animated.timing(successMsgAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(successMsgAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSuccessMsg(false)
    })
  }

  const handleTogglePreference = (category, key) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    setPreferences((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key],
      },
    }))
  }

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y

    // Animate header opacity based on scroll position
    Animated.timing(headerOpacityAnim, {
      toValue: scrollY > 50 ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start()
  }

  const renderIcon = (iconName, iconType, color) => {
    switch (iconType) {
      case "ionicons":
        return <Ionicons name={iconName} size={22} color={color} />
      case "feather":
        return <Feather name={iconName} size={22} color={color} />
      case "material":
        return <MaterialIcons name={iconName} size={22} color={color} />
      case "fontawesome":
        return <FontAwesome5 name={iconName} size={20} color={color} />
      case "material-community":
        return <MaterialCommunityIcons name={iconName} size={22} color={color} />
      default:
        return <Ionicons name={iconName} size={22} color={color} />
    }
  }

  return (
    <View className="flex-1 bg-white">
      <Animated.View
        className="py-3"
        style={{
          zIndex: 10,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <LinearGradient
          colors={["#FF5A5F", "#FF5A5F", "#FF7B7F"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          className="absolute top-0 left-0 right-0 h-[60px]"
        />
        <Text className="text-2xl font-bold text-white">Profile</Text>
        <View className="flex-row">
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              setIsEditing(!isEditing)
            }}
            className="px-4 py-2 rounded-full bg-white/20 border border-white/30 mr-2"
          >
            <Text className="text-white font-medium">{isEditing ? "Cancel" : "Edit"}</Text>
          </TouchableOpacity>

          {isEditing && (
            <TouchableOpacity
              onPress={handleSaveProfile}
              className="px-4 py-2 rounded-full bg-white/20 border border-white/30"
            >
              <Text className="text-white font-medium">Save</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Success Message */}
      {showSuccessMsg && (
        <Animated.View
          className="absolute top-10 left-4 right-4 z-50 bg-[#60B246] py-3 px-4 rounded-xl flex-row items-center justify-center"
          style={{
            opacity: successMsgAnim,
            transform: [
              {
                translateY: successMsgAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <Ionicons name="checkmark-circle" size={20} color="white" />
          <Text className="text-white font-medium ml-2">{successMsg}</Text>
        </Animated.View>
      )}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Profile Card */}
        <Animated.View
          className="mx-4 mt-3"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            zIndex: 10,
          }}
        >
          <TouchableOpacity activeOpacity={0.9} onPress={handleProfilePress}>
            <Animated.View
              className="bg-white rounded-2xl p-4"
              style={{
                transform: [{ scale: profileScaleAnim }],
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View className="flex-row items-center">
                <TouchableOpacity className="relative" onPress={handlePickImage} activeOpacity={0.9}>
                  <Image source={{ uri: user.profileImage }} className="w-20 h-20 rounded-full" />
                  <View className="absolute bottom-0 right-0 bg-[#F8F8F8] p-1.5 rounded-full border-2 border-white">
                    <Feather name="camera" size={14} color={COLORS.primary} />
                  </View>
                </TouchableOpacity>

                <View className="flex-1 ml-4">
                  {isEditing ? (
                    <View>
                      <TextInput
                        className="border-b border-[#E0E0E0] py-2 text-base font-medium text-[#3D4152]"
                        value={editedName}
                        onChangeText={setEditedName}
                        placeholder="Your Name"
                      />
                      <TextInput
                        className="border-b border-[#E0E0E0] py-2 mt-2 text-sm text-[#93959F]"
                        value={editedEmail}
                        onChangeText={setEditedEmail}
                        placeholder="Your Email"
                        keyboardType="email-address"
                      />
                      <TextInput
                        className="border-b border-[#E0E0E0] py-2 mt-2 text-sm text-[#93959F]"
                        value={editedPhone}
                        onChangeText={setEditedPhone}
                        placeholder="Your Phone"
                        keyboardType="phone-pad"
                      />
                    </View>
                  ) : (
                    <>
                      <Text className="text-base font-bold text-[#3D4152]">{user.name}</Text>
                      <Text className="text-sm text-[#93959F] mt-1">{user.email}</Text>
                      <Text className="text-sm text-[#93959F] mt-1">{user.phone}</Text>
                    </>
                  )}
                </View>
              </View>

              {!isEditing && (
                <View className="mt-4 pt-4 border-t border-[#F0F0F0] flex-row">
                  <TouchableOpacity className="flex-1 items-center" onPress={() => router.push("/(tabs)/orders")}>
                    <View className="w-10 h-10 rounded-full bg-[#F8F8F8] items-center justify-center mb-1">
                      <Ionicons name="receipt-outline" size={20} color={COLORS.primary} />
                    </View>
                    <Text className="text-xs text-[#3D4152]">Orders</Text>
                  </TouchableOpacity>

                  <TouchableOpacity className="flex-1 items-center" onPress={() => setShowAddressModal(true)}>
                    <View className="w-10 h-10 rounded-full bg-[#F8F8F8] items-center justify-center mb-1">
                      <Ionicons name="location-outline" size={20} color={COLORS.primary} />
                    </View>
                    <Text className="text-xs text-[#3D4152]">Addresses</Text>
                  </TouchableOpacity>

                  <TouchableOpacity className="flex-1 items-center" onPress={() => setShowPaymentModal(true)}>
                    <View className="w-10 h-10 rounded-full bg-[#F8F8F8] items-center justify-center mb-1">
                      <Ionicons name="card-outline" size={20} color={COLORS.primary} />
                    </View>
                    <Text className="text-xs text-[#3D4152]">Payments</Text>
                  </TouchableOpacity>

                  <TouchableOpacity className="flex-1 items-center" onPress={() => setShowPreferencesModal(true)}>
                    <View className="w-10 h-10 rounded-full bg-[#F8F8F8] items-center justify-center mb-1">
                      <Ionicons name="settings-outline" size={20} color={COLORS.primary} />
                    </View>
                    <Text className="text-xs text-[#3D4152]">Settings</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>

        {/* Addresses Section */}
        <Animated.View
          className="mx-4 mb-6 mt-6"
          style={{
            opacity: addressesAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-bold text-[#3D4152]">Saved Addresses</Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setShowAddressModal(true)
              }}
              className="px-3 py-1 rounded-full bg-[#F8F8F8]"
            >
              <Text className="text-sm text-[#3D4152]">View All</Text>
            </TouchableOpacity>
          </View>

          {user.addresses.slice(0, 1).map((address) => (
            <View
              key={address.id}
              className="bg-white rounded-2xl p-4 mb-2 flex-row items-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: COLORS.lightGray }}
              >
                <Ionicons name={address.type === "Home" ? "home" : "briefcase"} size={20} color={COLORS.primary} />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="font-bold text-[#3D4152]">{address.type}</Text>
                  {address.default && (
                    <View className="ml-2 px-2 py-0.5 rounded bg-[#F8F8F8]">
                      <Text className="text-xs text-[#93959F]">Default</Text>
                    </View>
                  )}
                </View>
                <Text className="text-sm text-[#93959F] mt-1" numberOfLines={2}>
                  {address.address}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  // Edit address
                }}
                className="p-2"
              >
                <Feather name="edit" size={18} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>
          ))}

          {user.addresses.length > 1 && (
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setShowAddressModal(true)
              }}
              className="mt-2"
            >
              <Text className="text-sm text-[#FC8019]">+{user.addresses.length - 1} more addresses</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Payment Methods Section */}
        <Animated.View
          className="mx-4 mb-6"
          style={{
            opacity: paymentsAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-bold text-[#3D4152]">Payment Methods</Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setShowPaymentModal(true)
              }}
              className="px-3 py-1 rounded-full bg-[#F8F8F8]"
            >
              <Text className="text-sm text-[#3D4152]">View All</Text>
            </TouchableOpacity>
          </View>

          {user.paymentMethods.slice(0, 1).map((payment) => (
            <View
              key={payment.id}
              className="bg-white rounded-2xl p-4 mb-2 flex-row items-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: COLORS.lightGray }}
              >
                <Ionicons name={payment.type === "Credit Card" ? "card" : "wallet"} size={20} color={COLORS.primary} />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="font-bold text-[#3D4152]">{payment.type}</Text>
                  {payment.default && (
                    <View className="ml-2 px-2 py-0.5 rounded bg-[#F8F8F8]">
                      <Text className="text-xs text-[#93959F]">Default</Text>
                    </View>
                  )}
                </View>
                <Text className="text-sm text-[#93959F] mt-1">{payment.name}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  // Edit payment method
                }}
                className="p-2"
              >
                <Feather name="edit" size={18} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>
          ))}

          {user.paymentMethods.length > 1 && (
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setShowPaymentModal(true)
              }}
              className="mt-2"
            >
              <Text className="text-sm text-[#FC8019]">+{user.paymentMethods.length - 1} more payment methods</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Account Settings */}
        <View className="mx-4 mb-6">
          <Text className="text-base font-bold mb-3 text-[#3D4152]">Account Settings</Text>
          <View
            className="bg-white rounded-2xl overflow-hidden"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            {MENU_ITEMS.map((item, index) => (
              <Animated.View
                key={item.id}
                style={{
                  opacity: menuItemAnimations[index],
                  transform: [
                    {
                      translateX: menuItemAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
                      }),
                    },
                  ],
                }}
              >
                <TouchableOpacity
                  onPress={() => handleMenuItemPress(item)}
                  className={`p-4 flex-row items-center justify-between ${index < MENU_ITEMS.length - 1 ? "border-b border-[#F0F0F0]" : ""
                    }`}
                >
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-[#F8F8F8]">
                      <Ionicons name={item.icon} size={20} color={COLORS.primary} />
                    </View>
                    <Text className="text-[#3D4152] font-medium">{item.title}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Preferences Section */}
        <Animated.View
          className="mx-4 mb-6"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text className="text-base font-bold mb-3 text-[#3D4152]">Preferences</Text>
          <View
            className="bg-white rounded-2xl p-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-[#F8F8F8]">
                  <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
                </View>
                <Text className="text-[#3D4152] font-medium">Push Notifications</Text>
              </View>
              <Switch
                trackColor={{ false: "#D4D5D9", true: COLORS.accent }}
                thumbColor={preferences.notifications.pushNotifications ? "#fff" : "#f4f3f4"}
                ios_backgroundColor="#D4D5D9"
                onValueChange={() => handleTogglePreference("notifications", "pushNotifications")}
                value={preferences.notifications.pushNotifications}
              />
            </View>

            <View className="flex-row justify-between items-center mb-1">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-[#F8F8F8]">
                  <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
                </View>
                <Text className="text-[#3D4152] font-medium">Email Notifications</Text>
              </View>
              <Switch
                trackColor={{ false: "#D4D5D9", true: COLORS.accent }}
                thumbColor={preferences.notifications.emailNotifications ? "#fff" : "#f4f3f4"}
                ios_backgroundColor="#D4D5D9"
                onValueChange={() => handleTogglePreference("notifications", "emailNotifications")}
                value={preferences.notifications.emailNotifications}
              />
            </View>
          </View>
        </Animated.View>

        {/* Logout Button */}
        <View className="mx-4 mb-10">
          <TouchableOpacity
            onPress={handleLogout}
            className="rounded-2xl overflow-hidden"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <LinearGradient
              colors={["#E23744", "#FF5A5F", "#FF7B7F"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="p-4 flex-row items-center justify-center"
            >
              <Ionicons name="log-out-outline" size={20} color="white" />
              <Text className="ml-2 text-white font-medium">Logout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Address Modal */}
      <Modal
        visible={showAddressModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddressModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className="bg-white rounded-t-3xl p-5"
            style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }}
          >
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-xl font-bold text-[#3D4152]">Saved Addresses</Text>
              <TouchableOpacity onPress={() => setShowAddressModal(false)} className="p-2">
                <Ionicons name="close" size={24} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            {user.addresses.map((address) => (
              <View
                key={address.id}
                className="bg-white rounded-2xl p-4 mb-4 flex-row items-center border border-[#F0F0F0]"
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: COLORS.lightGray }}
                >
                  <Ionicons name={address.type === "Home" ? "home" : "briefcase"} size={20} color={COLORS.primary} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="font-bold text-[#3D4152]">{address.type}</Text>
                    {address.default && (
                      <View className="ml-2 px-2 py-0.5 rounded bg-[#F8F8F8]">
                        <Text className="text-xs text-[#93959F]">Default</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-sm text-[#93959F] mt-1">{address.address}</Text>
                </View>
                <View className="flex-row">
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      // Edit address
                    }}
                    className="p-2"
                  >
                    <Feather name="edit" size={18} color={COLORS.textLight} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                      // Delete address
                    }}
                    className="p-2"
                  >
                    <Feather name="trash-2" size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setShowAddressModal(false)
                // Navigate to add address
              }}
              className="mt-2 flex-row items-center justify-center p-4 rounded-xl overflow-hidden"
            >
              <LinearGradient
                colors={["#E23744", "#FF5A5F", "#FF7B7F"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="absolute top-0 left-0 right-0 bottom-0"
              />
              <Ionicons name="add" size={20} color="white" />
              <Text className="ml-2 text-white font-medium">Add New Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Payment Methods Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className="bg-white rounded-t-3xl p-5"
            style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }}
          >
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-xl font-bold text-[#3D4152]">Payment Methods</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)} className="p-2">
                <Ionicons name="close" size={24} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            {user.paymentMethods.map((payment) => (
              <View
                key={payment.id}
                className="bg-white rounded-2xl p-4 mb-4 flex-row items-center border border-[#F0F0F0]"
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: COLORS.lightGray }}
                >
                  <Ionicons
                    name={payment.type === "Credit Card" ? "card" : "wallet"}
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="font-bold text-[#3D4152]">{payment.type}</Text>
                    {payment.default && (
                      <View className="ml-2 px-2 py-0.5 rounded bg-[#F8F8F8]">
                        <Text className="text-xs text-[#93959F]">Default</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-sm text-[#93959F] mt-1">{payment.name}</Text>
                </View>
                <View className="flex-row">
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      // Edit payment
                    }}
                    className="p-2"
                  >
                    <Feather name="edit" size={18} color={COLORS.textLight} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                      // Delete payment
                    }}
                    className="p-2"
                  >
                    <Feather name="trash-2" size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setShowPaymentModal(false)
                // Navigate to add payment
              }}
              className="mt-2 flex-row items-center justify-center p-4 rounded-xl overflow-hidden"
            >
              <LinearGradient
                colors={["#E23744", "#FF5A5F", "#FF7B7F"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="absolute top-0 left-0 right-0 bottom-0"
              />
              <Ionicons name="add" size={20} color="white" />
              <Text className="ml-2 text-white font-medium">Add Payment Method</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutConfirm}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowLogoutConfirm(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white rounded-2xl p-5 w-full max-w-sm">
            <Text className="text-lg font-bold text-center text-[#3D4152] mb-3">Logout</Text>
            <Text className="text-base text-center text-[#93959F] mb-5">
              Are you sure you want to logout from your account?
            </Text>

            <View className="flex-row">
              <TouchableOpacity
                onPress={() => setShowLogoutConfirm(false)}
                className="flex-1 p-3 rounded-xl mr-2 bg-[#F8F8F8]"
              >
                <Text className="text-center font-medium text-[#3D4152]">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={confirmLogout} className="flex-1 p-3 rounded-xl ml-2 overflow-hidden">
                <LinearGradient
                  colors={["#E23744", "#FF5A5F", "#FF7B7F"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="absolute top-0 left-0 right-0 bottom-0"
                />
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-center font-medium text-white">Logout</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}
