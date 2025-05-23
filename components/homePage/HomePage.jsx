import { useEffect, useRef, useState } from "react"
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Platform,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"
import { router } from "expo-router"
import DishCard from "../dishCard"
import FoodCategories from "../uiItems/categories"
import api from "@/utils/axiosInstance" // Make sure this import matches your project structure

const COLORS = {
  primary: "#FF5A5F",
  secondary: "#FFB74D",
  tertiary: "#4CAF50",
  accent1: "#8E24AA",
  accent2: "#1E88E5",
  dark: "#263238",
  light: "#FFFFFF",
  background: "#F9F9F9",
  card: "#FFFFFF",
  text: "#263238",
  textLight: "#78909C",
  success: "#66BB6A",
  error: "#EF5350",
  gradient1: ["#FF5A5F", "#FF8A65"],
  gradient2: ["#FFB74D", "#FFA000"],
  gradient3: ["#4CAF50", "#2E7D32"],
  gradient4: ["#8E24AA", "#6A1B9A"],
  gradient5: ["#1E88E5", "#1565C0"],
  statusBarGradient: ["#FF5A5F", "#FF8A65", "rgba(55, 49, 49, 0.32)"],
}

export default function Home() {
  const scrollY = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current
  const lastScrollY = useRef(0)
  const headerHeight = Platform.OS === "ios" ? 120 : 120

  const { width, height } = Dimensions.get("window")

  const headerTranslateY = useRef(new Animated.Value(0)).current
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)

  // State for coupons
  const [coupons, setCoupons] = useState([])
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(true)
  const [couponError, setCouponError] = useState(null)

  // Fetch coupons on component mount
  useEffect(() => {
    fetchCouponsData()
  }, [])

  const fetchCouponsData = async () => {
    try {
      setIsLoadingCoupons(true)
      setCouponError(null)
      const data = await fetchCoupons()
      setCoupons(data)
    } catch (error) {
      console.error("Error fetching coupons in component:", error)
      setCouponError(error.message || "Failed to load offers")
    } finally {
      setIsLoadingCoupons(false)
    }
  }

  const fetchCoupons = async () => {
    try {
      const response = await api.get("/api/coupons")
      return response.data
    } catch (error) {
      console.error("Error fetching coupons:", error)
      throw error
    }
  }

  const imageTranslateY = scrollY.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [-100, 0, 0],
    extrapolate: "clamp",
  })

  const gradientOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0],
    extrapolate: "clamp",
  })

  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: true,
    listener: (event) => {
      const currentScrollY = event.nativeEvent.contentOffset.y
      if (currentScrollY <= 0) {
        showHeader()
      } else if (currentScrollY > lastScrollY.current) {
        hideHeader()
      } else if (currentScrollY < lastScrollY.current) {
        showHeader()
      }
      lastScrollY.current = currentScrollY
    },
  })

  const showHeader = () => {
    if (!isHeaderVisible) {
      setIsHeaderVisible(true)
      Animated.spring(headerTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }).start()
    }
  }

  const hideHeader = () => {
    if (isHeaderVisible && lastScrollY.current > headerHeight) {
      setIsHeaderVisible(false)
      Animated.spring(headerTranslateY, {
        toValue: -headerHeight,
        useNativeDriver: true,
        tension: 100,
        friction: 12,
      }).start()
    }
  }

  const triggerHaptic = (type = "light") => {
    switch (type) {
      case "light":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        break
      case "medium":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        break
      case "heavy":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
        break
      case "success":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        break
      case "error":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        break
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
  }

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  // Function to render coupons content based on loading/error state
  const renderCouponsContent = () => {
    if (isLoadingCoupons) {
      return (
        <View className="pl-4 py-4 flex-row items-center">
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text className="ml-2 text-gray-500">Loading offers...</Text>
        </View>
      )
    }

    if (couponError) {
      return (
        <View className="pl-4 py-4 flex-row items-center">
          <Ionicons name="alert-circle-outline" size={20} color={COLORS.error} />
          <Text className="ml-2 text-gray-500">{couponError}</Text>
          <TouchableOpacity className="ml-4 px-3 py-1 bg-gray-200 rounded-full" onPress={fetchCouponsData}>
            <Text className="text-sm text-gray-700">Retry</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (coupons.length === 0) {
      return (
        <View className="pl-4 py-4">
          <Text className="text-gray-500">No offers available at the moment</Text>
        </View>
      )
    }

    // Map coupons to GradientOfferCard components
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4">
        {coupons.map((coupon, index) => (
          <GradientOfferCard
            key={coupon._id || index}
            image={
              coupon.couponPhoto ||
              "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80"
            }
            title={coupon?.couponType == 'percent'? `${coupon.discountValue}% OFF` : `Flat ${coupon.discountValue} OFF`}
            description={coupon.description || coupon.terms || "Limited time offer"}
            colors={getGradientColors(index)}
            delay={100 * (index + 1)}
            onPress={() => {
              triggerHaptic("success")
              if (coupon.onPress) coupon.onPress()
            }}
            code={coupon.code}
          />
        ))}
      </ScrollView>
    )
  }

  // Helper function to get different gradient colors for each coupon
  const getGradientColors = (index) => {
    const gradients = [COLORS.gradient1, COLORS.gradient2, COLORS.gradient3, COLORS.gradient4, COLORS.gradient5]
    return gradients[index % gradients.length]
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar style={"auto"} backgroundColor={"#FF5A5F"} translucent={false} />
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            transform: [{ translateY: headerTranslateY }],
          },
          styles.headerShadow,
        ]}
      >
        <LinearGradient colors={COLORS.statusBarGradient} className="absolute top-0 left-0 right-0 h-32" />
        <View className="px-4 py-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => triggerHaptic("light")}>
              <Ionicons name="location" size={24} color="#fff" />
            </TouchableOpacity>
            <View className="ml-2">
              <Text className="text-white font-bold text-xl">Home</Text>
              <Text className="text-white text-xs opacity-80">123 Main Street</Text>
            </View>
          </View>
          <View className="flex-row">
            <TouchableOpacity
              className="mr-3"
              onPress={() => {
                triggerHaptic("medium")
                router.push("/(app)/notification")
              }}
            >
              <Ionicons name="notifications-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-4 pt-2 pb-3">
          <TouchableOpacity
            className="bg-white rounded-full flex-row items-center px-4 py-3.5 shadow-lg"
            activeOpacity={0.9}
            onPress={() => {
              triggerHaptic("light")
              router.push("/(app)/resturant/resturantSearch")
            }}
          >
            <Ionicons name="search" size={20} color={COLORS.primary} />
            <Text className="ml-2 text-gray-500">Search for restaurants, cuisines...</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View className="relative h-[320px]">
          <Animated.Image
            source={{
              uri: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
            }}
            className="absolute w-full h-full"
            style={{ transform: [{ translateY: imageTranslateY }] }}
          />
          <Animated.View style={{ opacity: gradientOpacity }} className="absolute inset-0">
            <LinearGradient
              colors={["rgba(192, 57, 57, 0)", "rgba(0, 0, 0, 0.16)", "rgb(75, 13, 13)"]}
              className="absolute inset-0"
            />
          </Animated.View>

          <View className="absolute inset-0 justify-end px-4 pb-4 pt-16">
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <Text className="text-white text-3xl font-bold mb-2">Hungry?</Text>
            </Animated.View>

            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <Text className="text-white text-lg mb-4">Order food from favorite restaurants near you</Text>
            </Animated.View>
          </View>
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }} className="py-5 bg-white">
          <View className="flex-row justify-between items-center px-4 mb-3">
            <Text className="text-lg font-bold text-gray-800">Popular Dishes Near You</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4">
            <DishCard
              name="Butter Chicken"
              image="https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
              restaurant="Spice Paradise"
              price="$12.99"
              rating={4.8}
              delay={100}
              onPress={() => triggerHaptic("medium")}
            />
            <DishCard
              name="Margherita Pizza"
              image="https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
              restaurant="Pizza Heaven"
              price="$10.50"
              rating={4.5}
              delay={200}
              onPress={() => triggerHaptic("medium")}
            />
            <DishCard
              name="Beef Burger"
              image="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=999&q=80"
              restaurant="Burger Queen"
              price="$8.99"
              rating={4.3}
              delay={300}
              onPress={() => triggerHaptic("medium")}
            />
            <DishCard
              name="Sushi Platter"
              image="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
              restaurant="Sushi World"
              price="$22.99"
              rating={4.9}
              delay={400}
              onPress={() => triggerHaptic("medium")}
            />
          </ScrollView>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }} className="py-5 bg-white">
          <View className="flex-row justify-between items-center px-4 mb-3">
            <Text className="text-lg font-bold text-gray-800">What's on your mind?</Text>
          </View>

          <FoodCategories />
        </Animated.View>

        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          className="py-5 bg-gray-50"
        >
          <View className="flex-row justify-between items-center px-4 mb-3">
            <Text className="text-lg font-bold text-gray-800">Best Offers For You</Text>
            <TouchableOpacity onPress={() =>{triggerHaptic("light");router.push("/(app)/profileDetails/offers")}}>
              <Text className="text-sm" style={{ color: COLORS.primary }}>
                See all
              </Text>
            </TouchableOpacity>
          </View>

          {renderCouponsContent()}
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }} className="py-5 bg-white">
          <View className="px-4 mb-3">
            <Text className="text-lg font-bold text-gray-800">Popular Restaurants</Text>
            <Text className="text-xs text-gray-500 mt-1">Based on orders from people around you</Text>
          </View>

          <View className="px-4">
            <EnhancedRestaurantCard
              name="Spice Paradise"
              image="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
              rating={4.5}
              time="25-30 min"
              price="$$"
              cuisine="Indian, Chinese"
              distance="1.2 km"
              discount="50% OFF up to $10"
              promoted={true}
              delay={100}
              onPress={() => (triggerHaptic("medium"), router.push("/(app)/resturant"))}
            />

            <EnhancedRestaurantCard
              name="Burger Queen"
              image="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
              rating={4.2}
              time="15-20 min"
              price="$"
              cuisine="Fast Food, Burgers"
              distance="0.8 km"
              discount="Free delivery"
              delay={200}
              onPress={() => triggerHaptic("medium")}
            />

            <EnhancedRestaurantCard
              name="Pizza Heaven"
              image="https://images.unsplash.com/photo-1579027989536-b7b1f875659b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
              rating={4.7}
              time="30-35 min"
              price="$$$"
              cuisine="Italian, Pizza"
              distance="2.5 km"
              discount="20% OFF"
              promoted={true}
              delay={300}
              onPress={() => triggerHaptic("medium")}
            />

            <EnhancedRestaurantCard
              name="Sushi World"
              image="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
              rating={4.8}
              time="35-45 min"
              price="$$$"
              cuisine="Japanese, Sushi"
              distance="3.1 km"
              discount="Buy 1 Get 1"
              delay={400}
              onPress={() => triggerHaptic("medium")}
            />
          </View>
        </Animated.View>
        <View className="h-20" />
      </Animated.ScrollView>
    </View>
  )
}

const GradientOfferCard = ({ image, title, description, colors, delay = 0, onPress, code }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
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
      style={{
        opacity: 1,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        className="mr-4"
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View className="w-56 h-32 rounded-xl overflow-hidden shadow-lg" style={styles.offerCard}>
          <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
          <LinearGradient
            colors={colors || ["#FF416C", "#FF4B2B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="absolute inset-0 opacity-80"
          />
          <View className="absolute inset-0 p-4 justify-end">
            <Text className="text-white font-bold text-xl">{title}</Text>
            <Text className="text-white text-sm">{description}</Text>
            {code && (
              <View className="bg-white/30 px-2 py-1 rounded mt-2 self-start">
                <Text className="text-white font-bold text-xs">Use code: {code}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

const EnhancedRestaurantCard = ({
  name,
  image,
  rating,
  time,
  price,
  cuisine,
  distance,
  discount,
  promoted,
  delay = 0,
  onPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current
  const [isFavorite, setIsFavorite] = useState(false)

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
      style={{
        opacity: 1,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        className="mb-6 bg-white rounded-2xl overflow-hidden shadow-md"
        style={styles.restaurantCard}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View className="relative">
          {/* Image with gradient overlay for better text contrast */}
          <Image
            source={{ uri: image }}
            className="w-full h-52" // Slightly taller for better visual impact
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.3)"]}
            style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60 }}
          />

          {/* Top right badges - properly spaced */}
          <View className="absolute top-3 right-3 flex-row space-x-2">
            {/* Favorite Button */}
            <TouchableOpacity
              className="bg-white/90 w-8 h-8 rounded-full items-center justify-center"
              onPress={() => {
                setIsFavorite(!isFavorite)
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              }}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={16}
                color={isFavorite ? "#E23744" : "#666"}
              />
            </TouchableOpacity>

            {/* Time Badge - Now properly positioned */}
            <View className="bg-white/90 px-3 py-1.5 rounded-full flex-row items-center">
              <Ionicons name="time-outline" size={12} color="#333" style={{ marginRight: 3 }} />
              <Text className="text-xs font-bold text-gray-800">{time}</Text>
            </View>
          </View>

          {/* Promoted Badge - Enhanced */}
          {promoted && (
            <View className="absolute top-3 left-3 bg-gray-800/90 px-3 py-1.5 rounded-full flex-row items-center">
              <Ionicons name="flash" size={12} color="#fff" style={{ marginRight: 3 }} />
              <Text className="text-xs font-bold text-white">PROMOTED</Text>
            </View>
          )}

          {/* Discount Banner - Enhanced */}
          {discount && (
            <LinearGradient
              colors={COLORS.gradient1}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="absolute bottom-0 left-0 right-0 px-4 py-2 flex-row items-center"
            >
              <Ionicons name="pricetag" size={14} color="#fff" style={{ marginRight: 4 }} />
              <Text className="text-white text-sm font-medium">{discount}</Text>
            </LinearGradient>
          )}
        </View>

        <View className="p-4">
          {/* Restaurant Name and Rating */}
          <View className="flex-row justify-between items-start">
            <Text className="text-lg font-bold text-gray-800" numberOfLines={1} style={{ maxWidth: "80%" }}>
              {name}
            </Text>
            <View className="flex-row items-center bg-green-600 px-2 py-1 rounded-full">
              <Text className="text-xs font-bold text-white mr-1">{rating}</Text>
              <Ionicons name="star" size={12} color="#fff" />
            </View>
          </View>

          {/* Cuisine and Price */}
          <View className="flex-row items-center mt-2">
            <Text className="text-sm text-gray-500">{cuisine}</Text>
            <View className="w-1.5 h-1.5 bg-gray-400 rounded-full mx-2" />
            <Text className="text-sm text-gray-500">{price}</Text>
          </View>

          {/* Distance and View Menu Button */}
          <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={14} color="#666" style={{ marginRight: 4 }} />
              <Text className="text-sm text-gray-600 font-medium">{distance}</Text>
            </View>

            <TouchableOpacity
              className="px-3 py-2 rounded-full flex-row items-center"
              style={{ backgroundColor: "#F5F5F5" }}
              onPress={(e) => {
                e.stopPropagation()
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                onPress()
              }}
            >
              <Text className="text-sm font-bold mr-1" style={{ color: COLORS.primary }}>
                VIEW MENU
              </Text>
              <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  headerShadow: {
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  filterPill: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  categoryImage: {
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderWidth: 2,
    borderColor: "#fff",
  },
  offerCard: {
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  dishCard: {
    width: 160,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  restaurantCard: {
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
})
