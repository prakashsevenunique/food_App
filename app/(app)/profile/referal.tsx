"use client"

import { useContext } from "react"
import { View, Text, TouchableOpacity, ScrollView, Image, Share, Linking, Alert } from "react-native"
import { router } from "expo-router"
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons"
import { UserContext } from "@/hooks/userInfo"
import * as Clipboard from "expo-clipboard"

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

export default function ReferAndEarnScreen() {
  const { userInfo } = useContext(UserContext) as any
  const referralLink = `https://play.google.com/store/apps/details?id=finunique.sustylo.app?code=${userInfo?.referralCode}`

  const handleShare = async () => {
    try {
      const message = `Hey! Use my referral code ${userInfo?.referralCode} to get ₹100 off on our app. Sign up using this link: ${referralLink}`
      await Share.share({
        message,
        title: "Get ₹100 off on our app!",
      })
    } catch (error) {
      console.error("Error sharing:", error.message)
    }
  }

  const handleCopyCode = () => {
    const referralCode = userInfo?.referralCode // Example referral code, replace with your actual code
    Clipboard.setString(referralCode) // Copy to clipboard
    Alert.alert("Referral code copied to clipboard!") // Show alert
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View
        className="px-4 py-4"
        style={{
          backgroundColor: colors.cardBg,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={25} color={colors.primary} />
            </TouchableOpacity>
            <Text className="text-lg font-bold ml-3" style={{ color: colors.text }}>
              Refer & Earn
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="p-4">
        {/* Hero Section */}
        <View className="rounded-xl p-6 items-center mb-6" style={{ backgroundColor: colors.tertiaryLight }}>
          <Image
            source={{ uri: "https://cdn-icons-png.flaticon.com/512/3132/3132693.png" }}
            className="w-32 h-32 mb-4"
          />
          <Text className="text-2xl font-bold mb-2" style={{ color: colors.primary }}>
            Earn ₹100 for each friend!
          </Text>
          <Text className="text-center" style={{ color: colors.text }}>
            Invite your friends to join and get ₹100 in your wallet for every successful referral.
          </Text>
        </View>

        {/* How it works */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-3" style={{ color: colors.text }}>
            How it works
          </Text>

          <View className="flex-row mb-4">
            <View
              className="w-8 h-8 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: colors.primaryLighter }}
            >
              <Text style={{ color: colors.primary, fontWeight: "bold" }}>1</Text>
            </View>
            <View className="flex-1">
              <Text className="font-semibold" style={{ color: colors.text }}>
                Share your referral code
              </Text>
              <Text style={{ color: colors.textLight }}>Share your code with friends via WhatsApp, SMS, etc.</Text>
            </View>
          </View>

          <View className="flex-row mb-4">
            <View
              className="w-8 h-8 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: colors.secondaryLight }}
            >
              <Text style={{ color: colors.primary, fontWeight: "bold" }}>2</Text>
            </View>
            <View className="flex-1">
              <Text className="font-semibold" style={{ color: colors.text }}>
                Friend signs up
              </Text>
              <Text style={{ color: colors.textLight }}>Your friend signs up using your referral code</Text>
            </View>
          </View>

          <View className="flex-row">
            <View
              className="w-8 h-8 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: colors.tertiaryLight }}
            >
              <Text style={{ color: colors.primary, fontWeight: "bold" }}>3</Text>
            </View>
            <View className="flex-1">
              <Text className="font-semibold" style={{ color: colors.text }}>
                Your friend will get reward of ₹100 on Signin
              </Text>
              <Text style={{ color: colors.textLight }}>You get ₹100 when they complete their first order</Text>
            </View>
          </View>
        </View>

        {/* Your Referral Code */}
        <View
          className="p-4 rounded-xl mb-6"
          style={{
            backgroundColor: colors.cardBg,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 1,
          }}
        >
          <Text style={{ color: colors.textLight, marginBottom: 8 }}>Your referral code</Text>
          <View className="flex-row justify-between items-center">
            <Text className="text-2xl font-bold" style={{ color: colors.text }}>
              {userInfo?.referralCode}
            </Text>
            <TouchableOpacity
              onPress={handleCopyCode}
              className="flex-row items-center px-3 py-2 rounded-lg"
              style={{ backgroundColor: colors.tertiaryLight }}
            >
              <Feather name="copy" size={16} color={colors.primary} />
              <Text className="ml-1" style={{ color: colors.primary }}>
                Copy
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Share Options */}
        <View className="mb-8">
          <Text className="text-lg font-bold mb-3" style={{ color: colors.text }}>
            Share via
          </Text>
          <View className="flex-row justify-between">
            <TouchableOpacity onPress={handleShare} className="items-center w-1/5">
              <View className="p-3 rounded-full" style={{ backgroundColor: colors.tertiaryLight }}>
                <Feather name="share-2" size={24} color={colors.primary} />
              </View>
              <Text className="mt-1 text-xs" style={{ color: colors.textLight }}>
                Other
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  `whatsapp://send?text=Use my referral code ${userInfo?.referralCode} to get ₹100 off! ${referralLink}`,
                )
              }
              className="items-center w-1/5"
            >
              <View className="p-3 rounded-full" style={{ backgroundColor: colors.tertiaryLight }}>
                <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
              </View>
              <Text className="mt-1 text-xs" style={{ color: colors.textLight }}>
                WhatsApp
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  `sms:?body=Use my referral code ${userInfo?.referralCode} to get ₹100 off! ${referralLink}`,
                )
              }
              className="items-center w-1/5"
            >
              <View className="p-3 rounded-full" style={{ backgroundColor: colors.tertiaryLight }}>
                <MaterialIcons name="sms" size={24} color="#2196F3" />
              </View>
              <Text className="mt-1 text-xs" style={{ color: colors.textLight }}>
                SMS
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  `mailto:?subject=Get ₹100 off!&body=Use my referral code ${userInfo?.referralCode} to get ₹100 off! ${referralLink}`,
                )
              }
              className="items-center w-1/5"
            >
              <View className="p-3 rounded-full" style={{ backgroundColor: colors.tertiaryLight }}>
                <MaterialIcons name="email" size={24} color="#EA4335" />
              </View>
              <Text className="mt-1 text-xs" style={{ color: colors.textLight }}>
                Email
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Terms and Conditions */}
        <View
          className="p-4 rounded-xl mb-6"
          style={{
            backgroundColor: colors.cardBg,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 1,
          }}
        >
          <Text className="font-bold mb-2" style={{ color: colors.text }}>
            Terms & Conditions
          </Text>
          <Text className="text-xs" style={{ color: colors.textLight }}>
            - Offer valid for new users only{"\n"}- Both referrer and referee will receive ₹100 after the first
            successful order{"\n"}- Reward will be credited within 24 hours of order completion{"\n"}- Maximum 10
            referrals per user{"\n"}- Company reserves the right to modify or terminate this program
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}
