import { useContext } from "react"
import { View, Text, TouchableOpacity } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import { useRouter } from "expo-router"
import { UserContext } from "@/hooks/userInfo"

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
}

const Header = () => {
  const router = useRouter()
  const { userInfo, city } = useContext(UserContext) as any

  return (
    <View
      style={{
        backgroundColor: colors.cardBg,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        paddingHorizontal: 14,
        paddingVertical: 14,
        zIndex: 10,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <TouchableOpacity onPress={() => router.push("/(app)/profile")}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="location" size={25} color={colors.primary} />
            <View style={{ flexDirection: "column" }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", marginLeft: 4, color: colors.text }}>
                Hi, {userInfo?.name || "User"}
              </Text>
              <Text style={{ fontSize: 10, color: colors.textLight, marginLeft: 4 }}>
                {(city && city) || "fetching.."}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center", marginRight: 8 }}>
          <TouchableOpacity onPress={() => router.push("/(app)/notification")} style={{ marginRight: 16 }}>
            <Ionicons name="notifications-outline" size={25} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/(app)/profile")}>
            <Ionicons name="person-outline" size={25} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default Header
