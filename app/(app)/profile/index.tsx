import { View, Text, Image, TouchableOpacity, ScrollView, RefreshControl } from "react-native"
import { router } from "expo-router"
import { Ionicons, Feather, FontAwesome } from "@expo/vector-icons"
import { useContext, useState } from "react"
import { UserContext } from "@/hooks/userInfo"
import { imageBaseUrl } from "@/utils/helpingData"

// Su stylo Salon color palette - lighter shades
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
  verified: "#4FC3F7", // Sky blue for verification icon
}

export default function ProfileScreen() {
  const [refreshing, setRefreshing] = useState(false)
  const { userInfo, fetchUserInfo } = useContext(UserContext) as any

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchUserInfo()
    setRefreshing(false)
  }

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
          borderBottomWidth: 1,
          borderBottomColor: colors.divider,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons onPress={() => router.back()} name="arrow-back" size={25} color={colors.primary} />
            <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 12, color: colors.text }}>My Profile</Text>
          </View>
          <TouchableOpacity className="mr-2" onPress={() => router.push("/notification")}>
            <Ionicons name="notifications-outline" size={25} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        style={{ padding: 16 }}
      >
        <View style={{ alignItems: "center", marginTop: 4 }}>
          <View
            style={{
              position: "relative",
              borderWidth: 2,
              borderRadius: 9999,
              borderColor: colors.tertiary,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Image
              source={{
                uri: userInfo?.profilePhoto
                  ? `${imageBaseUrl}/${userInfo?.profilePhoto}`
                  : "https://static.vecteezy.com/system/resources/thumbnails/035/857/779/small/people-face-avatar-icon-cartoon-character-png.png",
              }}
              style={{ width: 96, height: 96, borderRadius: 9999 }}
            />
            <TouchableOpacity
              onPress={() => router.push("/(app)/profile/edit")}
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                backgroundColor: colors.primary,
                padding: 8,
                borderRadius: 9999,
                borderWidth: 1,
                borderColor: colors.cardBg,
              }}
            >
              <Feather name="edit-2" size={14} color="white" />
            </TouchableOpacity>
          </View>
          <Text
            style={{
              marginTop: 8,
              color: colors.primary,
              fontSize: 18,
              fontWeight: "600",
            }}
          >
            {userInfo?.name || "Your Name"}
          </Text>
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="checkmark-circle" size={20} color={colors.verified} />
            <Text style={{ color: colors.textLight }}>{userInfo?.mobileNumber || "Mobile Number"}</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
            <Text style={{ color: colors.text, fontWeight: "bold" }}>Sustylo Wallet :</Text>
            <Text style={{ color: colors.text, fontWeight: "bold" }}>₹ {userInfo?.wallet?.balance || 0}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: "row", justifyContent: "space-around", gap: 4, marginTop: 24 }}>
          {[
            { name: "Notifications", icon: "bell", routes: "/notification" },
            { name: "Orders", icon: "shopping-cart", routes: "/(app)/(tabs)/bookings" },
            { name: "Settings", icon: "settings", routes: "/profile/setting" },
          ].map((item: any, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(item.routes)}
              style={{
                alignItems: "center",
                padding: 12,
                paddingVertical: 16,
                backgroundColor: colors.cardBg,
                borderRadius: 12,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
                width: "30%",
              }}
            >
              <Feather name={item.icon} size={24} color={colors.primary} />
              <Text style={{ marginTop: 4, fontSize: 12, fontWeight: "600", color: colors.text }}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Profile Sections */}
        <View style={{ marginTop: 24 }}>
          <Text style={{ color: colors.text, fontWeight: "600" }}>My Account</Text>
          {[
            { name: "My Profile", icon: "user", route: "/profile/edit" },
            { name: "My Wallet", icon: "rupes", route: "/profile/wallet" },
            { name: "Manage Address", icon: "map-pin", route: "/profile/address" },
            { name: "My Reviews", icon: "thumbs-up", route: "/profile/myReview" },
            { name: userInfo?.role == 'user'? "Be our Partner":"Dashboard", icon: "airplay", route: "/profile/dashboard" },

          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(item.route)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 20,
                backgroundColor: colors.cardBg,
                borderRadius: 12,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
                marginTop: 8,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {item.icon != "rupes" ? (
                  <Feather name={item.icon} size={20} color={colors.primary} />
                ) : (
                  <FontAwesome style={{ paddingHorizontal: 6 }} name="rupee" size={20} color={colors.primary} />
                )}
                <Text style={{ marginLeft: 12, color: colors.text, fontWeight: "500" }}>{item.name}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ marginTop: 24 }}>
          <Text style={{ color: colors.text, fontWeight: "600" }}>My Offer</Text>
          {[{ name: "Refer & Earn", icon: "user-plus", route: "/profile/referal" }].map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(item.route)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 20,
                backgroundColor: colors.cardBg,
                borderRadius: 12,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
                marginTop: 8,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Feather name={item.icon} size={20} color={colors.primary} />
                <Text style={{ marginLeft: 12, color: colors.text, fontWeight: "500" }}>{item.name}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Other Section */}
        <View style={{ marginTop: 24, marginBottom: 32 }}>
          <Text style={{ color: colors.text, fontWeight: "600" }}>Help & Support</Text>
          {[
            { name: "About App", icon: "tablet", route: "/profile/policies/about_app" },
            { name: "About Us", icon: "info", route: "/profile/policies/about_us" },
            { name: "Privacy Policy", icon: "lock", route: "/profile/policies" },
            { name: "Terms & Conditions", icon: "clipboard", route: "/profile/policies/term&condition" },
            { name: "Contact Us", icon: "help-circle", route: "/profile/raiseTicket" },
          ].map((item: any, index) => (
            <TouchableOpacity
              onPress={() => router.push(item.route)}
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 20,
                backgroundColor: colors.cardBg,
                borderRadius: 12,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
                marginTop: 8,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Feather name={item.icon} size={20} color={colors.primary} />
                <Text style={{ marginLeft: 12, color: colors.text, fontWeight: "500" }}>{item.name}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ alignItems: "center", paddingBottom: 24 }}>
          <Text style={{ color: colors.textLighter }}>App Version 1.0.0</Text>
        </View>
        {/* <View style={{ marginVertical: 32, marginTop: 24 }}>
          <TouchableOpacity
            onPress={() => console.log('Logout')}
            style={{
              backgroundColor: colors.primary,
              padding: 12,
              borderRadius: 12,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Feather name="log-out" size={20} color="white" />
            <Text style={{ marginLeft: 8, color: "white", fontWeight: "600", fontSize: 18 }}>Logout</Text>
          </TouchableOpacity>
        </View> */}
      </ScrollView>
    </View>
  )
}
