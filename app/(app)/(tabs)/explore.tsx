import { useEffect, useRef, useState } from "react"
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
  TextInput,
  StatusBar,
  Modal,
  Platform,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { router } from "expo-router"
import React from "react"

// Food-friendly color palette
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
  statusBarGradient: ["#FF5A5F", "#FF8A65", "#FF5A5F"],
}

const { width, height } = Dimensions.get("window")

// Sample cuisine categories
const CUISINE_CATEGORIES = [
  { id: 1, name: "All", icon: "apps", color: "#FF7878", active: true },
  { id: 2, name: "Pizza", icon: "pizza", color: "#FFA26B", active: false },
  { id: 3, name: "Burger", icon: "fast-food", color: "#FFD384", active: false },
  { id: 4, name: "Indian", icon: "restaurant", color: "#E97777", active: false },
  { id: 5, name: "Chinese", icon: "restaurant", color: "#FFBFA9", active: false },
  { id: 6, name: "Desserts", icon: "ice-cream", color: "#9ED2BE", active: false },
  { id: 7, name: "Healthy", icon: "leaf", color: "#B67352", active: false },
  { id: 8, name: "Coffee", icon: "cafe", color: "#FFB84C", active: false },
]

// Sample popular dishes
const POPULAR_DISHES = [
  {
    id: 1,
    name: "Butter Chicken",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398",
    restaurant: "Spice Paradise",
    price: "$12.99",
    rating: 4.8,
    discount: "20% OFF",
  },
  {
    id: 2,
    name: "Margherita Pizza",
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3",
    restaurant: "Pizza Heaven",
    price: "$10.50",
    rating: 4.5,
  },
  {
    id: 3,
    name: "Beef Burger",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
    restaurant: "Burger Queen",
    price: "$8.99",
    rating: 4.3,
    discount: "Buy 1 Get 1",
  },
  {
    id: 4,
    name: "Sushi Platter",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c",
    restaurant: "Sushi World",
    price: "$22.99",
    rating: 4.9,
  },
  {
    id: 5,
    name: "Pad Thai",
    image: "https://images.unsplash.com/photo-1559314809-0d155014e29e",
    restaurant: "Thai Delight",
    price: "$14.50",
    rating: 4.7,
    discount: "Free Delivery",
  },
  {
    id: 6,
    name: "Chocolate Cake",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587",
    restaurant: "Sweet Treats",
    price: "$7.99",
    rating: 4.6,
  },
]

// Sample restaurants
const RESTAURANTS = [
  {
    id: 1,
    name: "Spice Paradise",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
    rating: 4.5,
    time: "25-30 min",
    price: "$$",
    cuisine: "Indian, Chinese",
    distance: "1.2 km",
    discount: "50% OFF up to $10",
    promoted: true,
  },
  {
    id: 2,
    name: "Burger Queen",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
    rating: 4.2,
    time: "15-20 min",
    price: "$",
    cuisine: "Fast Food, Burgers",
    distance: "0.8 km",
    discount: "Free delivery",
  },
  {
    id: 3,
    name: "Pizza Heaven",
    image: "https://images.unsplash.com/photo-1579027989536-b7b1f875659b",
    rating: 4.7,
    time: "30-35 min",
    price: "$$$",
    cuisine: "Italian, Pizza",
    distance: "2.5 km",
    discount: "20% OFF",
    promoted: true,
  },
  {
    id: 4,
    name: "Sushi World",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c",
    rating: 4.8,
    time: "35-45 min",
    price: "$$$",
    cuisine: "Japanese, Sushi",
    distance: "3.1 km",
    discount: "Buy 1 Get 1",
  },
  {
    id: 5,
    name: "Thai Delight",
    image: "https://images.unsplash.com/photo-1559314809-0d155014e29e",
    rating: 4.6,
    time: "25-35 min",
    price: "$$",
    cuisine: "Thai, Asian",
    distance: "1.8 km",
    discount: "30% OFF",
  },
]

export default function ExploreScreen() {
  const insets = useSafeAreaInsets()
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategoryId, setActiveCategoryId] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [viewType, setViewType] = useState("grid") // grid or list
  const [sortOption, setSortOption] = useState("relevance")

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current
  const headerHeight = Platform.OS === "ios" ? 120 : 120
  const headerTranslateY = useRef(new Animated.Value(0)).current
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const lastScrollY = useRef(0)

  // Filter bar animation
  const filterBarTranslateY = scrollY.interpolate({
    inputRange: [0, 1000],
    outputRange: [0, 0], // Always stays at 0 (visible)
    extrapolate: "clamp",
  })

  // Header opacity animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.98],
    extrapolate: "clamp",
  })

  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: true,
    listener: (event) => {
      // We're not hiding the header anymore, just tracking scroll position
      const currentScrollY = event.nativeEvent.contentOffset.y
      lastScrollY.current = currentScrollY
    },
  })

  // We don't need these functions anymore since we're keeping the header visible
  // But we'll keep them as empty functions in case they're referenced elsewhere
  const showHeader = () => { }
  const hideHeader = () => { }

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

  const handleSearch = (text) => {
    setSearchQuery(text)
    if (text.length > 0) {
      setIsLoading(true)
      // Simulate search delay
      setTimeout(() => {
        setIsLoading(false)
      }, 1000)
    }
  }

  const handleCategoryPress = (id) => {
    triggerHaptic("light")
    setActiveCategoryId(id)
    setIsLoading(true)
    // Simulate loading delay
    setTimeout(() => {
      setIsLoading(false)
    }, 800)
  }

  const handleSortOptionChange = (option) => {
    triggerHaptic("light")
    setSortOption(option)
    setShowFilterModal(false)
    setIsLoading(true)
    // Simulate loading delay
    setTimeout(() => {
      setIsLoading(false)
    }, 800)
  }

  const handleViewTypeToggle = () => {
    triggerHaptic("light")
    setViewType(viewType === "grid" ? "list" : "grid")
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

  const renderDishItem = ({ item }) => (
    <DishCard
      name={item.name}
      image={item.image}
      restaurant={item.restaurant}
      price={item.price}
      rating={item.rating}
      discount={item.discount}
      onPress={() => {
        triggerHaptic("medium")
        // Navigate to dish details
      }}
    />
  )

  const renderRestaurantItem = ({ item }) => (
    <EnhancedRestaurantCard
      name={item.name}
      image={item.image}
      rating={item.rating}
      time={item.time}
      price={item.price}
      cuisine={item.cuisine}
      distance={item.distance}
      discount={item.discount}
      promoted={item.promoted}
      onPress={() => {
        triggerHaptic("medium")
        // Navigate to restaurant details
      }}
    />
  )

  return (
    <View className="flex-1 bg-white">
      <Animated.View className='pt-2'
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            transform: [{ translateY: 0 }], // Always at top
            opacity: headerOpacity,
          },
          styles.headerShadow,
        ]}
      >
        <LinearGradient
          colors={["#FF5A5F", "#FF5A5F", "rgb(255, 255, 255)"]}
          className="absolute top-0 left-0 right-0 h-32"
        />
        <View className="px-4 py-3 flex-row items-center justify-between" style={{ paddingTop: insets.top }}>
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => triggerHaptic("light")}>
              <Ionicons name="search" size={24} color="#fff" />
            </TouchableOpacity>
            <View className="ml-2">
              <Text className="text-white font-bold text-lg">Explore</Text>
              <Text className="text-white text-xs opacity-80">Find your favorite food</Text>
            </View>
          </View>
          <View className="flex-row">
            <TouchableOpacity className="mr-3" onPress={() => triggerHaptic("medium")}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View className="px-4 pt-2 pb-3">
          <View className="flex-row items-center">
            <View className="flex-1 bg-white rounded-full flex-row items-center px-4 py-1 shadow-lg">
              <Ionicons name="search" size={20} color={COLORS.primary} />
              <TextInput
                className="flex-1 ml-2 text-gray-800"
                placeholder="Search for dishes, restaurants..."
                placeholderTextColor="#78909C"
                value={searchQuery}
                onChangeText={handleSearch}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    triggerHaptic("light")
                    handleSearch("")
                  }}
                >
                  <Ionicons name="close-circle" size={20} color="#78909C" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              className="ml-2 bg-white rounded-full w-12 h-12 items-center justify-center shadow-lg"
              onPress={handleViewTypeToggle}
            >
              <Ionicons name={viewType === "grid" ? "list" : "grid"} size={22} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Sticky Filter Bar */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: headerHeight + insets.top - 10, // Adjust this value to position it correctly
            left: 0,
            right: 0,
            zIndex: 90,
            transform: [{ translateY: 0 }], // Always visible
            backgroundColor: "white",
          },
          styles.filterBarShadow,
        ]}
      >
        <View className="py-3 border-t border-b border-gray-100">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row px-4">
            <TouchableOpacity
              className="flex-row items-center bg-gray-100 px-3 py-2 rounded-full mr-2"
              onPress={() => {
                triggerHaptic("light")
                setShowFilterModal(true)
              }}
            >
              <Ionicons name="options-outline" size={16} color="#333" />
              <Text className="ml-1 text-gray-800 font-medium">Filters</Text>
            </TouchableOpacity>

            <FilterPill
              label="Sort"
              icon="swap-vertical"
              active={sortOption !== "relevance"}
              onPress={() => {
                triggerHaptic("light")
                setShowFilterModal(true)
              }}
            />
            <FilterPill label="Fast Delivery" onPress={() => triggerHaptic("light")} icon={undefined} />
            <FilterPill label="Offers" onPress={() => triggerHaptic("light")} icon={undefined} />
            <FilterPill label="Rating 4.0+" onPress={() => triggerHaptic("light")} icon={undefined} />
            <FilterPill label="Pure Veg" onPress={() => triggerHaptic("light")} icon={undefined} />
            <FilterPill label="Price" onPress={() => triggerHaptic("light")} icon={undefined} />
          </ScrollView>
        </View>
      </Animated.View>

      {/* Main Content */}
      <Animated.ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: headerHeight + 44 + insets.top, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Cuisine Categories */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }} className="py-3">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4">
            {CUISINE_CATEGORIES.map((category) => (
              <CuisineCategory
                key={category.id}
                name={category.name}
                icon={category.icon}
                color={category.color}
                active={category.id === activeCategoryId}
                onPress={() => handleCategoryPress(category.id)}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center py-10">
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text className="mt-4 text-gray-500">Finding the best dishes for you...</Text>
          </View>
        ) : (
          <>
            {/* Popular Dishes Section */}
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }} className="py-4">
              <View className="flex-row justify-between items-center px-4 mb-3">
                <Text className="text-lg font-bold text-gray-800">Popular Dishes</Text>
                <TouchableOpacity onPress={() => triggerHaptic("light")}>
                  <Text className="text-sm" style={{ color: COLORS.primary }}>
                    See all
                  </Text>
                </TouchableOpacity>
              </View>

              {viewType === "grid" ? (
                <FlatList
                  data={POPULAR_DISHES}
                  renderItem={renderDishItem}
                  keyExtractor={(item) => item.id.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingLeft: 16, paddingRight: 16 }}
                  ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                />
              ) : (
                <View className="px-4">
                  {POPULAR_DISHES.slice(0, 3).map((dish) => (
                    <DishCardList
                      key={dish.id}
                      name={dish.name}
                      image={dish.image}
                      restaurant={dish.restaurant}
                      price={dish.price}
                      rating={dish.rating}
                      discount={dish.discount}
                      onPress={() => {
                        triggerHaptic("medium")
                        // Navigate to dish details
                      }}
                    />
                  ))}
                </View>
              )}
            </Animated.View>

            {/* Restaurants Section */}
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }} className="py-4">
              <View className="px-4 mb-3">
                <Text className="text-lg font-bold text-gray-800">Restaurants</Text>
                <Text className="text-xs text-gray-500 mt-1">
                  {RESTAURANTS.length} restaurants found for{" "}
                  {CUISINE_CATEGORIES.find((c) => c.id === activeCategoryId)?.name}
                </Text>
              </View>

              <View className="px-4">
                {RESTAURANTS.map((restaurant) => (
                  <EnhancedRestaurantCard
                    key={restaurant.id}
                    name={restaurant.name}
                    image={restaurant.image}
                    rating={restaurant.rating}
                    time={restaurant.time}
                    price={restaurant.price}
                    cuisine={restaurant.cuisine}
                    distance={restaurant.distance}
                    discount={restaurant.discount}
                    promoted={restaurant.promoted}
                    onPress={() => {
                      triggerHaptic("medium");router.push(`/resturant`)
                      
                    }}
                  />
                ))}
              </View>
            </Animated.View>
          </>
        )}
      </Animated.ScrollView>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => {
          triggerHaptic("medium")
          setShowFilterModal(false)
        }}
        triggerHaptic={triggerHaptic}
        selectedSortOption={sortOption}
        onSortOptionChange={handleSortOptionChange}
      />
    </View>
  )
}

// Component for filter pills
const FilterPill = ({ label, icon, active = false, onPress }) => {
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
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        className={`flex-row items-center px-3 py-2 rounded-full mr-2 ${active ? "bg-[#FF5A5F]" : "bg-gray-100"}`}
        style={styles.filterPill}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
      >
        {icon && <Ionicons name={icon} size={16} color={active ? "#fff" : "#333"} className="mr-1" />}
        <Text className={`${active ? "text-white" : "text-gray-800"}`}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

// Component for cuisine categories
const CuisineCategory = ({ name, icon, color, active, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
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
        className="mr-5 items-center"
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
      >
        <View
          className={`w-16 h-16 rounded-full overflow-hidden mb-1 items-center justify-center ${active ? "border-2 border-[#FF5A5F]" : ""
            }`}
          style={[styles.categoryImage, { backgroundColor: active ? color : `${color}80` }]}
        >
          <Ionicons name={icon} size={24} color="#fff" />
        </View>
        <Text className={`text-xs ${active ? "font-bold text-[#FF5A5F]" : "font-medium text-gray-800"} mt-1`}>
          {name}
        </Text>
        {active && <View className="h-1 w-5 rounded-full bg-[#FF5A5F] mt-1" />}
      </TouchableOpacity>
    </Animated.View>
  )
}

// Component for dish cards (grid view)
const DishCard = ({ name, image, restaurant, price, rating, discount, onPress }) => {
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
      className="my-1"
      style={{
        opacity: 1,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        className="bg-white rounded-2xl overflow-hidden"
        style={[styles.dishCard, { width: 160 }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View className="relative">
          <Image source={{ uri: `${image}?w=300` }} className="w-full h-32" resizeMode="cover" />

          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            className="absolute bottom-0 left-0 right-0 h-24"
          />

          <View className="absolute bottom-3 left-3 right-3">
            <Text className="text-white text-xs font-medium opacity-90" numberOfLines={1}>
              {restaurant}
            </Text>
          </View>

          <View className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full shadow-md flex-row items-center">
            <Ionicons name="star" size={12} color="#FFB74D" />
            <Text className="text-xs font-bold text-gray-800 ml-1">{rating}</Text>
          </View>

          {discount && (
            <View className="absolute top-3 left-3 bg-red-500 px-2 py-1 rounded-lg">
              <Text className="text-white text-xs font-bold">{discount}</Text>
            </View>
          )}
        </View>

        <View className="p-3">
          <Text className="text-base font-bold text-gray-800" numberOfLines={1}>
            {name}
          </Text>

          <View className="flex-row justify-between items-center mt-2">
            <View className="bg-red-50 px-2 py-1 rounded-lg">
              <Text className="text-sm font-bold text-red-500">{price}</Text>
            </View>

            <TouchableOpacity
              className="w-8 h-8 rounded-full items-center justify-center shadow-sm"
              style={{
                backgroundColor: COLORS.primary,
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
                elevation: 4,
              }}
              onPress={(e) => {
                e.stopPropagation()
                onPress()
              }}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

// Component for dish cards (list view)
const DishCardList = ({ name, image, restaurant, price, rating, discount, onPress }) => {
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
      className="mb-4"
      style={{
        opacity: 1,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        className="bg-white rounded-2xl overflow-hidden flex-row"
        style={styles.dishCardList}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View className="relative" style={{ width: 120 }}>
          <Image source={{ uri: `${image}?w=300` }} className="w-full h-full" resizeMode="cover" />

          {discount && (
            <View className="absolute top-2 left-2 bg-red-500 px-2 py-1 rounded-lg">
              <Text className="text-white text-xs font-bold">{discount}</Text>
            </View>
          )}
        </View>

        <View className="flex-1 p-3">
          <View className="flex-row justify-between items-start">
            <Text className="text-base font-bold text-gray-800" numberOfLines={1} style={{ width: "80%" }}>
              {name}
            </Text>
            <View className="bg-green-600 px-2 py-1 rounded-full flex-row items-center">
              <Text className="text-xs font-bold text-white mr-1">{rating}</Text>
              <Ionicons name="star" size={10} color="#fff" />
            </View>
          </View>

          <Text className="text-xs text-gray-500 mt-1">{restaurant}</Text>

          <View className="flex-row justify-between items-center mt-auto">
            <View className="bg-red-50 px-2 py-1 rounded-lg">
              <Text className="text-sm font-bold text-red-500">{price}</Text>
            </View>

            <TouchableOpacity
              className="w-8 h-8 rounded-full items-center justify-center shadow-sm"
              style={{
                backgroundColor: COLORS.primary,
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
                elevation: 4,
              }}
              onPress={(e) => {
                e.stopPropagation()
                onPress()
              }}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

// Component for restaurant cards
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
          <Image source={{ uri: `${image}?w=600` }} className="w-full h-52" resizeMode="cover" />
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
                color={isFavorite ? "#FF5A5F" : "#666"}
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

// Filter Modal Component
const FilterModal = ({ visible, onClose, triggerHaptic, selectedSortOption, onSortOptionChange }) => {
  const [selectedFilters, setSelectedFilters] = useState({
    offers: false,
    freeDelivery: false,
    veg: false,
    nonVeg: false,
  })

  const toggleFilter = (filter) => {
    triggerHaptic("light")
    setSelectedFilters({
      ...selectedFilters,
      [filter]: !selectedFilters[filter],
    })
  }

  const slideAnim = useRef(new Animated.Value(300)).current

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 70,
        friction: 12,
      }).start()
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        useNativeDriver: true,
        duration: 200,
      }).start()
    }
  }, [visible])

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View className="flex-1 bg-black bg-opacity-50 justify-end">
        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            backgroundColor: "white",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
        >
          <View className="px-5 pt-4 pb-2 border-b border-gray-200">
            <View className="flex-row justify-between items-center">
              <Text className="text-xl font-bold text-gray-800">Filter</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="max-h-[70%]">
            {/* Sort Section */}
            <View className="px-5 py-4 border-b border-gray-200">
              <Text className="text-lg font-bold text-gray-800 mb-3">Sort</Text>

              <TouchableOpacity className="flex-row items-center py-2" onPress={() => onSortOptionChange("relevance")}>
                <View
                  className={`w-5 h-5 rounded-full border ${selectedSortOption === "relevance" ? "border-[#FF5A5F] bg-[#FF5A5F]" : "border-gray-400"
                    } mr-3 items-center justify-center`}
                >
                  {selectedSortOption === "relevance" && <View className="w-2 h-2 bg-white rounded-full" />}
                </View>
                <Text className="text-gray-800">Relevance (Default)</Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center py-2" onPress={() => onSortOptionChange("rating")}>
                <View
                  className={`w-5 h-5 rounded-full border ${selectedSortOption === "rating" ? "border-[#FF5A5F] bg-[#FF5A5F]" : "border-gray-400"
                    } mr-3 items-center justify-center`}
                >
                  {selectedSortOption === "rating" && <View className="w-2 h-2 bg-white rounded-full" />}
                </View>
                <Text className="text-gray-800">Rating (High to Low)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center py-2"
                onPress={() => onSortOptionChange("deliveryTime")}
              >
                <View
                  className={`w-5 h-5 rounded-full border ${selectedSortOption === "deliveryTime" ? "border-[#FF5A5F] bg-[#FF5A5F]" : "border-gray-400"
                    } mr-3 items-center justify-center`}
                >
                  {selectedSortOption === "deliveryTime" && <View className="w-2 h-2 bg-white rounded-full" />}
                </View>
                <Text className="text-gray-800">Delivery Time</Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center py-2" onPress={() => onSortOptionChange("costLow")}>
                <View
                  className={`w-5 h-5 rounded-full border ${selectedSortOption === "costLow" ? "border-[#FF5A5F] bg-[#FF5A5F]" : "border-gray-400"
                    } mr-3 items-center justify-center`}
                >
                  {selectedSortOption === "costLow" && <View className="w-2 h-2 bg-white rounded-full" />}
                </View>
                <Text className="text-gray-800">Cost (Low to High)</Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center py-2" onPress={() => onSortOptionChange("costHigh")}>
                <View
                  className={`w-5 h-5 rounded-full border ${selectedSortOption === "costHigh" ? "border-[#FF5A5F] bg-[#FF5A5F]" : "border-gray-400"
                    } mr-3 items-center justify-center`}
                >
                  {selectedSortOption === "costHigh" && <View className="w-2 h-2 bg-white rounded-full" />}
                </View>
                <Text className="text-gray-800">Cost (High to Low)</Text>
              </TouchableOpacity>
            </View>

            {/* Filter Options */}
            <View className="px-5 py-4">
              <Text className="text-lg font-bold text-gray-800 mb-3">Filter</Text>

              <TouchableOpacity
                className="flex-row items-center justify-between py-3 border-b border-gray-100"
                onPress={() => toggleFilter("offers")}
              >
                <View className="flex-row items-center">
                  <Ionicons name="pricetag-outline" size={20} color="#333" className="mr-3" />
                  <Text className="text-gray-800">Offers & Deals</Text>
                </View>
                <View
                  className={`w-6 h-6 rounded ${selectedFilters.offers ? "bg-[#FF5A5F]" : "bg-gray-200"
                    } items-center justify-center`}
                >
                  {selectedFilters.offers && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center justify-between py-3 border-b border-gray-100"
                onPress={() => toggleFilter("freeDelivery")}
              >
                <View className="flex-row items-center">
                  <Ionicons name="bicycle-outline" size={20} color="#333" className="mr-3" />
                  <Text className="text-gray-800">Free Delivery</Text>
                </View>
                <View
                  className={`w-6 h-6 rounded ${selectedFilters.freeDelivery ? "bg-[#FF5A5F]" : "bg-gray-200"
                    } items-center justify-center`}
                >
                  {selectedFilters.freeDelivery && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center justify-between py-3 border-b border-gray-100"
                onPress={() => toggleFilter("veg")}
              >
                <View className="flex-row items-center">
                  <View className="w-5 h-5 border-2 border-green-600 mr-3 items-center justify-center">
                    <View className="w-2 h-2 bg-green-600 rounded-full" />
                  </View>
                  <Text className="text-gray-800">Pure Veg</Text>
                </View>
                <View
                  className={`w-6 h-6 rounded ${selectedFilters.veg ? "bg-[#FF5A5F]" : "bg-gray-200"
                    } items-center justify-center`}
                >
                  {selectedFilters.veg && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center justify-between py-3 border-b border-gray-100"
                onPress={() => toggleFilter("nonVeg")}
              >
                <View className="flex-row items-center">
                  <View className="w-5 h-5 border-2 border-red-600 mr-3 items-center justify-center">
                    <View className="w-2 h-2 bg-red-600 rounded-full" />
                  </View>
                  <Text className="text-gray-800">Non-Veg</Text>
                </View>
                <View
                  className={`w-6 h-6 rounded ${selectedFilters.nonVeg ? "bg-[#FF5A5F]" : "bg-gray-200"
                    } items-center justify-center`}
                >
                  {selectedFilters.nonVeg && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
              </TouchableOpacity>
            </View>

            {/* Cuisines Section */}
            <View className="px-5 py-4 border-t border-gray-200">
              <Text className="text-lg font-bold text-gray-800 mb-3">Cuisines</Text>

              <View className="flex-row flex-wrap">
                <CuisineTag label="Italian" onPress={() => triggerHaptic("light")} />
                <CuisineTag label="Chinese" onPress={() => triggerHaptic("light")} />
                <CuisineTag label="Indian" onPress={() => triggerHaptic("light")} />
                <CuisineTag label="Mexican" onPress={() => triggerHaptic("light")} />
                <CuisineTag label="Thai" onPress={() => triggerHaptic("light")} />
                <CuisineTag label="Japanese" onPress={() => triggerHaptic("light")} />
                <CuisineTag label="American" onPress={() => triggerHaptic("light")} />
                <CuisineTag label="Desserts" onPress={() => triggerHaptic("light")} />
              </View>
            </View>

            {/* Price Range Section */}
            <View className="px-5 py-4 border-t border-gray-200">
              <Text className="text-lg font-bold text-gray-800 mb-3">Price Range</Text>

              <View className="flex-row flex-wrap">
                <PriceTag label="$" onPress={() => triggerHaptic("light")} />
                <PriceTag label="$$" onPress={() => triggerHaptic("light")} />
                <PriceTag label="$$$" onPress={() => triggerHaptic("light")} />
                <PriceTag label="$$$$" onPress={() => triggerHaptic("light")} />
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View className="px-5 py-4 flex-row border-t border-gray-200">
            <TouchableOpacity
              className="flex-1 py-3 border border-gray-300 rounded-lg mr-2 items-center"
              onPress={() => {
                triggerHaptic("medium")
                onClose()
              }}
            >
              <Text className="font-semibold text-gray-800">CLEAR ALL</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 py-3 rounded-lg ml-2 items-center"
              style={{ backgroundColor: COLORS.primary }}
              onPress={() => {
                triggerHaptic("success")
                onClose()
              }}
            >
              <Text className="font-semibold text-white">APPLY</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}

// Cuisine tag component
const CuisineTag = ({ label, onPress }) => {
  const [selected, setSelected] = useState(false)
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
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        className={`m-1 px-3 py-1.5 rounded-full border ${selected ? "border-[#FF5A5F]" : "border-gray-300"}`}
        style={selected ? { backgroundColor: "#FF5A5F", borderColor: "#FF5A5F" } : {}}
        onPress={() => {
          setSelected(!selected)
          onPress()
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
      >
        <Text className={`text-sm ${selected ? "text-white" : "text-gray-800"}`}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

// Price tag component
const PriceTag = ({ label, onPress }) => {
  const [selected, setSelected] = useState(false)
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
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        className={`m-1 px-5 py-2 rounded-full border ${selected ? "border-[#FF5A5F]" : "border-gray-300"}`}
        style={selected ? { backgroundColor: "#FF5A5F", borderColor: "#FF5A5F" } : {}}
        onPress={() => {
          setSelected(!selected)
          onPress()
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
      >
        <Text className={`text-base font-bold ${selected ? "text-white" : "text-gray-800"}`}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

// Styles
const styles = StyleSheet.create({
  headerShadow: {
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  filterBarShadow: {
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
  dishCard: {
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  dishCardList: {
    height: 120,
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
