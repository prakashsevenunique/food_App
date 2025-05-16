"use client"

import { View, Text, TouchableOpacity } from "react-native"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import { useContext, useEffect, useState } from "react"
import axiosInstance from "@/utils/axiosInstance"
import { UserContext } from "@/hooks/userInfo"

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
  success: "#10B981", // Green for success
  error: "#EF4444", // Red for error
  warning: "#F59E0B", // Yellow/orange for warning
}

export default function PaymentSuccessScreen() {
  const { trxId, amount } = useLocalSearchParams()
  const [paymentStatus, setPaymentStatus] = useState("Pending")
  const { fetchUserInfo } = useContext(UserContext) as any ;
  const [paymentDetails, setPaymentDetails] = useState({
    amount: amount || 0,
    transactionId: trxId || "N/A",
    date: new Date().toLocaleString(),
    salonName: "N/A",
    service: "N/A",
    paymentMethod: "N/A",
  })

  useEffect(() => {
    if (!trxId) return

    const checkPaymentStatus = async () => {
      try {
        const response = await axiosInstance.get(`api/payment/payIn/response?reference=${trxId}`)
        const data = response.data
        if (data.status === "Approved" || data.status === "Failed") {
          fetchUserInfo()
          setPaymentStatus(data.status)
          clearInterval(intervalId)
        }
      } catch (error) {
        console.error("Error checking payment status:", error)
      }
    }
    checkPaymentStatus()
    const intervalId = setInterval(checkPaymentStatus, 15000)
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId)
      if (paymentStatus === "Pending") {
        setPaymentStatus("Pending - Timeout")
      }
    }, 180000)
    return () => {
      clearInterval(intervalId)
      clearTimeout(timeoutId)
    }
  }, [trxId])

  const handleBackToHome = () => {
    router.replace("/")
  }

  const handleViewBooking = () => {
    router.replace("/profile/wallet")
  }

  const renderStatusIcon = () => {
    switch (paymentStatus) {
      case "Approved":
        return (
          <View className="p-6 rounded-full" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)" }}>
            <MaterialCommunityIcons name="check-circle" size={70} color={colors.success} />
          </View>
        )
      case "Failed":
        return (
          <View className="p-6 rounded-full" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}>
            <MaterialCommunityIcons name="close-circle" size={70} color={colors.error} />
          </View>
        )
      default:
        return (
          <View className="p-6 rounded-full" style={{ backgroundColor: "rgba(245, 158, 11, 0.1)" }}>
            <MaterialCommunityIcons name="clock" size={70} color={colors.warning} />
          </View>
        )
    }
  }

  const renderStatusText = () => {
    switch (paymentStatus) {
      case "Approved":
        return (
          <>
            <Text className="text-2xl font-bold mt-6" style={{ color: colors.text }}>
              Payment Successful!
            </Text>
            <Text className="mt-2" style={{ color: colors.textLight }}>
              Thank you for your Payment
            </Text>
          </>
        )
      case "Failed":
        return (
          <>
            <Text className="text-2xl font-bold mt-6" style={{ color: colors.text }}>
              Payment Failed
            </Text>
            <Text className="mt-2" style={{ color: colors.textLight }}>
              Please try again
            </Text>
          </>
        )
      default:
        return (
          <>
            <Text className="text-2xl font-bold mt-6" style={{ color: colors.text }}>
              Payment Processing
            </Text>
            <Text className="mt-2" style={{ color: colors.textLight }}>
              Please wait while we confirm your payment
            </Text>
          </>
        )
    }
  }

  const renderStatusBadge = () => {
    switch (paymentStatus) {
      case "Approved":
        return (
          <View className="px-2 py-1 rounded-full" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)" }}>
            <Text className="text-xs font-medium" style={{ color: colors.success }}>
              Completed
            </Text>
          </View>
        )
      case "Failed":
        return (
          <View className="px-2 py-1 rounded-full" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}>
            <Text className="text-xs font-medium" style={{ color: colors.error }}>
              Failed
            </Text>
          </View>
        )
      default:
        return (
          <View className="px-2 py-1 rounded-full" style={{ backgroundColor: "rgba(245, 158, 11, 0.1)" }}>
            <Text className="text-xs font-medium" style={{ color: colors.warning }}>
              Pending
            </Text>
          </View>
        )
    }
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Status Illustration */}
      <View className="items-center justify-center py-12">
        {renderStatusIcon()}
        {renderStatusText()}
      </View>

      {/* Payment Details Card */}
      <View
        className="mx-4 rounded-xl p-5"
        style={{
          backgroundColor: colors.cardBg,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <View className="flex-row justify-between items-center mb-4">
          <Text className="font-bold text-lg" style={{ color: colors.text }}>
            Payment Details
          </Text>
          {renderStatusBadge()}
        </View>

        <View className="gap-y-2">
          <View className="flex-row justify-between">
            <Text style={{ color: colors.textLight }}>Amount Paid</Text>
            <Text className="font-bold" style={{ color: colors.text }}>
              ₹{paymentDetails.amount}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text style={{ color: colors.textLight }}>Transaction ID</Text>
            <Text style={{ color: colors.text }}>{paymentDetails?.transactionId?.toUpperCase()}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text style={{ color: colors.textLight }}>Date & Time</Text>
            <Text style={{ color: colors.text }}>{paymentDetails.date}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="px-4 mt-8 mb-10">
        {paymentStatus === "Approved" && (
          <TouchableOpacity
            className="rounded-full py-4 items-center justify-center mb-3"
            style={{ backgroundColor: colors.primary }}
            onPress={handleViewBooking}
          >
            <Text className="text-white font-bold">View Wallet</Text>
          </TouchableOpacity>
        )}
        {paymentStatus === "Failed" && (
          <TouchableOpacity
            className="rounded-full py-4 items-center justify-center mb-3"
            style={{ backgroundColor: colors.primary }}
            onPress={() => router.back()}
          >
            <Text className="text-white font-bold">Try Again</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className="rounded-full py-4 items-center justify-center"
          style={
            paymentStatus === "Approved"
              ? { borderWidth: 1, borderColor: colors.primary }
              : { backgroundColor: colors.primary }
          }
          onPress={handleBackToHome}
        >
          <Text className="font-bold" style={{ color: paymentStatus === "Approved" ? colors.primary : "white" }}>
            Back to Home
          </Text>
        </TouchableOpacity>
      </View>

      {/* Support Info */}
      <View className="items-center mb-6">
        <Text className="text-sm" style={{ color: colors.textLight }}>
          Need help? Contact our support
        </Text>
        <TouchableOpacity onPress={() => router.push("/profile/helpCenter")} className="flex-row items-center mt-1">
          <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.primary} />
          <Text className="ml-1" style={{ color: colors.primary }}>
            Chat with us
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
