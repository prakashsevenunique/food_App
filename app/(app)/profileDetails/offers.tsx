import { useEffect, useRef, useState } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  TextInput,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { router } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import * as Clipboard from "expo-clipboard"
import React from "react"

const { width } = Dimensions.get("window")

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
  warning: "#FFA000",
  gradient1: ["#FF5A5F", "#FF8A65"],
  gradient2: ["#FFB74D", "#FFA000"],
  gradient3: ["#4CAF50", "#2E7D32"],
  gradient4: ["#8E24AA", "#6A1B9A"],
  gradient5: ["#1E88E5", "#1565C0"],
}

// Mock offer categories
const OFFER_CATEGORIES = [
  { id: "all", name: "All Offers" },
  { id: "restaurant", name: "Restaurant Offers" },
  { id: "payment", name: "Payment Offers" },
  { id: "delivery", name: "Free Delivery" },
  { id: "new_user", name: "New User" },
]

// Mock offers data
const MOCK_OFFERS = [
  {
    id: "offer1",
    title: "50% OFF up to ₹100",
    code: "WELCOME50",
    description: "Get 50% off on your first order",
    expiryDate: "2028-06-30T23:59:59Z",
    minOrderValue: 199,
    maxDiscount: 100,
    category: "new_user",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&h=500&fit=crop",
    terms: ["Valid for new users only", "Minimum order value: ₹199", "Maximum discount: ₹100", "Valid once per user"],
    isPopular: true,
    gradientColors: COLORS.gradient1,
  },
  {
    id: "offer2",
    title: "₹75 OFF on UPI payments",
    code: "UPISAVE75",
    description: "Pay with any UPI app and get instant discount",
    expiryDate: "2023-06-25T23:59:59Z",
    minOrderValue: 300,
    maxDiscount: 75,
    category: "payment",
    image: "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=500&h=500&fit=crop",
    terms: [
      "Valid on all UPI payments",
      "Minimum order value: ₹300",
      "Maximum discount: ₹75",
      "Valid once per user per day",
    ],
    isPopular: true,
    gradientColors: COLORS.gradient2,
  },
  {
    id: "offer3",
    title: "FREE DELIVERY",
    code: "FREEDEL",
    description: "Free delivery on orders above ₹400",
    expiryDate: "2023-07-15T23:59:59Z",
    minOrderValue: 400,
    maxDiscount: 40,
    category: "delivery",
    image: "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=500&h=500&fit=crop",
    terms: [
      "Valid on all restaurants",
      "Minimum order value: ₹400",
      "Maximum discount on delivery fee: ₹40",
      "Valid multiple times",
    ],
    isPopular: false,
    gradientColors: COLORS.gradient3,
  },
  {
    id: "offer4",
    title: "20% OFF up to ₹150",
    code: "WEEKEND20",
    description: "Weekend special offer on selected restaurants",
    expiryDate: "2023-06-30T23:59:59Z",
    minOrderValue: 500,
    maxDiscount: 150,
    category: "restaurant",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&h=500&fit=crop",
    terms: [
      "Valid on selected restaurants only",
      "Minimum order value: ₹500",
      "Maximum discount: ₹150",
      "Valid on weekends only",
    ],
    isPopular: true,
    gradientColors: COLORS.gradient4,
  },
  {
    id: "offer5",
    title: "Buy 1 Get 1 FREE",
    code: "B1G1FREE",
    description: "Buy one get one free on selected items",
    expiryDate: "2023-07-10T23:59:59Z",
    minOrderValue: 399,
    maxDiscount: 200,
    category: "restaurant",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&h=500&fit=crop",
    terms: [
      "Valid on selected items only",
      "Minimum order value: ₹399",
      "Maximum discount: ₹200",
      "Valid once per user",
    ],
    isPopular: false,
    gradientColors: COLORS.gradient5,
  },
  {
    id: "offer6",
    title: "₹120 OFF on HDFC Cards",
    code: "HDFC120",
    description: "Special offer for HDFC Bank customers",
    expiryDate: "2023-07-20T23:59:59Z",
    minOrderValue: 450,
    maxDiscount: 120,
    category: "payment",
    image: "https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=500&h=500&fit=crop",
    terms: [
      "Valid on HDFC credit and debit cards",
      "Minimum order value: ₹450",
      "Maximum discount: ₹120",
      "Valid twice per user",
    ],
    isPopular: false,
    gradientColors: COLORS.gradient1,
  },
  {
    id: "offer7",
    title: "30% OFF up to ₹200",
    code: "TASTY30",
    description: "Special discount on top-rated restaurants",
    expiryDate: "2023-07-05T23:59:59Z",
    minOrderValue: 600,
    maxDiscount: 200,
    category: "restaurant",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&h=500&fit=crop",
    terms: [
      "Valid on restaurants with 4.5+ rating",
      "Minimum order value: ₹600",
      "Maximum discount: ₹200",
      "Valid once per week per user",
    ],
    isPopular: true,
    gradientColors: COLORS.gradient2,
  },
]

// Helper function to check if an offer is expired
const isExpired = (dateString) => {
  const expiryDate = new Date(dateString)
  const now = new Date()
  return expiryDate < now
}

export default function AllOffersScreen() {
  const insets = useSafeAreaInsets()
  const [offers, setOffers] = useState([])
  const [filteredOffers, setFilteredOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [copiedCode, setCopiedCode] = useState("")
  const [showCopiedMessage, setShowCopiedMessage] = useState(false)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current
  const bounceAnim = useRef(new Animated.Value(1)).current

  // Fetch offers data
  useEffect(() => {
    fetchOffers()
  }, [])

  const fetchOffers = async () => {
    try {
      setLoading(true)
      setError(null)
      setTimeout(() => {
        setOffers(MOCK_OFFERS)
        setFilteredOffers(MOCK_OFFERS)
        setLoading(false)
      }, 1000)
    } catch (err) {
      console.error("Failed to fetch offers:", err)
      setError(err.message || "Failed to load offers")
      setLoading(false)
    }
  }

  useEffect(() => {
    if (offers.length > 0) {
      let result = [...offers]

      // Filter by category
      if (selectedCategory !== "all") {
        result = result.filter((offer) => offer.category === selectedCategory)
      }

      // Filter by search query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase()
        result = result.filter(
          (offer) =>
            offer.title.toLowerCase().includes(query) ||
            offer.description.toLowerCase().includes(query) ||
            offer.code.toLowerCase().includes(query),
        )
      }

      setFilteredOffers(result)
    }
  }, [offers, searchQuery, selectedCategory])

  useEffect(() => {
    if (!loading && offers.length > 0) {
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
    }
  }, [loading, offers])

  const triggerHaptic = (type = "light") => {
    switch (type) {
      case "light":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        break
      case "medium":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        break
      case "success":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        break
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
  }

  const handleBack = () => {
    triggerHaptic("light")
    router.back()
  }

  const handleCategoryPress = (categoryId) => {
    triggerHaptic("light")
    setSelectedCategory(categoryId)
  }

  const copyToClipboard = async (code) => {
    triggerHaptic("success")
    await Clipboard.setStringAsync(code)
    setCopiedCode(code)
    setShowCopiedMessage(true)
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()

    setTimeout(() => {
      setShowCopiedMessage(false)
    }, 1000)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const handleApplyOffer = (offer) => {
    triggerHaptic("medium")
    copyToClipboard(offer.code)
  }

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Offers</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading offers...</Text>
        </View>
      </View>
    )
  }

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Offers</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchOffers}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Offers</Text>
          <View style={{ width: 24 }} />
        </View>

        <View className="flex-row items-center bg-[#F5F5F5] rounded-lg px-2 mx-4 py-1">
          <Ionicons name="search" size={20} color={COLORS.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search offers, codes, restaurants..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {/* {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
              <Ionicons name="close-circle" size={16} color={COLORS.textLight} />
            </TouchableOpacity>
          )} */}
        </View>
      </View>

      {/* Category Tabs - now more compact */}
      <View style={styles.categoryTabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {OFFER_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryTab, selectedCategory === category.id && styles.selectedCategoryTab]}
              onPress={() => handleCategoryPress(category.id)}
            >
              <Text style={[styles.categoryText, selectedCategory === category.id && styles.selectedCategoryText]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Offers List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {filteredOffers.length > 0 ? (
            filteredOffers.map((offer, index) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                onCopy={copyToClipboard}
                onApply={handleApplyOffer}
                isCopied={showCopiedMessage && copiedCode === offer.code}
                bounceAnim={showCopiedMessage && copiedCode === offer.code ? bounceAnim : new Animated.Value(1)}
                index={index}
                formatDate={formatDate}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/512/6598/6598519.png",
                }}
                style={styles.emptyImage}
              />
              <Text style={styles.emptyTitle}>No offers found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery ? `No offers matching "${searchQuery}"` : "No offers available for this category"}
              </Text>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  setSearchQuery("")
                  setSelectedCategory("all")
                }}
              >
                <Text style={styles.resetButtonText}>Show all offers</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  )
}

const OfferCard = ({ offer, onCopy, onApply, isCopied, bounceAnim, index, formatDate }: any) => {
  const [expanded, setExpanded] = useState(false)
  const isOfferExpired = isExpired(offer.expiryDate)

  const handleToggleExpand = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setExpanded(!expanded)
  }

  return (
    <Animated.View
      className="bg-white rounded-2xl mb-4 overflow-hidden"
      style={[
        {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3
        },
        isCopied && { transform: [{ scale: bounceAnim }] }
      ]}
    >
      <LinearGradient
        colors={offer.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="p-4 relative"
      >
        {offer.isPopular && !isOfferExpired && (
          <View className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-lg z-10">
            <Text className="text-xs font-bold" style={{ color: offer.gradientColors[0] }}>POPULAR</Text>
          </View>
        )}

        {isOfferExpired && (
          <View className="absolute top-3 right-3 bg-black/70 px-2 py-1 rounded-lg z-10">
            <Text className="text-xs font-bold text-white">EXPIRED</Text>
          </View>
        )}

        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-xl font-extrabold text-white mb-1">{offer.title}</Text>
            <Text className="text-sm text-white/90">{offer.description}</Text>
          </View>
          <Image
            source={{ uri: offer.image }}
            className="w-16 h-16 rounded-lg border-2 border-white/30"
          />
        </View>
      </LinearGradient>

      <View className="p-4">
        {/* Code and Copy Button */}
        <Text className="text-xs text-gray-500 mb-1">Use Code</Text>

        <View className="flex-row items-center justify-between mb-4">

          <View className="flex-1 mr-3">
            <View className="bg-gray-100 rounded-lg px-3 py-2 border border-gray-200 border-dashed">
              <Text className="text-base font-bold tracking-wider">{offer.code}</Text>
            </View>
          </View>

          <TouchableOpacity
            className={`flex-row items-center px-4 py-2.5 rounded-lg ${isOfferExpired ? 'bg-gray-100 opacity-70' : 'bg-gray-100'}`}
            onPress={() => !isOfferExpired && onCopy(offer.code)}
            disabled={isOfferExpired}
            style={{ minWidth: 90, justifyContent: 'center' }}
          >
            <Ionicons
              name={isCopied ? "checkmark-circle" : "copy-outline"}
              size={18}
              color={isCopied ? "#66BB6A" : "#FF5A5F"}
              style={{ marginRight: 6 }}
            />
            <Text
              className={`text-sm font-semibold ${isCopied ? 'text-green-600' : 'text-[#FF5A5F]'} ${isOfferExpired ? 'text-gray-400' : ''}`}
            >
              {isCopied ? "Copied" : "Copy"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Offer Details */}
        <View className="mb-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="pricetag-outline" size={16} color="#78909C" className="mr-2" />
            <Text className="text-sm text-gray-500">
              Min order: <Text className="text-gray-700 font-semibold">₹{offer.minOrderValue}</Text>
            </Text>
          </View>

          <View className="flex-row items-center mb-2">
            <Ionicons name="cash-outline" size={16} color="#78909C" className="mr-2" />
            <Text className="text-sm text-gray-500">
              Max discount: <Text className="text-gray-700 font-semibold">₹{offer.maxDiscount}</Text>
            </Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={16} color="#78909C" className="mr-2" />
            <Text className="text-sm text-gray-500">
              Valid till: <Text className="text-gray-700 font-semibold">{formatDate(offer.expiryDate)}</Text>
            </Text>
          </View>
        </View>

        {/* Terms Toggle */}
        <TouchableOpacity
          className="flex-row items-center justify-center py-2 mb-4"
          onPress={handleToggleExpand}
        >
          <Text className="text-sm font-medium text-[#FF5A5F] mr-1">
            {expanded ? "Hide Terms & Conditions" : "View Terms & Conditions"}
          </Text>
          <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color="#FF5A5F" />
        </TouchableOpacity>

        {/* Terms Container */}
        {expanded && (
          <View className="bg-gray-50 rounded-lg p-3 mb-4">
            {offer.terms.map((term, idx) => (
              <View key={idx} className="flex-row items-start mb-2 last:mb-0">
                <View className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 mr-2" />
                <Text className="flex-1 text-xs text-gray-500">{term}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Apply Button */}
        {/* <TouchableOpacity
          className={`rounded-xl py-3 items-center ${isOfferExpired ? 'bg-gray-100 opacity-70' : 'bg-[#FF5A5F]'}`}
          onPress={() => !isOfferExpired && onApply(offer)}
          disabled={isOfferExpired}
        >
          <Text
            className={`text-base font-semibold ${isOfferExpired ? 'text-gray-400' : 'text-white'}`}
          >
            {isOfferExpired ? "Offer Expired" : "Apply Offer"}
          </Text>
        </TouchableOpacity> */}
      </View>
    </Animated.View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // New header container that includes both header and search
  headerContainer: {
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingBottom: 8,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8, // Reduced from 12
  },

  backButton: {
    padding: 4,
  },

  headerTitle: {
    fontSize: 18, // Reduced from 20
    fontWeight: "700",
    color: COLORS.text,
  },

  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F5F5F5",
    borderRadius: 8, // Smaller radius
    paddingHorizontal: 10,
    marginHorizontal: 16,
    height: 36, // Fixed height instead of using padding
  },

  searchIcon: {
    marginRight: 6, // Reduced spacing
  },

  searchInput: {
    height: 44, // Match container height
    fontSize: 16, // Smaller font
    color: COLORS.text,
    padding: 0, // Remove default padding
  },

  categoryTabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    backgroundColor: COLORS.background,
  },

  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6, // Very minimal padding
  },

  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 4, // Minimal vertical padding
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    marginRight: 8,
    marginBottom: 2,
  },

  selectedCategoryTab: {
    backgroundColor: COLORS.primary,
  },

  categoryText: {
    fontSize: 12, // Smaller font
    fontWeight: "500",
    color: COLORS.textLight,
  },

  selectedCategoryText: {
    color: COLORS.light,
  },

  scrollView: {
    flex: 1,
  },

  // Content starts closer to the top
  content: {
    padding: 12, // Reduced from 16
    paddingBottom: 24,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textLight,
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.error,
    textAlign: "center",
  },

  retryButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },

  retryButtonText: {
    color: COLORS.light,
    fontWeight: "600",
    fontSize: 16,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    marginTop: 40,
  },

  emptyImage: {
    width: 100,
    height: 100,
    marginBottom: 16,
    opacity: 0.7,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: "center",
    marginBottom: 16,
  },

  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },

  resetButtonText: {
    color: COLORS.light,
    fontWeight: "600",
    fontSize: 16,
  },

  offerCard: {
    backgroundColor: COLORS.light,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  offerHeader: {
    padding: 16,
    position: "relative",
  },

  popularBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },

  popularBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.primary,
  },

  expiredBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },

  expiredBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.light,
  },

  offerHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  offerTitleContainer: {
    flex: 1,
    marginRight: 12,
  },

  offerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.light,
    marginBottom: 6,
  },

  offerDescription: {
    fontSize: 14,
    color: COLORS.light,
    opacity: 0.9,
  },

  offerImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },

  offerBody: {
    padding: 16,
  },

  offerCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  codeWrapper: {
    flex: 1,
    marginRight: 12,
  },

  codeLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 4,
  },

  codeBox: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderStyle: "dashed",
  },

  codeText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: 1,
  },

  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },

  copyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
    marginLeft: 6,
  },

  disabledButton: {
    backgroundColor: "#F5F5F5",
    opacity: 0.7,
  },

  disabledButtonText: {
    color: COLORS.textLight,
  },

  offerDetailsContainer: {
    marginBottom: 16,
  },

  offerDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  offerDetailText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginLeft: 8,
  },

  offerDetailValue: {
    color: COLORS.text,
    fontWeight: "600",
  },

  termsToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    marginBottom: 16,
  },

  termsToggleText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.primary,
    marginRight: 4,
  },

  termsContainer: {
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },

  termItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },

  termBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textLight,
    marginTop: 6,
    marginRight: 8,
  },

  termText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textLight,
  },

  applyButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },

  applyButtonText: {
    color: COLORS.light,
    fontSize: 16,
    fontWeight: "600",
  }
})