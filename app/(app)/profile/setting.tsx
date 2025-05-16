import React, { useContext } from "react"
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from "react-native"
import { router } from "expo-router"
import { Ionicons, MaterialIcons, AntDesign } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
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
}

export default function SettingsScreen() {
  const { setToken } = useContext(UserContext) as any;

  const settingsSections = [
    // {
    //   title: "App Settings",
    //   items: [
    //     {
    //       icon: <Ionicons name="notifications-outline" size={20} color={colors.primary} />,
    //       title: "Notifications",
    //       rightComponent: (
    //         <Switch
    //           value={notificationsEnabled}
    //           onValueChange={setNotificationsEnabled}
    //           trackColor={{ false: colors.textLighter, true: colors.primaryLight }}
    //           thumbColor={notificationsEnabled ? colors.primary : "#f4f3f4"}
    //           ios_backgroundColor={colors.divider}
    //         />
    //       ),
    //     },
    //   ],
    // },
    {
      title: "Support",
      items: [
        {
          icon: <AntDesign name="customerservice" size={20} color={colors.primary} />,
          title: "Help Center",
          action: () => router.push("/(app)/profile/helpCenter"),
        },
        {
          icon: <MaterialIcons name="contact-support" size={20} color={colors.primary} />,
          title: "Contact Us",
          action: () => router.push("/(app)/profile/raiseTicket"),
        },
      ],
    },
    {
      title: "Actions",
      items: [
        {
          icon: <MaterialIcons name="logout" size={20} color={colors.primary} />,
          title: "Logout",
          action: () => {
            Alert.alert("Logout", "Are you sure you want to logout?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Logout",
                onPress: async () => {
                  await AsyncStorage.removeItem("userData")
                  router.replace("/login")
                  setToken(null)
                },
              },
            ])
          },
        },
      ],
    },
  ]

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
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
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={27} color={colors.primary} />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginLeft: 12,
                color: colors.text,
              }}
            >
              Settings
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {settingsSections.map((section, sectionIndex) => (
          <View
            key={sectionIndex}
            style={{
              backgroundColor: colors.cardBg,
              marginHorizontal: 10,
              marginVertical: 8,
              borderRadius: 12,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 1,
              overflow: "hidden",
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                paddingHorizontal: 16,
                paddingTop: 16,
                paddingBottom: 8,
                color: colors.textLight,
              }}
            >
              {section.title}
            </Text>

            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: itemIndex !== section.items.length - 1 ? 1 : 0,
                  borderBottomColor: colors.divider,
                }}
                onPress={item.action}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ width: 24, alignItems: "center" }}>{item.icon}</View>
                  <Text style={{ marginLeft: 16, color: colors.text }}>{item.title}</Text>
                </View>

                {item.rightComponent ? (
                  item.rightComponent
                ) : (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {item.rightText && (
                      <Text style={{ color: colors.textLight, marginRight: 8 }}>{item.rightText}</Text>
                    )}
                    <MaterialIcons name="chevron-right" size={24} color={colors.textLighter} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* App Version */}
        <View style={{ alignItems: "center", paddingVertical: 24 }}>
          <Text style={{ color: colors.textLighter }}>App Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  )
}
