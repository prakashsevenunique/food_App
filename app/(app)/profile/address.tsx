import { useRef, useState, useEffect, useContext } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  Dimensions,
} from "react-native"
import * as Location from "expo-location"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { router } from "expo-router"
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
  success: "#4CAF50", // Green for success messages
  error: "#EF4444", // Red for error messages
  verified: "#38bdf8", // Blue for verification
}

export default function AddressPicker() {
  const [selectedAddress, setSelectedAddress] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [inputLayout, setInputLayout] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const { location, setlocation } = useContext(UserContext) as any
  const searchTimeoutRef = useRef(null)
  const inputRef = useRef(null)
  const searchContainerRef = useRef(null)
  const screenHeight = Dimensions.get("window").height

  useEffect(() => {
    fetchCurrentAddress()
  }, [])

  const fetchCurrentAddress = async () => {
    try {
      const result = await Location.reverseGeocodeAsync(location)
      if (result.length > 0) {
        const address = `${result[0].name}, ${result[0].street}, ${result[0].city}, ${result[0].region}, ${result[0].country}`
        setSelectedAddress(address)
      }
    } catch (error) {
      setSelectedAddress("Address not found")
    }
  }

  const handleSearch = async (query) => {
    if (query.length < 3) {
      setSearchResults([])
      return
    }

    setIsSearching(true)

    try {
      const apiKey = "AIzaSyCklkVV3ho7yawqRP-imgtd1OtfbrH_akU"
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          query,
        )}&key=${apiKey}&components=country:in`,
      )
      const data = await response.json()

      if (data.predictions) {
        setSearchResults(data.predictions)
      }
    } catch (error) {
      console.error("Error searching address:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddressSelect = async (placeId) => {
    try {
      const apiKey = "AIzaSyCklkVV3ho7yawqRP-imgtd1OtfbrH_akU"
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`,
      )
      const data = await response.json()

      if (data.result) {
        const { lat, lng } = data.result.geometry.location
        const address = data.result.formatted_address
        setSearchQuery("")
        setSelectedAddress(address)
        setSearchResults([])

        const newLocation = {
          latitude: lat,
          longitude: lng,
        }

        setSelectedLocation(newLocation)
        setlocation(newLocation)
        Keyboard.dismiss()
      }
    } catch (error) {
      console.error("Error fetching place details:", error.response)
    }
  }

  const debouncedSearch = (query) => {
    setSearchQuery(query)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(query)
    }, 300)
  }

  const measureInputPosition = () => {
    if (searchContainerRef.current) {
      searchContainerRef.current.measure((x, y, width, height, pageX, pageY) => {
        setInputLayout({ x: pageX, y: pageY, width, height })
      })
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
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
        <View className="py-1" style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 12, color: colors.text }}>My Address</Text>
          </View>
        </View>
      </View>

      <View style={{ padding: 16 }}>
        <View ref={searchContainerRef} onLayout={measureInputPosition} style={{ position: "relative", zIndex: 50 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.divider,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor: colors.cardBg,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <Ionicons name="search-outline" size={20} color={colors.textLight} />
            <TextInput
              ref={inputRef}
              style={{
                marginLeft: 8,
                flex: 1,
                paddingVertical: 14,
                color: colors.text,
              }}
              placeholder="Search city, place..."
              placeholderTextColor={colors.textLighter}
              value={searchQuery}
              onChangeText={debouncedSearch}
              onSubmitEditing={() => handleSearch(searchQuery)}
              onFocus={measureInputPosition}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("")
                  setSearchResults([])
                }}
              >
                <Ionicons name="close-circle" size={20} color={colors.textLight} />
              </TouchableOpacity>
            )}
            {isSearching && <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 8 }} />}
          </View>
          {searchResults.length > 0 && (
            <View
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                backgroundColor: colors.cardBg,
                borderRadius: 8,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
                borderWidth: 1,
                borderColor: colors.divider,
                marginTop: 4,
                top: "100%",
                maxHeight: Math.min(700, screenHeight - inputLayout.y - inputLayout.height - 150),
                zIndex: 1000,
              }}
            >
              <ScrollView showsVerticalScrollIndicator={true} scrollEnabled={true}>
                {searchResults.map((item) => (
                  <TouchableOpacity
                    key={item.place_id}
                    style={{
                      padding: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.divider,
                      flexDirection: "row",
                      alignItems: "flex-start",
                    }}
                    onPress={() => handleAddressSelect(item.place_id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="location-outline" size={20} color={colors.primary} style={{ marginTop: 4 }} />
                    <View style={{ marginLeft: 8, flex: 1 }}>
                      <Text style={{ fontWeight: "500", color: colors.text }}>
                        {item.structured_formatting.main_text}
                      </Text>
                      <Text style={{ color: colors.textLight, fontSize: 14, marginTop: 2 }}>
                        {item.structured_formatting.secondary_text}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
            backgroundColor: colors.cardBg,
            marginTop: 16,
            borderRadius: 8,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 1,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.tertiaryLight,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="location" size={20} color={colors.primary} />
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ fontWeight: "600", color: colors.text }}>Current Location</Text>
            <Text style={{ color: colors.textLight, marginTop: 4 }} numberOfLines={2}>
              {selectedAddress || "Fetching address..."}
            </Text>
          </View>
        </TouchableOpacity>

        {selectedLocation && (
          <View
            style={{
              marginTop: 24,
              padding: 16,
              backgroundColor: colors.cardBg,
              borderRadius: 8,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <MaterialIcons name="location-pin" size={20} color={colors.primary} />
              <Text style={{ fontWeight: "bold", color: colors.text, marginLeft: 4 }}>Selected Location</Text>
            </View>
            <Text style={{ color: colors.textLight, marginTop: 4 }}>{selectedAddress}</Text>
          </View>
        )}
      </View>
    </View>
  )
}
