"use client"

import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native"
import { useForm, Controller } from "react-hook-form"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { useState } from "react"
import axiosInstance from "@/utils/axiosInstance"
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
  error: "#EF4444", // Red for errors
}

type FormData = {
  fullName: string
  email: string
  mobile: string
  message: string
}

export default function ContactUs() {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      fullName: "",
      email: "",
      mobile: "",
      message: "",
    },
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const response = await axiosInstance.post("/api/contact", {
        fullName: data.fullName,
        email: data.email,
        mobile: data.mobile,
        message: data.message,
      })
      if (response.status == 201) {
        Alert.alert("Success", "Your message has been sent successfully!")
        reset()
      }
    } catch (error) {
      console.error("Contact form error:", error)
      Alert.alert("Error", "An error occurred while sending your message")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <View
        style={{
          backgroundColor: colors.cardBg,
          paddingHorizontal: 16,
          paddingVertical: 16,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <View className="flex-row gap-2 items-center">
          <Ionicons onPress={() => router.back()} name="arrow-back" size={25} color={colors.primary} />
          <Text className="text-lg font-bold" style={{ color: colors.text }}>
            Contact Us
          </Text>
        </View>
      </View>
      <ScrollView className="flex-1 p-6" style={{ backgroundColor: colors.background }}>
        <View className="mb-8">
          <Text style={{ color: colors.textLight }}>
            Have questions or feedback? Fill out the form below and we'll get back to you soon.
          </Text>
        </View>

        {/* Full Name Field */}
        <View className="mb-4">
          <Text className="mb-1" style={{ color: colors.text }}>
            Full Name
          </Text>
          <Controller
            control={control}
            rules={{
              required: "Full name is required",
              minLength: {
                value: 3,
                message: "Name must be at least 3 characters",
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="rounded-lg p-3"
                style={{
                  backgroundColor: colors.cardBg,
                  borderWidth: 1,
                  borderColor: errors.fullName ? colors.error : colors.divider,
                  color: colors.text,
                }}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textLighter}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
            name="fullName"
          />
          {errors.fullName && (
            <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>{errors.fullName.message}</Text>
          )}
        </View>

        {/* Email Field */}
        <View className="mb-4">
          <Text className="mb-1" style={{ color: colors.text }}>
            Email Address
          </Text>
          <Controller
            control={control}
            rules={{
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="rounded-lg p-3"
                style={{
                  backgroundColor: colors.cardBg,
                  borderWidth: 1,
                  borderColor: errors.email ? colors.error : colors.divider,
                  color: colors.text,
                }}
                placeholder="Enter your email"
                placeholderTextColor={colors.textLighter}
                keyboardType="email-address"
                autoCapitalize="none"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
            name="email"
          />
          {errors.email && (
            <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>{errors.email.message}</Text>
          )}
        </View>

        {/* Mobile Field */}
        <View className="mb-4">
          <Text className="mb-1" style={{ color: colors.text }}>
            Mobile Number
          </Text>
          <Controller
            control={control}
            rules={{
              required: "Mobile number is required",
              pattern: {
                value: /^[0-9]{10}$/,
                message: "Invalid mobile number (10 digits required)",
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="rounded-lg p-3"
                style={{
                  backgroundColor: colors.cardBg,
                  borderWidth: 1,
                  borderColor: errors.mobile ? colors.error : colors.divider,
                  color: colors.text,
                }}
                placeholder="Enter your mobile number"
                placeholderTextColor={colors.textLighter}
                keyboardType="phone-pad"
                maxLength={10}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
            name="mobile"
          />
          {errors.mobile && (
            <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>{errors.mobile.message}</Text>
          )}
        </View>

        {/* Message Field */}
        <View className="mb-6">
          <Text className="mb-1" style={{ color: colors.text }}>
            Your Message
          </Text>
          <Controller
            control={control}
            rules={{
              required: "Message is required",
              minLength: {
                value: 10,
                message: "Message must be at least 10 characters",
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="rounded-lg p-3 h-32"
                style={{
                  backgroundColor: colors.cardBg,
                  borderWidth: 1,
                  borderColor: errors.message ? colors.error : colors.divider,
                  color: colors.text,
                }}
                placeholder="Type your message here..."
                placeholderTextColor={colors.textLighter}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
            name="message"
          />
          {errors.message && (
            <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>{errors.message.message}</Text>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className="p-4 rounded-lg items-center"
          style={{ backgroundColor: colors.primary }}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <View className="flex-row items-center">
            {isSubmitting ? (
              <MaterialIcons name="hourglass-empty" size={20} color="white" style={{ marginRight: 8 }} />
            ) : (
              <MaterialIcons name="send" size={20} color="white" style={{ marginRight: 8 }} />
            )}
            <Text className="text-white font-semibold">{isSubmitting ? "Sending..." : "Send Message"}</Text>
          </View>
        </TouchableOpacity>

        {/* Contact Information */}
        <View className="pb-14 pt-6" style={{ borderTopWidth: 1, borderTopColor: colors.divider }}>
          <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
            Other Ways to Reach Us
          </Text>

          <View className="flex-row items-center mb-3">
            <MaterialIcons name="email" size={20} color={colors.primary} style={{ marginRight: 12 }} />
            <Text style={{ color: colors.textLight }}>info@sustylo.com</Text>
          </View>

          <View className="flex-row items-center">
            <MaterialIcons name="phone" size={20} color={colors.primary} style={{ marginRight: 12 }} />
            <Text style={{ color: colors.textLight }}>+91-7297026119</Text>
          </View>
        </View>
      </ScrollView>
    </>
  )
}
