"use client"

import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  StyleSheet,
  StatusBar,
  Linking,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { router, useLocalSearchParams } from "expo-router"
import React from "react"

// Food-friendly color palette
const COLORS = {
  primary: "#FF5A5F",
  secondary: "#FFB74D",
  tertiary: "#4CAF50",
  background: "#FFFFFF",
  card: "#FFFFFF",
  text: "#333333",
  textLight: "#78909C",
  border: "#EEEEEE",
}

const { width, height } = Dimensions.get("window")

// Sample restaurant data
const RESTAURANT_DATA = {
  id: 3,
  name: "Pizza Heaven",
  image: "https://images.unsplash.com/photo-1579027989536-b7b1f875659b",
  logo: "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=200&h=200&fit=crop",
  rating: 4.7,
  reviewCount: 1243,
  time: "30-35 min",
  price: "$$$",
  cuisine: "Italian, Pizza",
  distance: "2.5 km",
  discount: "20% OFF",
  address: "123 Main Street, Downtown, New York",
  phone: "+1 (555) 123-4567",
  hours: "10:00 AM - 11:00 PM",
}

// Sample menu categories
const MENU_CATEGORIES = [
  { id: "all", title: "All" },
  { id: "popular", title: "Popular" },
  { id: "pizza", title: "Pizza" },
  { id: "pasta", title: "Pasta" },
  { id: "starters", title: "Starters" },
  { id: "desserts", title: "Desserts" },
  { id: "drinks", title: "Drinks" },
]

// Sample menu items
const MENU_ITEMS = [
  {
    id: 1,
    name: "Margherita Pizza",
    description: "Classic pizza with tomato sauce, mozzarella, and basil",
    price: 12.99,
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3",
    category: "pizza",
    isVeg: true,
    isPopular: true,
  },
  {
    id: 2,
    name: "Pepperoni Pizza",
    description: "Classic pizza topped with pepperoni slices",
    price: 14.99,
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e",
    category: "pizza",
    isVeg: false,
    isPopular: true,
  },
  {
    id: 3,
    name: "Garlic Bread",
    description: "Freshly baked bread with garlic butter and herbs",
    price: 5.99,
    image: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c",
    category: "starters",
    isVeg: true,
    isPopular: true,
  },
  {
    id: 4,
    name: "Caesar Salad",
    description: "Fresh romaine lettuce with Caesar dressing, croutons, and parmesan",
    price: 8.99,
    image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9",
    category: "starters",
    isVeg: true,
    isPopular: false,
  },
  {
    id: 5,
    name: "Spaghetti Carbonara",
    description: "Classic Italian pasta with eggs, cheese, pancetta, and black pepper",
    price: 13.99,
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3",
    category: "pasta",
    isVeg: false,
    isPopular: true,
  },
  {
    id: 6,
    name: "Tiramisu",
    description: "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone cream",
    price: 7.99,
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9",
    category: "desserts",
    isVeg: true,
    isPopular: true,
  },
  {
    id: 7,
    name: "Italian Soda",
    description: "Refreshing soda with fruit syrup and cream",
    price: 3.99,
    image: "https://images.unsplash.com/photo-1556881286-fc6915169721",
    category: "drinks",
    isVeg: true,
    isPopular: false,
  },
  {
    id: 8,
    name: "Meat Lovers Pizza",
    description: "Pizza loaded with pepperoni, sausage, bacon, and ground beef",
    price: 16.99,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591",
    category: "pizza",
    isVeg: false,
    isPopular: true,
  },
]

// Sample reviews
const REVIEWS = [
  {
    id: 1,
    user: "John D.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
    date: "2 days ago",
    comment: "Best pizza in town! The crust is perfect and the toppings are always fresh.",
    images: ["https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300"],
    likes: 24,
  },
  {
    id: 2,
    user: "Sarah M.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 4,
    date: "1 week ago",
    comment: "Great food and atmosphere. Delivery was a bit slow but the quality made up for it.",
    images: [],
    likes: 12,
  },
  {
    id: 3,
    user: "Michael R.",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    rating: 5,
    date: "2 weeks ago",
    comment: "The Margherita pizza is to die for! Authentic Italian taste. Will definitely order again soon.",
    images: [
      "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=300",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300",
    ],
    likes: 36,
  },
]

export default function RestaurantDetailsScreen() {
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams()
  const restaurantId = params.id || "3"

  // In a real app, you would fetch restaurant data based on the ID
  const restaurant = RESTAURANT_DATA

  const [activeTab, setActiveTab] = useState("menu")
  const [activeCategoryId, setActiveCategoryId] = useState("all")
  const [isFavorite, setIsFavorite] = useState(false)
  const [cartItems, setCartItems] = useState([])

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current
  const headerHeight = 220
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current

  // Header animations
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight + 60],
    extrapolate: "clamp",
  })

  const headerOpacity = scrollY.interpolate({
    inputRange: [headerHeight - 100, headerHeight - 70],
    outputRange: [0, 1],
    extrapolate: "clamp",
  })

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, headerHeight / 2, headerHeight],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
  })

  // Handle scroll events
  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: true,
  })

  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  // Haptic feedback
  const triggerHaptic = (type = "light") => {
    switch (type) {
      case "light":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        break
      case "medium":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        break
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
  }

  // Handle tab change
  const handleTabChange = (tab) => {
    triggerHaptic("light")
    setActiveTab(tab)
  }

  // Handle category selection
  const handleCategoryPress = (categoryId) => {
    triggerHaptic("light")
    setActiveCategoryId(categoryId)
  }

  // Toggle favorite
  const toggleFavorite = () => {
    triggerHaptic("medium")
    setIsFavorite(!isFavorite)
  }

  // Add item to cart
  const addToCart = (item) => {
    triggerHaptic("medium")
    const existingItem = cartItems.find((cartItem) => cartItem.id === item.id)

    if (existingItem) {
      setCartItems(
        cartItems.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        ),
      )
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }])
    }
  }

  // Calculate cart total
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)
  }

  // Navigate back
  const handleBack = () => {
    triggerHaptic("light")
    router.back()
  }

  // Filter menu items based on selected category
  const getFilteredMenuItems = () => {
    if (activeCategoryId === "all") {
      return MENU_ITEMS
    } else if (activeCategoryId === "popular") {
      return MENU_ITEMS.filter((item) => item.isPopular)
    } else {
      return MENU_ITEMS.filter((item) => item.category === activeCategoryId)
    }
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Animated Header */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: headerHeight,
            transform: [{ translateY: headerTranslateY }],
            zIndex: 10,
          },
        ]}
      >
        <Animated.Image
          source={{ uri: restaurant.image }}
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: headerHeight,
              opacity: imageOpacity,
            },
          ]}
          resizeMode="cover"
        />

        <LinearGradient
          colors={["rgba(0,0,0,0.7)", "transparent", "rgba(0,0,0,0.4)"]}
          style={{ position: "absolute", top: 0, left: 0, right: 0, height: headerHeight }}
        />

        {/* Header Buttons */}
        <View className="flex-row justify-between px-4" style={{ paddingTop: insets.top + 10 }}>
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-black/30 items-center justify-center"
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          <View className="flex-row">
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-black/30 items-center justify-center mr-2"
              onPress={toggleFavorite}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={22}
                color={isFavorite ? COLORS.primary : "#fff"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-black/30 items-center justify-center"
              onPress={() => {
                triggerHaptic("light")
                // Share restaurant
              }}
            >
              <Ionicons name="share-social-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Restaurant Info */}
        <View className="absolute bottom-0 left-0 right-0 p-4">
          <Text className="text-2xl font-bold text-white mb-1">{restaurant.name}</Text>

          <View className="flex-row items-center mb-2">
            <View className="flex-row items-center bg-white/20 px-2 py-1 rounded-full mr-2">
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text className="text-xs font-bold text-white ml-1">{restaurant.rating}</Text>
              <Text className="text-xs text-white/80 ml-1">({restaurant.reviewCount})</Text>
            </View>

            <Text className="text-white/90 text-sm">{restaurant.cuisine}</Text>
            <View className="w-1.5 h-1.5 bg-white/50 rounded-full mx-2" />
            <Text className="text-white/90 text-sm">{restaurant.distance}</Text>
          </View>

          {restaurant.discount && (
            <View className="flex-row items-center bg-white/20 px-3 py-1.5 rounded-full self-start">
              <Ionicons name="pricetag" size={14} color="#fff" />
              <Text className="text-white text-sm font-medium ml-1">{restaurant.discount}</Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Condensed Header (appears on scroll) */}
      <Animated.View
        style={[
          styles.condensedHeader,
          {
            opacity: headerOpacity,
            paddingTop: insets.top,
            zIndex: 20,
          },
        ]}
      >
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800 ml-4">{restaurant.name}</Text>
        <TouchableOpacity onPress={toggleFavorite}>
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={isFavorite ? COLORS.primary : "#666"}
          />
        </TouchableOpacity>
      </Animated.View>

      {/* Main Content */}
      <Animated.ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: cartItems.length > 0 ? 80 : 20 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Tab Navigation */}
        <View className="bg-white border-b border-gray-200 py-3">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
            <TouchableOpacity
              className={`mr-6 ${activeTab === "menu" ? "border-b-2 border-[#FF5A5F] pb-1" : ""}`}
              onPress={() => handleTabChange("menu")}
            >
              <Text className={`font-medium ${activeTab === "menu" ? "text-[#FF5A5F]" : "text-gray-600"}`}>Menu</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`mr-6 ${activeTab === "reviews" ? "border-b-2 border-[#FF5A5F] pb-1" : ""}`}
              onPress={() => handleTabChange("reviews")}
            >
              <Text className={`font-medium ${activeTab === "reviews" ? "text-[#FF5A5F]" : "text-gray-600"}`}>
                Reviews
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`mr-6 ${activeTab === "info" ? "border-b-2 border-[#FF5A5F] pb-1" : ""}`}
              onPress={() => handleTabChange("info")}
            >
              <Text className={`font-medium ${activeTab === "info" ? "text-[#FF5A5F]" : "text-gray-600"}`}>Info</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Menu Tab Content */}
        {activeTab === "menu" && (
          <View>
            {/* Menu Categories */}
            <View className="py-3 border-b border-gray-100">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
                {MENU_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    className={`mr-3 px-4 py-2 rounded-full ${
                      activeCategoryId === category.id ? "bg-[#FF5A5F]" : "bg-gray-100"
                    }`}
                    onPress={() => handleCategoryPress(category.id)}
                  >
                    <Text
                      className={`font-medium ${activeCategoryId === category.id ? "text-white" : "text-gray-800"}`}
                    >
                      {category.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Menu Items */}
            <View className="px-4 py-4">
              {getFilteredMenuItems().map((item) => (
                <MenuItem
                  key={item.id}
                  name={item.name}
                  description={item.description}
                  price={item.price}
                  image={item.image}
                  isVeg={item.isVeg}
                  isPopular={item.isPopular}
                  onAddToCart={() => addToCart(item)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Reviews Tab Content */}
        {activeTab === "reviews" && (
          <View className="px-4 py-4">
            {/* Rating Summary */}
            <View className="bg-gray-50 p-4 rounded-xl mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <View>
                  <Text className="text-3xl font-bold text-gray-800">{restaurant.rating}</Text>
                  <View className="flex-row mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name="star"
                        size={16}
                        color={star <= Math.floor(restaurant.rating) ? "#FFD700" : "#E0E0E0"}
                        style={{ marginRight: 2 }}
                      />
                    ))}
                  </View>
                  <Text className="text-gray-500 text-sm mt-1">{restaurant.reviewCount} reviews</Text>
                </View>

                <TouchableOpacity
                  className="bg-[#FF5A5F] px-4 py-2 rounded-full"
                  onPress={() => {
                    triggerHaptic("medium")
                    // Navigate to write review
                  }}
                >
                  <Text className="text-white font-medium">Write a Review</Text>
                </TouchableOpacity>
              </View>

              {/* Rating Bars */}
              <View>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <View key={rating} className="flex-row items-center mb-1">
                    <Text className="text-gray-600 text-sm w-6">{rating}</Text>
                    <View className="flex-1 h-2 bg-gray-200 rounded-full mx-2 overflow-hidden">
                      <View
                        className="h-full bg-[#FFD700]"
                        style={{
                          width: `${rating === 5 ? 70 : rating === 4 ? 20 : rating === 3 ? 7 : rating === 2 ? 2 : 1}%`,
                        }}
                      />
                    </View>
                    <Text className="text-gray-600 text-sm w-8">
                      {rating === 5 ? "70%" : rating === 4 ? "20%" : rating === 3 ? "7%" : rating === 2 ? "2%" : "1%"}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Reviews List */}
            {REVIEWS.map((review) => (
              <ReviewCard
                key={review.id}
                user={review.user}
                avatar={review.avatar}
                rating={review.rating}
                date={review.date}
                comment={review.comment}
                images={review.images}
                likes={review.likes}
                onLike={() => triggerHaptic("light")}
              />
            ))}

            <TouchableOpacity
              className="mt-4 py-3 border border-gray-300 rounded-xl items-center"
              onPress={() => {
                triggerHaptic("light")
                // Navigate to all reviews
              }}
            >
              <Text className="text-gray-700 font-medium">See All Reviews</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info Tab Content */}
        {activeTab === "info" && (
          <View className="px-4 py-4">
            <View className="bg-gray-50 p-4 rounded-xl mb-4">
              <View className="flex-row items-start mb-4">
                <View className="w-8 h-8 rounded-full bg-[#FF5A5F]/10 items-center justify-center mt-1">
                  <Ionicons name="location-outline" size={18} color={COLORS.primary} />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-medium text-gray-800 mb-1">Address</Text>
                  <Text className="text-gray-600">{restaurant.address}</Text>
                  <TouchableOpacity
                    className="flex-row items-center mt-2"
                    onPress={() => {
                      triggerHaptic("light")
                      // Open maps
                    }}
                  >
                    <Text className="text-[#FF5A5F] mr-1">Get Directions</Text>
                    <Ionicons name="navigate-outline" size={14} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="flex-row items-start mb-4">
                <View className="w-8 h-8 rounded-full bg-[#FF5A5F]/10 items-center justify-center mt-1">
                  <Ionicons name="time-outline" size={18} color={COLORS.primary} />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-medium text-gray-800 mb-1">Opening Hours</Text>
                  <Text className="text-gray-600">{restaurant.hours}</Text>
                </View>
              </View>

              <View className="flex-row items-start">
                <View className="w-8 h-8 rounded-full bg-[#FF5A5F]/10 items-center justify-center mt-1">
                  <Ionicons name="call-outline" size={18} color={COLORS.primary} />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-medium text-gray-800 mb-1">Contact</Text>
                  <Text className="text-gray-600">{restaurant.phone}</Text>
                  <TouchableOpacity
                    className="flex-row items-center mt-2"
                    onPress={() => {
                      triggerHaptic("light")
                      Linking.openURL(`tel:${restaurant.phone}`)
                    }}
                  >
                    <Text className="text-[#FF5A5F] mr-1">Call Restaurant</Text>
                    <Ionicons name="call" size={14} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
      </Animated.ScrollView>

      {/* Cart Button */}
      {cartItems.length > 0 && (
        <View
          className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3"
          style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }}
        >
          <TouchableOpacity
            className="flex-row items-center justify-between bg-[#FF5A5F] rounded-xl px-4 py-3"
            onPress={() => {
              triggerHaptic("medium")
              // Navigate to cart
              router.push("/cart")
            }}
          >
            <View className="flex-row items-center">
              <View className="bg-white w-6 h-6 rounded-full items-center justify-center">
                <Text className="text-[#FF5A5F] font-bold text-xs">
                  {cartItems.reduce((total, item) => total + item.quantity, 0)}
                </Text>
              </View>
              <Text className="text-white font-bold ml-2">View Cart</Text>
            </View>
            <Text className="text-white font-bold">${getCartTotal()}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

// Menu Item Component
const MenuItem = ({ name, description, price, image, isVeg, isPopular, onAddToCart }) => {
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
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        className="flex-row p-4 border-b border-gray-100"
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View className="flex-1 pr-3">
          <View className="flex-row items-center mb-1">
            {isVeg ? (
              <View className="w-4 h-4 border border-green-600 items-center justify-center mr-2">
                <View className="w-2 h-2 bg-green-600 rounded-full" />
              </View>
            ) : (
              <View className="w-4 h-4 border border-red-600 items-center justify-center mr-2">
                <View className="w-2 h-2 bg-red-600 rounded-full" />
              </View>
            )}

            {isPopular && (
              <View className="bg-[#FFB74D]/20 px-2 py-0.5 rounded-sm">
                <Text className="text-[#FFB74D] text-xs font-medium">Popular</Text>
              </View>
            )}
          </View>

          <Text className="text-base font-bold text-gray-800 mb-1">{name}</Text>
          <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
            {description}
          </Text>
          <Text className="text-[#FF5A5F] font-bold">${price.toFixed(2)}</Text>
        </View>

        <View className="w-24 h-24 relative">
          <Image source={{ uri: `${image}?w=200` }} className="w-full h-full rounded-lg" resizeMode="cover" />

          <TouchableOpacity
            className="absolute bottom-0 right-0 bg-white w-8 h-8 rounded-full shadow-md items-center justify-center m-1"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 3,
              elevation: 3,
            }}
            onPress={onAddToCart}
          >
            <Ionicons name="add" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

// Review Card Component
const ReviewCard = ({ user, avatar, rating, date, comment, images, likes, onLike }) => {
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(likes)

  const handleLike = () => {
    setLiked(!liked)
    setLikesCount(liked ? likesCount - 1 : likesCount + 1)
    onLike()
  }

  return (
    <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
      <View className="flex-row items-center mb-3">
        <Image source={{ uri: avatar }} className="w-10 h-10 rounded-full" />
        <View className="ml-3 flex-1">
          <Text className="font-bold text-gray-800">{user}</Text>
          <View className="flex-row items-center">
            <View className="flex-row mr-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name="star"
                  size={12}
                  color={star <= rating ? "#FFD700" : "#E0E0E0"}
                  style={{ marginRight: 1 }}
                />
              ))}
            </View>
            <Text className="text-xs text-gray-500">{date}</Text>
          </View>
        </View>
      </View>

      <Text className="text-gray-700 mb-3">{comment}</Text>

      {images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
          {images.map((image, index) => (
            <Image key={index} source={{ uri: image }} className="w-20 h-20 rounded-lg mr-2" resizeMode="cover" />
          ))}
        </ScrollView>
      )}

      <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
        <TouchableOpacity className="flex-row items-center" onPress={handleLike}>
          <Ionicons name={liked ? "heart" : "heart-outline"} size={18} color={liked ? COLORS.primary : "#666"} />
          <Text className={`ml-1 ${liked ? "text-[#FF5A5F]" : "text-gray-600"}`}>
            {likesCount} {likesCount === 1 ? "Like" : "Likes"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center">
          <Ionicons name="chatbubble-outline" size={18} color="#666" />
          <Text className="ml-1 text-gray-600">Reply</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  condensedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    height: Platform.OS === "ios" ? 90 : 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
})
