import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
  TextInput,
  FlatList,
  Modal,
  ActivityIndicator,
} from "react-native"
import { Ionicons, MaterialIcons, MaterialCommunityIcons, Feather } from "@expo/vector-icons"
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

const { width, height } = Dimensions.get("window")

// Sample restaurant data
const RESTAURANT_DATA = {
  id: 1,
  name: "Khandelwal Dhaba",
  image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
  logo: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop",
  rating: 3.7,
  reviewCount: 12000,
  time: "25-35 mins",
  price: "$$",
  cuisine: "Pure Veg",
  distance: "3.1 km",
  location: "Pratap Nagar",
  discount: "Flat ₹125 OFF above ₹249",
  offers: 7,
  isVeg: true,
  description: "Authentic North Indian cuisine with a wide variety of vegetarian dishes. Known for our delicious thalis and fresh rotis.",
  openingHours: "10:00 AM - 11:00 PM",
  address: "123 Pratap Nagar, Near City Mall, Delhi, 110007",
  phoneNumber: "+91 98765 43210",
}

// Sample offers
const OFFERS = [
  { id: 1, code: "WELCOME50", description: "50% off up to ₹100 on orders above ₹199" },
  { id: 2, code: "FREEDEL", description: "Free delivery on orders above ₹399" },
  { id: 3, code: "FLAT100", description: "Flat ₹100 off on orders above ₹499" },
  { id: 4, code: "NEWUSER", description: "20% off up to ₹150 for new users" },
  { id: 5, code: "WEEKEND", description: "Extra 10% off on weekend orders" },
  { id: 6, code: "COMBO50", description: "₹50 off on combo meals" },
  { id: 7, code: "APPSPECIAL", description: "Additional 5% off on app orders" },
]

// Sample menu categories
const MENU_CATEGORIES = [
  { id: "all", title: "All" },
  { id: "popular", title: "Most ordered together" },
  { id: "recommended", title: "Recommended for you" },
  { id: "thali", title: "Thali" },
  { id: "roti", title: "Roti" },
  { id: "curry", title: "Curry" },
  { id: "dessert", title: "Dessert" },
  { id: "beverages", title: "Beverages" },
]

// Sample menu items
const MENU_ITEMS = [
  {
    id: 1,
    name: "Dal Tadka + Tawa Roti",
    description: "Ordered by 120+ customers",
    price: 163,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe",
    category: "popular",
    isVeg: true,
    isPopular: true,
    isCustomizable: true,
    customizationOptions: [
      { id: 1, name: "Extra Dal", price: 30 },
      { id: 2, name: "Extra Roti (2 pcs)", price: 40 },
    ],
  },
  {
    id: 2,
    name: "Deluxe Thali + Roti",
    description: "Ordered by 80+ customers",
    price: 301,
    image: "https://images.unsplash.com/photo-1567337710282-00832b415979",
    category: "popular",
    isVeg: true,
    isPopular: true,
    isCustomizable: true,
    customizationOptions: [
      { id: 1, name: "Extra Sweet", price: 25 },
      { id: 2, name: "Extra Roti (2 pcs)", price: 40 },
      { id: 3, name: "Upgrade to Butter Roti", price: 20 },
    ],
  }
]

export default function RestaurantDetailsScreen() {
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams()
  const restaurantId = params.id || "1"

  // In a real app, you would fetch restaurant data based on the ID
  const restaurant = RESTAURANT_DATA

  const [activeCategory, setActiveCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [showOffersModal, setShowOffersModal] = useState(false)
  const [showCustomizationModal, setShowCustomizationModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedCustomizations, setSelectedCustomizations] = useState({})
  const [isMenuModalVisible, setIsMenuModalVisible] = useState(false)
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [itemQuantities, setItemQuantities] = useState({})

  const scrollY = useRef(new Animated.Value(0)).current
  const headerHeight = 240
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current
  const searchBarAnim = useRef(new Animated.Value(0)).current
  const cartBtnAnim = useRef(new Animated.Value(1)).current
  const quantityBtnAnim = useRef({})

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

  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: true,
  })

  // Initialize animations and state
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
    
    // Initialize animation references for all menu items
    MENU_ITEMS.forEach(item => {
      quantityBtnAnim.current[item.id] = new Animated.Value(1)
    })
  }, [])

  useEffect(() => {
    Animated.timing(searchBarAnim, {
      toValue: showSearch ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [showSearch])

  // Initialize itemQuantities from cart items
  useEffect(() => {
    const initialQuantities = {}
    cartItems.forEach(item => {
      initialQuantities[item.id] = (initialQuantities[item.id] || 0) + item.quantity
    })
    setItemQuantities(initialQuantities)
  }, [])

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

  const handleSearch = (text) => {
    setSearchQuery(text)
  }

  const handleCategoryPress = (categoryId) => {
    triggerHaptic("light")
    setActiveCategory(categoryId)
  }

  const toggleFavorite = () => {
    triggerHaptic("medium")
    setIsFavorite(!isFavorite)
  }

  const getItemQuantity = (itemId) => {
    return itemQuantities[itemId] || 0
  }

  const addToCart = (item, customizations = {}) => {
    triggerHaptic("medium")

    // Animate cart button
    Animated.sequence([
      Animated.timing(cartBtnAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(cartBtnAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start()

    // Animate quantity button if it exists
    if (quantityBtnAnim.current[item.id]) {
      Animated.sequence([
        Animated.timing(quantityBtnAnim.current[item.id], {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(quantityBtnAnim.current[item.id], {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start()
    }

    // Update item quantities for UI display
    setItemQuantities(prev => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1
    }))

    // Update cart items
    const customizationKey = JSON.stringify(customizations)
    const existingItemIndex = cartItems.findIndex(
      (cartItem) =>
        cartItem.id === item.id &&
        JSON.stringify(cartItem.customizations) === customizationKey
    )

    if (existingItemIndex !== -1) {
      const updatedCartItems = [...cartItems]
      updatedCartItems[existingItemIndex].quantity += 1
      setCartItems(updatedCartItems)
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1, customizations }])
    }

    if (showCustomizationModal) {
      setShowCustomizationModal(false)
      setSelectedItem(null)
      setSelectedCustomizations({})
    }
  }

  const removeFromCart = (item, customizations = {}) => {
    triggerHaptic("light")
    
    // Animate the quantity button if it exists
    if (quantityBtnAnim.current[item.id]) {
      Animated.sequence([
        Animated.timing(quantityBtnAnim.current[item.id], {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(quantityBtnAnim.current[item.id], {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start()
    }
    
    const customizationKey = JSON.stringify(customizations)
    const existingItemIndex = cartItems.findIndex(
      (cartItem) => 
        cartItem.id === item.id && 
        JSON.stringify(cartItem.customizations) === customizationKey
    )

    if (existingItemIndex !== -1) {
      const updatedCartItems = [...cartItems]
      
      if (updatedCartItems[existingItemIndex].quantity > 1) {
        updatedCartItems[existingItemIndex].quantity -= 1
        setCartItems(updatedCartItems)
        
        // Update item quantities for UI display
        setItemQuantities(prev => ({
          ...prev,
          [item.id]: prev[item.id] - 1
        }))
      } else {
        updatedCartItems.splice(existingItemIndex, 1)
        setCartItems(updatedCartItems)
        
        // Remove item from quantities state
        setItemQuantities(prev => {
          const newState = {...prev}
          delete newState[item.id]
          return newState
        })
      }
    }
  }

  const renderItemControls = (item, customizations = {}) => {
    const quantity = getItemQuantity(item.id)
    
    if (quantity > 0) {
      return (
        <Animated.View 
          className="flex-row items-center bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
          style={{
            transform: [{ scale: quantityBtnAnim.current[item.id] || 1 }],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
          }}
        >
          <TouchableOpacity
            className="w-9 h-9 items-center justify-center bg-gray-50"
            onPress={() => removeFromCart(item, customizations)}
            activeOpacity={0.7}
          >
            <Feather name="minus" size={18} color="#E23744" />
          </TouchableOpacity>
          
          <View className="w-10 h-9 items-center justify-center bg-white">
            <Text className="font-bold text-[#3D4152] text-base">{quantity}</Text>
          </View>
          
          <TouchableOpacity
            className="w-9 h-9 items-center justify-center bg-gray-50"
            onPress={() => addToCart(item, customizations)}
            activeOpacity={0.7}
          >
            <Feather name="plus" size={18} color="#E23744" />
          </TouchableOpacity>
        </Animated.View>
      )
    }
    
    return (
      <TouchableOpacity
        className="bg-white rounded-lg px-4 py-1 shadow-md"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
        }}
        onPress={() => item.isCustomizable ? handleCustomize(item) : addToCart(item)}
        activeOpacity={0.7}
      >
        <Text className="text-[#E23744] font-bold">ADD</Text>
      </TouchableOpacity>
    )
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      let itemTotal = item.price * item.quantity

      if (item.customizations) {
        Object.entries(item.customizations).forEach(([optionId, isSelected]) => {
          if (isSelected) {
            const option = item.customizationOptions.find(opt => opt.id.toString() === optionId)
            if (option) {
              itemTotal += option.price * item.quantity
            }
          }
        })
      }

      return total + itemTotal
    }, 0)
  }

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }

  const handleBack = () => {
    triggerHaptic("light")
    router.back()
  }

  const handleViewRatings = () => {
    triggerHaptic("light")
    router.push({
      pathname: "/resturant/rating",
      params: { id: restaurantId, name: restaurant.name }
    })
  }

  const handleCustomize = (item) => {
    triggerHaptic("light")
    setSelectedItem(item)
    setSelectedCustomizations({})
    setShowCustomizationModal(true)
  }

  const toggleCustomizationOption = (optionId) => {
    triggerHaptic("light")
    setSelectedCustomizations(prev => ({
      ...prev,
      [optionId]: !prev[optionId]
    }))
  }

  const getCustomizationTotal = () => {
    if (!selectedItem) return 0

    return Object.entries(selectedCustomizations).reduce((total, [optionId, isSelected]) => {
      if (isSelected) {
        const option = selectedItem.customizationOptions.find(opt => opt.id.toString() === optionId)
        if (option) {
          return total + option.price
        }
      }
      return total
    }, 0)
  }

  const getFilteredMenuItems = () => {
    let filteredItems = MENU_ITEMS

    if (activeCategory !== "all") {
      filteredItems = filteredItems.filter((item) =>
        activeCategory === "popular" ? item.isPopular :
          activeCategory === "recommended" ? item.isRecommended :
            item.category === activeCategory,
      )
    }

    if (searchQuery.trim() !== "") {
      filteredItems = filteredItems.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    return filteredItems
  }

  const handleProceedToCart = () => {
    triggerHaptic("medium")
    router.push("/cart")
  }

  const toggleSearch = () => {
    triggerHaptic("light")
    setIsSearchActive(!isSearchActive)
    if (!isSearchActive) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    } else {
      setSearchQuery("")
    }
  }

  const searchInputRef = useRef(null)

  return (
    <View className="flex-1 bg-white">
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
        <LinearGradient
          colors={["#FF5A5F", "#FF5A5F", "#FF7B7F"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ position: "absolute", top: 0, left: 0, right: 0, height: headerHeight }}
        />

        {/* Header Buttons */}
        <View className="flex-row justify-between px-4" style={{ paddingTop: insets.top + 10 }}>
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          <View className="flex-row">
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3"
              onPress={() => {
                triggerHaptic("light")
              }}
            >
              <Ionicons name="share-social-outline" size={22} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
              onPress={toggleSearch}
            >
              <Ionicons name="search" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Restaurant Info */}
        <View className="px-4 mt-4">
          <View className="bg-green-100 self-start px-2 py-1 rounded-md mb-2">
            <Text className="text-green-700 text-xs font-medium">Pure Veg</Text>
          </View>

          <Text className="text-2xl font-bold text-white mb-1">{restaurant.name}</Text>

          <TouchableOpacity
            className="flex-row items-center mb-2"
            onPress={handleViewRatings}
          >
            <View className="flex-row items-center bg-white/20 px-2 py-1 rounded-md mr-2">
              <Text className="text-white font-bold mr-1">{restaurant.rating}</Text>
              <Ionicons name="star" size={14} color="#FFD700" />
            </View>
            <Text className="text-white/90 text-sm">{restaurant.reviewCount} ratings</Text>
          </TouchableOpacity>

          <View className="flex-row items-center mb-2">
            <View className="flex-row items-center">
              <Ionicons name="location" size={16} color="white" />
              <Text className="text-white/90 text-sm ml-1">{restaurant.distance} • {restaurant.location}</Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={16} color="white" />
            <Text className="text-white/90 text-sm ml-1">{restaurant.time} • Schedule for later</Text>
            <Ionicons name="chevron-down" size={16} color="white" className="ml-1" />
          </View>
        </View>
      </Animated.View>

      <Animated.View className='flex-col justify-center'
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: insets.top + 55,
          opacity: headerOpacity,
          zIndex: 20,
        }}
      >
        <LinearGradient
          colors={["#FF5A5F", "#FF7B7F"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ position: "absolute", top: 0, left: 0, right: 0, height: "100%" }}
        />
        <View className="flex-row justify-between items-center px-4" style={{ paddingTop: insets.top }}>
          <TouchableOpacity onPress={handleBack} className="flex-row items-center">
            <Ionicons name="arrow-back" size={24} color="#fff" />
            <Text className="text-lg font-bold text-white ml-4">{restaurant.name}</Text>
          </TouchableOpacity>
          <View className="flex-row">
            <TouchableOpacity className="mr-3" onPress={toggleSearch}>
              <Ionicons name="search" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {isSearchActive && (
        <View
          className="absolute top-0 left-0 right-0 bottom-0 bg-white z-30"
          style={{ paddingTop: insets.top }}
        >
          <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
            <TouchableOpacity onPress={toggleSearch} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="#3D4152" />
            </TouchableOpacity>
            <View className="flex-1 flex-row items-center bg-gray-100 rounded-lg px-4 py-2">
              <Ionicons name="search" size={20} color="#93959F" />
              <TextInput
                ref={searchInputRef}
                className="flex-1 ml-2 text-[#3D4152]"
                placeholder="Search for dishes..."
                placeholderTextColor="#93959F"
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#93959F" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView className="flex-1">
            {searchQuery.length > 0 ? (
              getFilteredMenuItems().length > 0 ? (
                <View className="px-4 py-4">
                  <Text className="text-base font-bold text-[#3D4152] mb-4">
                    {getFilteredMenuItems().length} results found
                  </Text>

                  {getFilteredMenuItems().map((item) => (
                    <View key={item.id} className="mb-6">
                      <View className="flex-row items-start">
                        <View className="flex-1 pr-3">
                          <View className="flex-row items-center mb-1">
                            <View className="w-4 h-4 border border-green-600 items-center justify-center mr-2">
                              <View className="w-2 h-2 bg-green-600 rounded-full" />
                            </View>
                          </View>

                          <Text className="text-base font-bold text-[#3D4152] mb-1">{item.name}</Text>
                          <Text className="text-[#3D4152] font-bold mb-2">₹{item.price}</Text>

                          {item.description && (
                            <Text className="text-sm text-[#93959F] mb-2" numberOfLines={2}>
                              {item.description}
                            </Text>
                          )}
                        </View>

                        <View className="relative">
                          <Image
                            source={{ uri: item.image }}
                            className="w-28 h-28 rounded-lg"
                            resizeMode="cover"
                          />
                          <View className="absolute bottom-2 right-2">
                            {renderItemControls(item)}
                          </View>
                          {item.isFree && (
                            <View className="absolute top-2 left-2 bg-blue-500 px-2 py-0.5 rounded">
                              <Text className="text-white text-xs font-bold">FREE</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      {item.isCustomizable && (
                        <Text className="text-xs text-[#93959F] mt-1">customisable</Text>
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                <View className="flex-1 items-center justify-center py-16">
                  <Ionicons name="search-outline" size={64} color="#E0E0E0" />
                  <Text className="text-lg font-medium text-[#3D4152] mt-4">No results found</Text>
                  <Text className="text-[#93959F] text-center mt-2 px-8">
                    We couldn't find any dishes matching "{searchQuery}"
                  </Text>
                </View>
              )
            ) : (
              <View className="px-4 py-4">
                <Text className="text-base font-bold text-[#3D4152] mb-4">Popular Searches</Text>
                {["Thali", "Roti", "Paneer", "Dal", "Curry", "Dessert"].map((term, index) => (
                  <TouchableOpacity
                    key={index}
                    className="flex-row items-center py-3 border-b border-gray-100"
                    onPress={() => setSearchQuery(term)}
                  >
                    <Ionicons name="search-outline" size={20} color="#93959F" className="mr-3" />
                    <Text className="text-[#3D4152]">{term}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      )}

      <Animated.ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: cartItems.length > 0 ? 80 : 20 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View className="py-3 border-b border-gray-100">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
            {MENU_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                className={`mr-3 px-4 py-2 rounded-full ${activeCategory === category.id ? "bg-[#F8F8F8]" : "bg-white"
                  } ${activeCategory !== category.id ? "border border-gray-200" : ""}`}
                onPress={() => handleCategoryPress(category.id)}
              >
                {category.id === "popular" ? (
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons
                      name="repeat"
                      size={18}
                      color={activeCategory === category.id ? COLORS.primary : "#3D4152"}
                    />
                    <Text
                      className={`font-medium ml-1 ${activeCategory === category.id ? "text-[#E23744]" : "text-[#3D4152]"
                        }`}
                    >
                      {category.title}
                    </Text>
                  </View>
                ) : category.id === "recommended" ? (
                  <View className="flex-row items-center">
                    <MaterialIcons
                      name="recommend"
                      size={18}
                      color={activeCategory === category.id ? COLORS.primary : "#3D4152"}
                    />
                    <Text
                      className={`font-medium ml-1 ${activeCategory === category.id ? "text-[#E23744]" : "text-[#3D4152]"
                        }`}
                    >
                      {category.title}
                    </Text>
                  </View>
                ) : (
                  <Text
                    className={`font-medium ${activeCategory === category.id ? "text-[#E23744]" : "text-[#3D4152]"
                      }`}
                  >
                    {category.title}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {activeCategory === "popular" && (
          <View className="px-4 py-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-[#3D4152]">Most ordered together</Text>
              <Ionicons name="chevron-up" size={20} color="#3D4152" />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {getFilteredMenuItems().slice(0, 2).map((item, index) => (
                <View
                  key={item.id}
                  className="mr-4 bg-white border border-gray-100 rounded-lg overflow-hidden"
                  style={{ width: width * 0.7 }}
                >
                  <View className="flex-row">
                    <Image
                      source={{ uri: item.image }}
                      className="w-24 h-24"
                      resizeMode="cover"
                    />
                    <Image
                      source={{ uri: "https://images.unsplash.com/photo-1565557623262-b51c2513a641" }}
                      className="w-24 h-24"
                      resizeMode="cover"
                    />
                  </View>

                  <View className="p-3">
                    <View className="flex-row items-center mb-1">
                      <View className="w-4 h-4 border border-green-600 items-center justify-center mr-2">
                        <View className="w-2 h-2 bg-green-600 rounded-full" />
                      </View>
                      <Text className="text-green-700 text-xs bg-green-100 px-2 py-0.5 rounded">
                        {item.description}
                      </Text>
                    </View>

                    <Text className="font-bold text-[#3D4152] text-base mb-2">{item.name}</Text>

                    <View className="flex-row justify-between items-center">
                      <Text className="font-bold text-[#3D4152]">₹{item.price}</Text>
                      <View>
                        {renderItemControls(item)}
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View className="px-4 py-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-[#3D4152]">
              {activeCategory === "recommended" ? "Recommended for you" :
                activeCategory === "popular" ? "More items" :
                  MENU_CATEGORIES.find(cat => cat.id === activeCategory)?.title || "Menu"}
            </Text>
            <Ionicons name="chevron-up" size={20} color="#3D4152" />
          </View>

          {getFilteredMenuItems()
            .filter(item => activeCategory !== "popular" || !item.isPopular)
            .map((item) => (
              <View key={item.id} className="mb-6">
                <View className="flex-row items-start">
                  <View className="flex-1 pr-3">
                    <View className="flex-row items-center mb-1">
                      <View className="w-4 h-4 border border-green-600 items-center justify-center mr-2">
                        <View className="w-2 h-2 bg-green-600 rounded-full" />
                      </View>
                      {item.isPopular && (
                        <View className="bg-green-100 px-2 py-0.5 rounded">
                          <Text className="text-green-700 text-xs font-medium">Highly reordered</Text>
                        </View>
                      )}
                    </View>

                    <Text className="text-base font-bold text-[#3D4152] mb-1">{item.name}</Text>
                    <Text className="text-[#3D4152] font-bold mb-2">₹{item.price}</Text>

                    {item.description && (
                      <Text className="text-sm text-[#93959F] mb-2" numberOfLines={2}>
                        {item.description}
                      </Text>
                    )}

                    <View className="flex-row items-center">
                      <TouchableOpacity className="mr-3">
                        <Ionicons name="bookmark-outline" size={20} color="#93959F" />
                      </TouchableOpacity>
                      <TouchableOpacity>
                        <Ionicons name="share-social-outline" size={20} color="#93959F" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View className="relative">
                    <Image
                      source={{ uri: item.image }}
                      className="w-28 h-28 rounded-lg"
                      resizeMode="cover"
                    />
                    <View className="absolute bottom-2 right-2">
                      {renderItemControls(item)}
                    </View>
                    {item.isFree && (
                      <View className="absolute top-2 left-2 bg-blue-500 px-2 py-0.5 rounded">
                        <Text className="text-white text-xs font-bold">FREE</Text>
                      </View>
                    )}
                  </View>
                </View>
                {item.isCustomizable && (
                  <Text className="text-xs text-[#93959F] mt-1">customisable</Text>
                )}
              </View>
            ))}
        </View>
      </Animated.ScrollView>
      <View
        className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-4 py-3 flex-row"
        style={{
          paddingBottom: insets.bottom > 0 ? insets.bottom : 16,
          display: cartItems.length > 0 ? 'none' : 'flex'
        }}
      >
        <TouchableOpacity
          className="flex-1 flex-row items-center bg-gray-100 rounded-lg px-4 py-2 mr-3"
          onPress={toggleSearch}
        >
          <Ionicons name="search" size={20} color="#93959F" />
          <Text className="ml-2 text-[#93959F] flex-1">Search for dishes...</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-[#3D4152] rounded-lg px-4 items-center justify-center"
          onPress={() => {
            triggerHaptic("light")
            setIsMenuModalVisible(true)
          }}
        >
          <View className="flex-row items-center">
            <Ionicons name="restaurant-outline" size={20} color="white" />
            <Text className="text-white font-medium ml-2">Menu</Text>
          </View>
        </TouchableOpacity>
      </View>

      {cartItems.length > 0 && (
        <Animated.View
          className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3"
          style={{
            paddingBottom: insets.bottom > 0 ? insets.bottom : 16,
            transform: [{ scale: cartBtnAnim }]
          }}
        >
          <TouchableOpacity
            className="bg-[#E23744] rounded-lg py-3 px-4"
            onPress={handleProceedToCart}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="bg-white/20 px-2 py-1 rounded-md mr-3">
                  <Text className="text-white font-bold">{getCartItemCount()}</Text>
                </View>
                <Text className="text-white font-bold">₹{getCartTotal().toFixed(2)}</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-white font-bold mr-2">View Cart</Text>
                <Ionicons name="arrow-forward" size={18} color="white" />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      <Modal
        visible={showOffersModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOffersModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className="bg-white rounded-t-3xl"
            style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }}
          >
            <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
              <Text className="text-xl font-bold text-[#3D4152]">Available Offers</Text>
              <TouchableOpacity onPress={() => setShowOffersModal(false)}>
                <Ionicons name="close" size={24} color="#3D4152" />
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-96">
              {OFFERS.map((offer) => (
                <View key={offer.id} className="p-4 border-b border-gray-100">
                  <View className="flex-row items-start">
                    <MaterialIcons name="local-offer" size={20} color={COLORS.secondary} className="mt-1 mr-3" />
                    <View className="flex-1">
                      <Text className="text-[#FC8019] font-bold mb-1">{offer.code}</Text>
                      <Text className="text-[#3D4152]">{offer.description}</Text>
                    </View>
                    <TouchableOpacity
                      className="bg-[#FC8019]/10 px-3 py-1 rounded-lg"
                      onPress={() => {
                        triggerHaptic("light")
                        // Apply offer
                        setShowOffersModal(false)
                      }}
                    >
                      <Text className="text-[#FC8019] font-medium">APPLY</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCustomizationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowCustomizationModal(false)
          setSelectedItem(null)
          setSelectedCustomizations({})
        }}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className="bg-white rounded-t-3xl"
            style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }}
          >
            <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
              <Text className="text-xl font-bold text-[#3D4152]">Customize "{selectedItem?.name}"</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCustomizationModal(false)
                  setSelectedItem(null)
                  setSelectedCustomizations({})
                }}
              >
                <Ionicons name="close" size={24} color="#3D4152" />
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-96 px-4 py-2">
              {selectedItem?.customizationOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  className="flex-row items-center justify-between py-4 border-b border-gray-100"
                  onPress={() => toggleCustomizationOption(option.id.toString())}
                >
                  <View className="flex-row items-center">
                    <View className={`w-5 h-5 rounded-full border ${selectedCustomizations[option.id.toString()]
                        ? 'border-[#E23744] bg-[#E23744]'
                        : 'border-gray-400'
                      } items-center justify-center mr-3`}>
                      {selectedCustomizations[option.id.toString()] && (
                        <Ionicons name="checkmark" size={12} color="white" />
                      )}
                    </View>
                    <View>
                      <Text className="text-[#3D4152] font-medium">{option.name}</Text>
                      {option.price > 0 && (
                        <Text className="text-[#93959F] text-sm">+ ₹{option.price}</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View className="px-4 pt-3 border-t border-gray-200">
              {getItemQuantity(selectedItem?.id) > 0 ? (
                <View className="flex-row items-center justify-between">
                  <Text className="text-[#3D4152] font-bold">
                    Item Total: ₹{(selectedItem?.price + getCustomizationTotal()).toFixed(2)}
                  </Text>
                  {renderItemControls(selectedItem, selectedCustomizations)}
                </View>
              ) : (
                <TouchableOpacity
                  className="bg-[#E23744] rounded-lg py-3"
                  onPress={() => addToCart(selectedItem, selectedCustomizations)}
                >
                  <View className="flex-row items-center justify-center">
                    <Text className="text-white font-bold">
                      ADD ITEM - ₹{(selectedItem?.price + getCustomizationTotal()).toFixed(2)}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isMenuModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsMenuModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className="bg-white rounded-t-3xl"
            style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 20, maxHeight: height * 0.8 }}
          >
            <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
              <Text className="text-xl font-bold text-[#3D4152]">Menu</Text>
              <TouchableOpacity onPress={() => setIsMenuModalVisible(false)}>
                <Ionicons name="close" size={24} color="#3D4152" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {MENU_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  className="p-4 border-b border-gray-100"
                  onPress={() => {
                    triggerHaptic("light")
                    setActiveCategory(category.id)
                    setIsMenuModalVisible(false)
                  }}
                >
                  <Text
                    className={`text-base ${activeCategory === category.id ? "text-[#E23744] font-bold" : "text-[#3D4152]"
                      }`}
                  >
                    {category.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {isLoading && (
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/30 items-center justify-center">
          <View className="bg-white p-4 rounded-lg">
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text className="text-[#3D4152] mt-2">Loading...</Text>
          </View>
        </View>
      )}
    </View>
  )
}