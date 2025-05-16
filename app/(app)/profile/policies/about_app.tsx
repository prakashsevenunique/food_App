"use client"

import { View, Text, ScrollView, TouchableOpacity, Linking, Image } from "react-native"
import { MaterialIcons, Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"

// Su stylo Salon color palette
const colors = {
  primary: "#E65305", // Bright red-orange as primary
  primaryLight: "#FF7A3D", // Lighter version of primary
  primaryLighter: "#FFA273", // Even lighter version
  secondary: "#FBA059", // Light orange as secondary
  secondaryLight: "#FFC59F", // Lighter version of secondary
  accent: "#FB8807", // Bright orange as accent
  accentLight: "#FFAA4D", // Lighter version of accent
  tertiary: "#F4A36C", // Peach/salmon as tertiary
  tertiaryLight: "#FFD0B0", // Lighter version of tertiary
  background: "#FFF9F5", // Very light orange/peach background
  cardBg: "#FFFFFF", // White for cards
  text: "#3D2C24", // Dark brown for text
  textLight: "#7D6E66", // Lighter text color
  textLighter: "#A99E98", // Even lighter text
  divider: "#FFE8D6", // Very light divider color
}

export default function AboutApp() {
  const permissions = [
    {
      title: "Location",
      types: "ACCESS_FINE_LOCATION / ACCESS_COARSE_LOCATION",
      purpose: "Show nearby salons and provide location-based recommendations",
      usage: "Detects your current location to display nearby salons and offers",
      icon: "location-on",
    },
    {
      title: "Camera & Photos",
      types: "CAMERA / READ_EXTERNAL_STORAGE / WRITE_EXTERNAL_STORAGE",
      purpose: "Upload profile pictures or salon service images",
      usage: "Only when you choose to upload an image or take a photo",
      icon: "camera-alt",
    },
    {
      title: "Notifications",
      types: "POST_NOTIFICATIONS",
      purpose: "Send booking updates, reminders, and offers",
      usage: "Keeps you informed about appointments and new features",
      icon: "notifications",
    },
    {
      title: "Phone/Contacts (Optional)",
      types: "READ_CONTACTS (if implemented)",
      purpose: "Quick profile setup and referrals",
      usage: "Never accessed without your explicit permission",
      icon: "contacts",
    },
  ]

  const features = [
    {
      title: "Salon Discovery",
      description: "Find and book top-rated salons near you",
      icon: "search",
    },
    {
      title: "Easy Booking",
      description: "Schedule appointments in just a few taps",
      icon: "calendar-today",
    },
    {
      title: "Secure Payments",
      description: "Multiple payment options with complete security",
      icon: "payment",
    },
    {
      title: "Real-time Updates",
      description: "Instant notifications about your appointments",
      icon: "notifications-active",
    },
  ]

  const openPrivacyPolicy = () => {
    Linking.openURL("https://sustylo.com/privacy")
  }

  const contactSupport = () => {
    Linking.openURL("mailto:support@sustylo.com")
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View
        className="px-4 py-4 flex-row items-center"
        style={{
          backgroundColor: colors.cardBg,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text className="text-lg font-bold ml-3" style={{ color: colors.text }}>
          About App
        </Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* App Header */}
        <View className="items-center mb-6">
          <Image source={require("@/assets/img/logo.png")} className="w-24 h-24 rounded-full mb-3" />
          <Text className="text-2xl font-bold" style={{ color: colors.primary }}>
            SuStylo
          </Text>
          <Text style={{ color: colors.textLight }}>Version 1.0.0</Text>
        </View>

        {/* App Description */}
        <View
          className="p-4 rounded-lg mb-6"
          style={{
            backgroundColor: colors.cardBg,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 1,
          }}
        >
          <Text className="text-lg font-semibold mb-2" style={{ color: colors.text }}>
            About SuStylo
          </Text>
          <Text style={{ color: colors.textLight }}>
            Su Stylo is your premier salon booking platform, connecting beauty enthusiasts with top-rated salons and
            stylists. Our mission is to make salon services accessible, convenient, and delightful for everyone.
          </Text>
        </View>

        {/* Key Features */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
            Key Features
          </Text>
          {features.map((feature, index) => (
            <View
              key={index}
              className="flex-row items-start mb-3 p-3 rounded-lg"
              style={{
                backgroundColor: colors.cardBg,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
              }}
            >
              <MaterialIcons name={feature.icon} size={24} color={colors.primary} style={{ marginRight: 12 }} />
              <View className="flex-1">
                <Text className="font-medium" style={{ color: colors.text }}>
                  {feature.title}
                </Text>
                <Text style={{ color: colors.textLight }}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Permissions Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
            App Permissions
          </Text>
          <View
            className="p-3 rounded-lg mb-4"
            style={{
              backgroundColor: colors.cardBg,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <Text style={{ color: colors.textLight }}>
              To provide the best experience, we may request certain device permissions. These are used solely for app
              functionality and your benefit.
            </Text>
          </View>
          {permissions.map((perm, index) => (
            <View
              key={index}
              style={{
                flex: 1,
                marginBottom: 12,
                backgroundColor: colors.cardBg,
                padding: 12,
                borderRadius: 8,
                shadowColor: colors.primary,
                shadowOpacity: 0.05,
                shadowRadius: 3,
                shadowOffset: { width: 0, height: 1 },
                elevation: 1,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 8 }}>
                <MaterialIcons name={perm.icon} size={24} color={colors.primary} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "600", color: colors.text, overflow: "hidden" }}>{perm.title}</Text>
                  <Text style={{ color: colors.textLight, fontSize: 12, overflow: "hidden" }}>{perm.types}</Text>
                </View>
              </View>

              <View style={{ marginLeft: 36 }}>
                <View>
                  <Text style={{ fontWeight: "500", color: colors.text, marginRight: 4 }}>Purpose:</Text>
                  <Text style={{ color: colors.textLight, flexWrap: "wrap" }}>{perm.purpose}</Text>
                </View>
                <View>
                  <Text style={{ fontWeight: "500", color: colors.text, marginRight: 4 }}>Usage:</Text>
                  <Text style={{ color: colors.textLight, flexWrap: "wrap" }}>{perm.usage}</Text>
                </View>
              </View>
            </View>
          ))}

          <View
            className="p-3 rounded-lg mt-3"
            style={{
              backgroundColor: colors.cardBg,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <Text className="font-medium mb-1" style={{ color: colors.text }}>
              Your Control
            </Text>
            <Text style={{ color: colors.textLight }}>
              You can manage these permissions anytime in your device settings. We never collect sensitive data without
              your explicit consent.
            </Text>
          </View>
        </View>
        <View className="items-center mb-12">
          <Text style={{ color: colors.textLighter, fontSize: 12 }}>© 2025 SuStylo. All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  )
}
