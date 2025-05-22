import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  StatusBar,
  TextInput,
  FlatList,
} from "react-native"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { router, useLocalSearchParams } from "expo-router"
import React from "react"

// Food Delivery color palette
const COLORS = {
  primary: "#E23744", // Zomato-inspired red
  secondary: "#FC8019", // Swiggy-inspired orange
  accent: "#60B246", // Green for success/confirmation
  background: "#FFFFFF",
  textDark: "#3D4152",
  textLight: "#93959F",
  lightGray: "#F8F8F8",
  gray: "#EEEEEE",
  border: "#E8E8E8",
}

// Sample reviews data
const REVIEWS = [
  {
    id: 1,
    user: "Rahul S.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
    date: "2 days ago",
    comment: "Amazing food! The dal tadka was perfect and the rotis were soft and fresh. Will definitely order again.",
    images: ["https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300"],
    likes: 24,
    isLiked: false,
  },
  {
    id: 2,
    user: "Priya M.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 4,
    date: "1 week ago",
    comment: "Good food but delivery was a bit delayed. The thali was worth the money though!",
    images: [],
    likes: 12,
    isLiked: false,
  },
  {
    id: 3,
    user: "Amit K.",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    rating: 5,
    date: "2 weeks ago",
    comment: "Best North Indian food in the area. The aloo jeera is to die for! Highly recommended.",
    images: [
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300",
    ],
    likes: 36,
    isLiked: false,
  },
  {
    id: 4,
    user: "Sneha R.",
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    rating: 3,
    date: "3 weeks ago",
    comment: "Food was good but portion size could be better. The dal tadka was delicious though.",
    images: [],
    likes: 8,
    isLiked: false,
  },
  {
    id: 5,
    user: "Vikram S.",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    rating: 5,
    date: "1 month ago",
    comment: "Excellent food quality and packaging. The rotis were still hot when they arrived!",
    images: [
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300",
    ],
    likes: 42,
    isLiked: false,
  },
]

// Rating distribution
const RATING_DISTRIBUTION = [
  { rating: 5, percentage: 70 },
  { rating: 4, percentage: 20 },
  { rating: 3, percentage: 7 },
  { rating: 2, percentage: 2 },
  { rating: 1, percentage: 1 },
]

export default function RatingsScreen() {
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams()
  const restaurantId = params.id || "1"
  const restaurantName = params.name || "Restaurant"

  const [activeFilter, setActiveFilter] = useState("all")
  const [reviews, setReviews] = useState(REVIEWS)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current
  const searchBarAnim = useRef(new Animated.Value(0)).current

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

  // Search bar animation
  useEffect(() => {
    Animated.timing(searchBarAnim, {
      toValue: showSearch ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [showSearch])

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

  // Handle search
  const handleSearch = (text) => {
    setSearchQuery(text)
  }

  // Handle filter selection
  const handleFilterPress = (filter) => {
    triggerHaptic("light")
    setActiveFilter(filter)
  }

  // Navigate back
  const handleBack = () => {
    triggerHaptic("light")
    router.back()
  }

  // Handle like review
  const handleLikeReview = (reviewId) => {
    triggerHaptic("light")
    setReviews(
      reviews.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              isLiked: !review.isLiked,
              likes: review.isLiked ? review.likes - 1 : review.likes + 1,
            }
          : review
      )
    )
  }

  // Filter reviews based on selected filter and search query
  const getFilteredReviews = () => {
    let filteredReviews = reviews

    // Apply rating filter
    if (activeFilter !== "all") {
      const ratingFilter = parseInt(activeFilter)
      filteredReviews = filteredReviews.filter((review) => review.rating === ratingFilter)
    }

    // Apply search filter
    if (searchQuery.trim() !== "") {
      filteredReviews = filteredReviews.filter(
        (review) =>
          review.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
          review.comment.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filteredReviews
  }

  const averageRating = (
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  ).toFixed(1)

  return (
    <View className="flex-1 bg-white">
      <View style={{ paddingTop: insets.top }}>
        <LinearGradient
          colors={["#FF5A5F", "#FF7B7F"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          className="absolute top-0 left-0 right-0 h-full"
        />
        <View className="px-4 py-3 flex-row items-center" style={{ paddingTop: insets.top + 10 }}>
          <TouchableOpacity onPress={handleBack} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-bold text-white">{restaurantName}</Text>
            <Text className="text-white/80 text-xs">Ratings & Reviews</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Rating Summary */}
        <View className="px-4 py-6 bg-white">
          <View className="flex-row items-center justify-between">
            <View className="items-center">
              <Text className="text-4xl font-bold text-[#3D4152]">{averageRating}</Text>
              <View className="flex-row mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name="star"
                    size={16}
                    color={star <= Math.floor(averageRating) ? "#FFD700" : "#E0E0E0"}
                    style={{ marginRight: 2 }}
                  />
                ))}
              </View>
              <Text className="text-[#93959F] text-sm mt-1">{reviews.length} reviews</Text>
            </View>

            <View className="flex-1 ml-6">
              {RATING_DISTRIBUTION.map((item) => (
                <View key={item.rating} className="flex-row items-center mb-1">
                  <Text className="text-[#93959F] text-sm w-6">{item.rating}</Text>
                  <View className="flex-1 h-2 bg-gray-200 rounded-full mx-2 overflow-hidden">
                    <View
                      className="h-full bg-[#FFD700]"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </View>
                  <Text className="text-[#93959F] text-sm w-8">{item.percentage}%</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Filters */}
        <View className="py-3 border-t border-b border-gray-100">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
            <TouchableOpacity
              className={`mr-3 px-4 py-2 rounded-full ${
                activeFilter === "all" ? "bg-[#F8F8F8]" : "bg-white border border-gray-200"
              }`}
              onPress={() => handleFilterPress("all")}
            >
              <Text
                className={`font-medium ${
                  activeFilter === "all" ? "text-[#E23744]" : "text-[#3D4152]"
                }`}
              >
                All Reviews
              </Text>
            </TouchableOpacity>

            {[5, 4, 3, 2, 1].map((rating) => (
              <TouchableOpacity
                key={rating}
                className={`mr-3 px-4 py-2 rounded-full ${
                  activeFilter === rating.toString() ? "bg-[#F8F8F8]" : "bg-white border border-gray-200"
                }`}
                onPress={() => handleFilterPress(rating.toString())}
              >
                <View className="flex-row items-center">
                  <Text
                    className={`font-medium ${
                      activeFilter === rating.toString() ? "text-[#E23744]" : "text-[#3D4152]"
                    }`}
                  >
                    {rating}
                  </Text>
                  <Ionicons
                    name="star"
                    size={14}
                    color={activeFilter === rating.toString() ? COLORS.primary : "#FFD700"}
                    style={{ marginLeft: 2 }}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Search Bar */}
        <View className="px-4 py-3 border-b border-gray-100">
          <View className="flex-row items-center bg-gray-100 rounded-lg px-4 py-2">
            <Ionicons name="search" size={20} color="#93959F" />
            <TextInput
              className="flex-1 ml-2 text-[#3D4152]"
              placeholder="Search in reviews"
              placeholderTextColor="#93959F"
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic("light")
                  setSearchQuery("")
                }}
              >
                <Ionicons name="close-circle" size={20} color="#93959F" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Reviews List */}
        <View className="px-4 py-4">
          {getFilteredReviews().length > 0 ? (
            getFilteredReviews().map((review) => (
              <Animated.View
                key={review.id}
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                  marginBottom: 16,
                }}
              >
                <View className="bg-white rounded-lg p-4 border border-gray-100">
                  <View className="flex-row items-center mb-3">
                    <Image source={{ uri: review.avatar }} className="w-10 h-10 rounded-full" />
                    <View className="ml-3 flex-1">
                      <Text className="font-bold text-[#3D4152]">{review.user}</Text>
                      <View className="flex-row items-center">
                        <View className="flex-row mr-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons
                              key={star}
                              name="star"
                              size={12}
                              color={star <= review.rating ? "#FFD700" : "#E0E0E0"}
                              style={{ marginRight: 1 }}
                            />
                          ))}
                        </View>
                        <Text className="text-xs text-[#93959F]">{review.date}</Text>
                      </View>
                    </View>
                  </View>

                  <Text className="text-[#3D4152] mb-3">{review.comment}</Text>

                  {review.images.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                      {review.images.map((image, index) => (
                        <Image
                          key={index}
                          source={{ uri: image }}
                          className="w-20 h-20 rounded-lg mr-2"
                          resizeMode="cover"
                        />
                      ))}
                    </ScrollView>
                  )}

                  <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
                    <TouchableOpacity
                      className="flex-row items-center"
                      onPress={() => handleLikeReview(review.id)}
                    >
                      <Ionicons
                        name={review.isLiked ? "heart" : "heart-outline"}
                        size={18}
                        color={review.isLiked ? COLORS.primary : "#666"}
                      />
                      <Text className={`ml-1 ${review.isLiked ? "text-[#E23744]" : "text-[#93959F]"}`}>
                        {review.likes} {review.likes === 1 ? "Like" : "Likes"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center">
                      <Ionicons name="chatbubble-outline" size={18} color="#93959F" />
                      <Text className="ml-1 text-[#93959F]">Reply</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            ))
          ) : (
            <View className="py-8 items-center">
              <Ionicons name="search-outline" size={48} color="#E0E0E0" />
              <Text className="mt-4 text-[#93959F] text-center">
                No reviews found matching your criteria
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}