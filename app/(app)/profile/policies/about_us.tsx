"use client"

import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native"
import { MaterialIcons, FontAwesome, Ionicons } from "@expo/vector-icons"
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

export default function AboutUs() {
  const features = [
    {
      title: "Instant Bookings",
      description: "Seamless salon appointments in just a few taps",
      icon: "clock-o",
      iconType: FontAwesome,
    },
    {
      title: "Top-rated Salons",
      description: "Access to premium grooming services",
      icon: "star",
      iconType: Ionicons,
    },
    {
      title: "Real-time Availability",
      description: "Zero-wait convenience at your fingertips",
      icon: "calendar-times-o",
      iconType: FontAwesome,
    },
    {
      title: "Exclusive Deals",
      description: "Special offers to elevate your experience",
      icon: "tag",
      iconType: FontAwesome,
    },
  ]

  const contactMethods = [
    {
      type: "Address",
      value: "P.NO 97, Dakshinpuri, Shri Kishanpura",
      icon: "location-on",
      action: () => Linking.openURL("https://maps.google.com/?q=P.NO+97,+Dakshinpuri,+Shri+Kishanpura"),
    },
    {
      type: "Email",
      value: "info@sustylo.com",
      icon: "email",
      action: () => Linking.openURL("mailto:info@sustylo.com"),
    },
    {
      type: "Phone",
      value: "+91-7297026119",
      icon: "phone",
      action: () => Linking.openURL("tel:+917297026119"),
    },
    {
      type: "Website",
      value: "www.sustylo.com",
      icon: "public",
      action: () => Linking.openURL("https://www.sustylo.com"),
    },
  ]

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>

      <ScrollView className="flex-1" style={{ backgroundColor: colors.background }}>
        {/* Hero Section */}
        <View className="p-6 pb-8" style={{ backgroundColor: colors.primary }}>
          <Text className="text-3xl font-bold mb-2" style={{ color: "white" }}>
            About Su Stylo
          </Text>
          <Text className="text-lg" style={{ color: colors.tertiaryLight }}>
            Revolutionizing salon experiences since 2025
          </Text>
        </View>

        {/* Main Content */}
        <View className="px-6 -mt-6">
          {/* Intro Card */}
          <View
            className="rounded-xl p-6 mb-6"
            style={{
              backgroundColor: colors.cardBg,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text className="text-base leading-6" style={{ color: colors.textLight }}>
              Su Stylo is your go-to destination for spontaneous salon appointments and premium grooming services.
              Founded in 2025, we are on a mission to revolutionize the salon industry by combining style, convenience,
              and top-notch customer care.
            </Text>
            <Text className="mt-4 text-base leading-6" style={{ color: colors.textLight }}>
              We understand that life can be hectic, and self-care often gets pushed aside. That's why we created Su
              Stylo – a platform designed to make grooming effortless and accessible.
            </Text>
          </View>

          {/* What We Offer */}
          <View className="mb-8">
            <Text className="text-xl font-bold mb-4" style={{ color: colors.text }}>
              What We Offer
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {features.map((feature, index) => {
                const Icon = feature.iconType
                return (
                  <View
                    key={index}
                    className="w-[48%] rounded-lg p-4 mb-4"
                    style={{
                      backgroundColor: colors.cardBg,
                      shadowColor: colors.primary,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  >
                    <Icon name={feature.icon} size={24} color={colors.primary} />
                    <Text className="font-semibold mt-2" style={{ color: colors.text }}>
                      {feature.title}
                    </Text>
                    <Text className="text-sm mt-1" style={{ color: colors.textLight }}>
                      {feature.description}
                    </Text>
                  </View>
                )
              })}
            </View>
          </View>

          {/* Mission & Vision */}
          <View className="mb-8">
            <View
              className="rounded-xl p-5 mb-4 border"
              style={{
                backgroundColor: colors.tertiaryLight,
                borderColor: colors.tertiary,
              }}
            >
              <Text className="font-bold mb-2" style={{ color: colors.primary }}>
                Our Mission
              </Text>
              <Text style={{ color: colors.text }}>
                To empower salon owners and customers alike by making grooming services seamless, accessible, and
                hassle-free. We aim to redefine self-care as an experience, not just a service.
              </Text>
            </View>
            <View
              className="rounded-xl p-5 border"
              style={{
                backgroundColor: colors.tertiaryLight,
                borderColor: colors.tertiary,
              }}
            >
              <Text className="font-bold mb-2" style={{ color: colors.primary }}>
                Our Vision
              </Text>
              <Text style={{ color: colors.text }}>
                We envision transforming how India experiences salon and grooming services. Through cutting-edge
                technology and a customer-first approach, we help local salons grow while making beauty and wellness
                effortlessly available to everyone.
              </Text>
            </View>
          </View>

          {/* Company Info */}
          <View
            className="rounded-xl p-5 mb-8"
            style={{
              backgroundColor: colors.cardBg,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text className="font-bold mb-2" style={{ color: colors.text }}>
              Developed & Managed By
            </Text>
            <Text className="mb-1" style={{ color: colors.textLight }}>
              Su Stylo Salon
            </Text>
            <Text className="text-sm" style={{ color: colors.textLighter }}>
              Registered in India
            </Text>
          </View>

          {/* Contact Section */}
          <View className="mb-8">
            <Text className="text-xl font-bold mb-4" style={{ color: colors.text }}>
              Contact Us
            </Text>
            <Text className="mb-4" style={{ color: colors.textLight }}>
              Have questions or feedback? We're here to help.
            </Text>
            <View
              className="rounded-xl p-1 overflow-hidden"
              style={{
                backgroundColor: colors.cardBg,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              {contactMethods.map((method, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={method.action}
                  className="flex-row items-center p-4"
                  style={{
                    borderBottomWidth: index !== contactMethods.length - 1 ? 1 : 0,
                    borderBottomColor: colors.divider,
                  }}
                >
                  <MaterialIcons name={method.icon} size={24} color={colors.primary} style={{ marginRight: 16 }} />
                  <View>
                    <Text className="text-xs" style={{ color: colors.textLighter }}>
                      {method.type}
                    </Text>
                    <Text style={{ color: colors.text }}>{method.value}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Footer CTA */}
          <View
            className="rounded-xl p-6 mb-8 items-center"
            style={{
              backgroundColor: colors.primary,
            }}
          >
            <MaterialIcons name="spa" size={32} color="white" />
            <Text className="text-xl font-bold mt-3 text-center" style={{ color: "white" }}>
              Style & Grooming, Just a Tap Away
            </Text>
            <Text className="mt-2 text-center" style={{ color: colors.tertiaryLight }}>
              Discover the joy of stress-free beauty care — anytime, anywhere.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
