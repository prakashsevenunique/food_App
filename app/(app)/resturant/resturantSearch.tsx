import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native"
import { Ionicons, Feather } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { router } from "expo-router"
import RestaurantCard from "@/components/restruantCard"
import FilterModal from "@/components/searchFilter"
import FoodCategories from "@/components/uiItems/categories"
import React from "react"

// Food Delivery color palette
const COLORS = {
  primary: "#FF5A5F", // Zomato-inspired red
  secondary: "#FC8019", // Swiggy-inspired orange
  accent: "#60B246", // Green for success/confirmation
  background: "#FFFFFF",
  textDark: "#3D4152",
  textLight: "#93959F",
  lightGray: "#F8F8F8",
  gray: "#EEEEEE",
  border: "#E8E8E8",
}

const { width, height } = Dimensions.get("window")

// Sample filter chips
const FILTER_CHIPS = [
  { id: "filters", name: "Filters", icon: "filter" },
  { id: "regular", name: "Regular" },
  { id: "paneer", name: "Paneer" },
  { id: "veg", name: "Pure Veg" },
  { id: "offers", name: "Offers" },
]

const RESTAURANTS = [
  {
    id: 1,
    name: "Rameno'z Pizza",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&h=500&fit=crop",
    rating: 4.2,
    deliveryTime: "20-30 mins",
    discount: "FLAT 50% OFF",
    cuisines: ["Pizza", "Italian", "Fast Food"],
    priceForTwo: 400,
    isVeg: false,
    isFavorite: false,
  },
  {
    id: 2,
    name: "CGH Food",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&h=500&fit=crop",
    rating: 3.9,
    deliveryTime: "40-45 mins",
    discount: "FLAT 50% OFF",
    cuisines: ["North Indian", "Chinese", "Biryani"],
    priceForTwo: 350,
    isVeg: false,
    isFavorite: true,
  },
  {
    id: 3,
    name: "The Crust",
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&h=500&fit=crop",
    rating: 4.5,
    deliveryTime: "10-15 mins",
    discount: "50% OFF up to ₹110",
    cuisines: ["Pizza", "Fast Food"],
    priceForTwo: 300,
    isVeg: true,
    isFavorite: false,
  },
  {
    id: 4,
    name: "Let's Brew Coffee",
    image: "https://images.unsplash.com/photo-1594461185450-7a92ef113908?w=500&h=500&fit=crop",
    rating: 4.7,
    deliveryTime: "35-40 mins",
    discount: "60% OFF up to ₹120",
    cuisines: ["Beverages", "Desserts", "Cafe"],
    priceForTwo: 250,
    isVeg: true,
    isFavorite: true,
  },
  {
    id: 5,
    name: "Brown Sugar",
    image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=500&h=500&fit=crop",
    rating: 4.1,
    deliveryTime: "15-20 mins",
    discount: "60% OFF up to ₹120",
    cuisines: ["Desserts", "Ice Cream", "Beverages"],
    priceForTwo: 200,
    isVeg: true,
    isFavorite: false,
  },
  {
    id: 6,
    name: "Firangi Baker",
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&h=500&fit=crop",
    rating: 3.8,
    deliveryTime: "40-45 mins",
    discount: "Buy 1 Get 1",
    cuisines: ["Bakery", "Desserts", "Fast Food"],
    priceForTwo: 300,
    isVeg: false,
    isFavorite: false,
  },
]

export default function SearchRestaurantScreen() {
  const insets = useSafeAreaInsets()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedFilters, setSelectedFilters] = useState([])
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [sortBy, setSortBy] = useState("Relevance")
  const [vegOnly, setVegOnly] = useState(false)

  // State for categories (now only used for filtering)
  const [categories, setCategories] = useState([])

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current
  const modalAnim = useRef(new Animated.Value(height)).current

  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  // Modal animations
  useEffect(() => {
    if (showFilterModal) {
      Animated.spring(modalAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(modalAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }, [showFilterModal])

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

  // Handle category selection
  const handleCategoryPress = (categoryId) => {
    triggerHaptic("light")
    setSelectedCategory(categoryId)
  }

  // Handle categories loaded from the component
  const handleCategoriesLoaded = (loadedCategories) => {
    setCategories(loadedCategories)

    // Set the first category as selected if we have categories and none is selected
    if (loadedCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(loadedCategories[0].id)
    }
  }

  // Handle filter chip press
  const handleFilterChipPress = (filterId) => {
    triggerHaptic("light")
    if (filterId === "filters") {
      setShowFilterModal(true)
      return
    }

    if (filterId === "veg") {
      setVegOnly(!vegOnly)
      return
    }

    if (selectedFilters.includes(filterId)) {
      setSelectedFilters(selectedFilters.filter((id) => id !== filterId))
    } else {
      setSelectedFilters([...selectedFilters, filterId])
    }
  }

  const applyFilters = () => {
    triggerHaptic("medium")
    setShowFilterModal(false)
  }

  const handleBack = () => {
    triggerHaptic("light")
    router.back()
  }

  const handleRestaurantPress = (restaurantId) => {
    triggerHaptic("light")
    router.push(`/restaurant/${restaurantId}`)
  }

  const handleToggleFavorite = (restaurantId) => {
    triggerHaptic("medium")
  }

  const getFilteredRestaurants = () => {
    let filteredRestaurants = [...RESTAURANTS]

    // Filter by search query
    if (searchQuery.trim() !== "") {
      filteredRestaurants = filteredRestaurants.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          restaurant.cuisines.some((cuisine) => cuisine.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    if (vegOnly) {
      filteredRestaurants = filteredRestaurants.filter((restaurant) => restaurant.isVeg)
    }

    if (selectedCategory && selectedCategory !== "all") {
      const category = categories.find((cat) => cat.id === selectedCategory)
      if (category) {
        filteredRestaurants = filteredRestaurants.filter((restaurant) =>
          restaurant.cuisines.some((cuisine) => cuisine.toLowerCase() === category.name.toLowerCase()),
        )
      }
    }

    switch (sortBy) {
      case "Rating: High to Low":
        filteredRestaurants.sort((a, b) => b.rating - a.rating)
        break
      case "Delivery Time":
        filteredRestaurants.sort((a, b) => {
          const aTime = Number.parseInt(a.deliveryTime.split("-")[0])
          const bTime = Number.parseInt(b.deliveryTime.split("-")[0])
          return aTime - bTime
        })
        break
      case "Cost: Low to High":
        filteredRestaurants.sort((a, b) => a.priceForTwo - b.priceForTwo)
        break
      case "Cost: High to Low":
        filteredRestaurants.sort((a, b) => b.priceForTwo - a.priceForTwo)
        break
      default:
        // Relevance - keep original order
        break
    }

    return filteredRestaurants
  }

  const getRecommendedRestaurants = () => {
    return RESTAURANTS.filter((restaurant) => restaurant.rating >= 4.0).slice(0, 3)
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View
        style={{
          paddingTop: insets.top,
          backgroundColor: COLORS.background,
          zIndex: 10,
        }}
      >
        <View className="px-4 py-3 flex-row items-center">
          <TouchableOpacity onPress={handleBack} className="mr-3">
            <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-2">
            <Ionicons name="search" size={20} color={COLORS.primary} />
            <TextInput
              className="flex-1 ml-2 text-[#3D4152]"
              placeholder="Restaurant name or a dish..."
              placeholderTextColor={COLORS.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity onPress={() => handleFilterChipPress("filters")}>
              <Ionicons name="filter" size={24} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
        </View>
        <View className="pb-4">
          <FoodCategories
            selectedCategory={selectedCategory}
            onCategoryPress={handleCategoryPress}
            onCategoriesLoaded={handleCategoriesLoaded}
          />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Filter Chips */}
        <View className="pb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
            {FILTER_CHIPS.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                className={`flex-row items-center px-4 py-2 rounded-full mr-3 border ${
                  selectedFilters.includes(filter.id) || (filter.id === "veg" && vegOnly) || filter.id === "filters"
                    ? "bg-[#FF5A5F] border-[#FF5A5F]"
                    : "bg-white border-gray-200"
                }`}
                onPress={() => handleFilterChipPress(filter.id)}
              >
                {filter.icon && (
                  <Feather
                    name={filter.icon}
                    size={14}
                    color={
                      selectedFilters.includes(filter.id) || (filter.id === "veg" && vegOnly) || filter.id === "filters"
                        ? "white"
                        : COLORS.textDark
                    }
                    style={{ marginRight: 4 }}
                  />
                )}
                <Text
                  className={`${
                    selectedFilters.includes(filter.id) || (filter.id === "veg" && vegOnly) || filter.id === "filters"
                      ? "text-white"
                      : "text-[#3D4152]"
                  } font-medium`}
                >
                  {filter.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        {/* Recommended Restaurants */}
        <View className="pb-6">
          <Text className="px-4 text-lg font-medium text-[#3D4152] uppercase tracking-wider mb-4">
            Recommended for you
          </Text>

          <FlatList
            data={getRecommendedRestaurants()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 16, paddingRight: 16 }}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <RestaurantCard
                restaurant={item}
                onPress={() => handleRestaurantPress(item.id)}
                onFavoriteToggle={() => handleToggleFavorite(item.id)}
                style={{ width: width * 0.7, marginRight: 16 }}
              />
            )}
          />
        </View>

        {/* All Restaurants */}
        <View className="pb-6">
          <Text className="px-4 text-lg font-medium text-[#3D4152] uppercase tracking-wider mb-4">All Restaurants</Text>

          <View className="px-4">
            {getFilteredRestaurants().map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onPress={() => handleRestaurantPress(restaurant.id)}
                onFavoriteToggle={() => handleToggleFavorite(restaurant.id)}
                fullWidth
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <FilterModal visible={showFilterModal} onClose={() => setShowFilterModal(false)} onApply={applyFilters} />
    </View>
  )
}
