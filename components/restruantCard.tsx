import { useRef } from "react"
import { View, Text, Image, TouchableOpacity, Animated } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import React from "react"

// Food Delivery color palette
const COLORS = {
  primary: "#FF5A5F", // Zomato-inspired red
  secondary: "#FC8019", // Swiggy-inspired orange
  accent: "#60B246", // Green for success/confirmation
  background: "#FFFFFF",
  textDark: "#3D4152",
  textLight: "#93959F",
}

interface RestaurantCardProps {
  restaurant: {
    id: number
    name: string
    image: string
    rating: number
    deliveryTime: string
    discount?: string
    cuisines: string[]
    priceForTwo: number
    isVeg: boolean
    isFavorite: boolean
  }
  onPress: () => void
  onFavoriteToggle: () => void
  style?: any
  fullWidth?: boolean
}

export default function RestaurantCard({
  restaurant,
  onPress,
  onFavoriteToggle,
  style,
  fullWidth = false,
}: RestaurantCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      friction: 5,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
      tension: 40,
    }).start()
  }

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          marginBottom: 16,
        },
        style,
        fullWidth && { width: "100%" },
      ]}
    >
      <TouchableOpacity
        className="bg-white rounded-xl overflow-hidden"
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        {/* Restaurant Image */}
        <View className="relative">
          <Image source={{ uri: restaurant.image }} className="w-full h-48" resizeMode="cover" />
          <LinearGradient
            colors={["rgba(0,0,0,0.6)", "transparent"]}
            style={{ position: "absolute", top: 0, left: 0, right: 0, height: 60 }}
          />

          {/* Discount Tag */}
          {restaurant.discount && (
            <View className="absolute top-2 left-2 bg-[#FF5A5F] px-2 py-1 rounded">
              <Text className="text-white font-bold text-xs">{restaurant.discount}</Text>
            </View>
          )}

          {/* Favorite Button */}
          <TouchableOpacity
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white items-center justify-center"
            onPress={onFavoriteToggle}
          >
            <Ionicons
              name={restaurant.isFavorite ? "heart" : "heart-outline"}
              size={18}
              color={restaurant.isFavorite ? COLORS.primary : "#666"}
            />
          </TouchableOpacity>
        </View>

        {/* Restaurant Info */}
        <View className="p-3">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="font-bold text-base text-[#3D4152]" numberOfLines={1}>
                {restaurant.name}
              </Text>
              <View className="flex-row items-center mt-1">
                <View className="flex-row items-center bg-green-100 px-1.5 py-0.5 rounded">
                  <Text className="text-green-700 font-bold text-xs">{restaurant.rating}</Text>
                  <Ionicons name="star" size={10} color="#4CAF50" style={{ marginLeft: 1 }} />
                </View>
                <Text className="text-[#93959F] text-xs ml-2">{restaurant.deliveryTime}</Text>
              </View>
              <Text className="text-[#93959F] text-xs mt-1" numberOfLines={1}>
                {restaurant.cuisines.join(", ")}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}
