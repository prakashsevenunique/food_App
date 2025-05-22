import { useState, useRef, useEffect } from "react"
import { View, Text, TouchableOpacity, ScrollView, Animated, Dimensions, Modal } from "react-native"
import { Ionicons, FontAwesome } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"
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

const { height } = Dimensions.get("window")

// Filter options
const SORT_OPTIONS = ["Relevance", "Rating: High to Low", "Delivery Time", "Cost: Low to High", "Cost: High to Low"]

const TIME_OPTIONS = [
  { id: "schedule", name: "Schedule", icon: "calendar" },
  { id: "under30", name: "Under 30 mins", icon: "clock" },
]

const RATING_OPTIONS = [
  { id: "rating3.5", name: "Rated 3.5+", value: 3.5 },
  { id: "rating4.0", name: "Rated 4.0+", value: 4.0 },
]

const OFFERS_OPTIONS = [
  { id: "buy1get1", name: "Buy 1 Get 1 and more" },
  { id: "50off", name: "50% OFF and more" },
  { id: "noDeliveryFee", name: "No delivery fee" },
]

const PRICE_OPTIONS = [
  { id: "under300", name: "Under ₹300" },
  { id: "300to600", name: "₹300 - ₹600" },
  { id: "above600", name: "Above ₹600" },
]

interface FilterModalProps {
  visible: boolean
  onClose: () => void
  onApply: (filters: any) => void
  initialFilters?: any
}

export default function FilterModal({ visible, onClose, onApply, initialFilters = {} }: FilterModalProps) {
  const [activeFilterTab, setActiveFilterTab] = useState("sort")
  const [sortBy, setSortBy] = useState(initialFilters.sortBy || "Relevance")
  const [selectedTimeOptions, setSelectedTimeOptions] = useState(initialFilters.timeOptions || [])
  const [selectedRatingOptions, setSelectedRatingOptions] = useState(initialFilters.ratingOptions || [])
  const [selectedOfferOptions, setSelectedOfferOptions] = useState(initialFilters.offerOptions || [])
  const [selectedPriceOptions, setSelectedPriceOptions] = useState(initialFilters.priceOptions || [])

  // Animation values
  const modalAnim = useRef(new Animated.Value(height)).current

  // Modal animations
  useEffect(() => {
    if (visible) {
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
  }, [visible])

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

  // Handle filter tab selection
  const handleFilterTabPress = (tabId) => {
    triggerHaptic("light")
    setActiveFilterTab(tabId)
  }

  // Handle sort option selection
  const handleSortOptionPress = (option) => {
    triggerHaptic("light")
    setSortBy(option)
  }

  // Handle time option selection
  const handleTimeOptionPress = (optionId) => {
    triggerHaptic("light")
    if (selectedTimeOptions.includes(optionId)) {
      setSelectedTimeOptions(selectedTimeOptions.filter((id) => id !== optionId))
    } else {
      setSelectedTimeOptions([...selectedTimeOptions, optionId])
    }
  }

  // Handle rating option selection
  const handleRatingOptionPress = (optionId) => {
    triggerHaptic("light")
    if (selectedRatingOptions.includes(optionId)) {
      setSelectedRatingOptions(selectedRatingOptions.filter((id) => id !== optionId))
    } else {
      setSelectedRatingOptions([...selectedRatingOptions, optionId])
    }
  }

  // Handle offer option selection
  const handleOfferOptionPress = (optionId) => {
    triggerHaptic("light")
    if (selectedOfferOptions.includes(optionId)) {
      setSelectedOfferOptions(selectedOfferOptions.filter((id) => id !== optionId))
    } else {
      setSelectedOfferOptions([...selectedOfferOptions, optionId])
    }
  }

  // Handle price option selection
  const handlePriceOptionPress = (optionId) => {
    triggerHaptic("light")
    if (selectedPriceOptions.includes(optionId)) {
      setSelectedPriceOptions(selectedPriceOptions.filter((id) => id !== optionId))
    } else {
      setSelectedPriceOptions([...selectedPriceOptions, optionId])
    }
  }

  // Clear all filters
  const clearAllFilters = () => {
    triggerHaptic("medium")
    setSortBy("Relevance")
    setSelectedTimeOptions([])
    setSelectedRatingOptions([])
    setSelectedOfferOptions([])
    setSelectedPriceOptions([])
  }

  // Apply filters
  const handleApplyFilters = () => {
    triggerHaptic("medium")
    onApply({
      sortBy,
      timeOptions: selectedTimeOptions,
      ratingOptions: selectedRatingOptions,
      offerOptions: selectedOfferOptions,
      priceOptions: selectedPriceOptions,
    })
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="none">
      <View className="flex-1 bg-black/50 justify-end">
        <Animated.View
          className="bg-white rounded-t-3xl overflow-hidden"
          style={{
            transform: [{ translateY: modalAnim }],
            maxHeight: height * 0.85,
          }}
        >
          {/* Modal Header */}
          <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
            <Text className="text-xl font-bold text-[#3D4152]">Filters and sorting</Text>
            <View className="flex-row">
              <TouchableOpacity className="mr-4" onPress={clearAllFilters}>
                <Text className="text-[#FF5A5F] font-medium">Clear all</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Modal Content */}
          <View className="flex-row" style={{ height: height * 0.7 }}>
            {/* Left Sidebar */}
            <View className="w-24 bg-white border-r border-gray-100">
              <TouchableOpacity
                className={`py-4 px-2 items-center ${
                  activeFilterTab === "sort" ? "bg-white border-l-4 border-[#FF5A5F]" : "bg-gray-50"
                }`}
                onPress={() => handleFilterTabPress("sort")}
              >
                <Ionicons
                  name="swap-vertical"
                  size={20}
                  color={activeFilterTab === "sort" ? COLORS.primary : COLORS.textLight}
                />
                <Text
                  className={`text-xs mt-1 text-center ${
                    activeFilterTab === "sort" ? "text-[#FF5A5F] font-medium" : "text-[#93959F]"
                  }`}
                >
                  Sort By
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`py-4 px-2 items-center ${
                  activeFilterTab === "time" ? "bg-white border-l-4 border-[#FF5A5F]" : "bg-gray-50"
                }`}
                onPress={() => handleFilterTabPress("time")}
              >
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={activeFilterTab === "time" ? COLORS.primary : COLORS.textLight}
                />
                <Text
                  className={`text-xs mt-1 text-center ${
                    activeFilterTab === "time" ? "text-[#FF5A5F] font-medium" : "text-[#93959F]"
                  }`}
                >
                  Time
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`py-4 px-2 items-center ${
                  activeFilterTab === "rating" ? "bg-white border-l-4 border-[#FF5A5F]" : "bg-gray-50"
                }`}
                onPress={() => handleFilterTabPress("rating")}
              >
                <Ionicons
                  name="star-outline"
                  size={20}
                  color={activeFilterTab === "rating" ? COLORS.primary : COLORS.textLight}
                />
                <Text
                  className={`text-xs mt-1 text-center ${
                    activeFilterTab === "rating" ? "text-[#FF5A5F] font-medium" : "text-[#93959F]"
                  }`}
                >
                  Rating
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`py-4 px-2 items-center ${
                  activeFilterTab === "offers" ? "bg-white border-l-4 border-[#FF5A5F]" : "bg-gray-50"
                }`}
                onPress={() => handleFilterTabPress("offers")}
              >
                <Ionicons
                  name="pricetag-outline"
                  size={20}
                  color={activeFilterTab === "offers" ? COLORS.primary : COLORS.textLight}
                />
                <Text
                  className={`text-xs mt-1 text-center ${
                    activeFilterTab === "offers" ? "text-[#FF5A5F] font-medium" : "text-[#93959F]"
                  }`}
                >
                  Offers
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`py-4 px-2 items-center ${
                  activeFilterTab === "price" ? "bg-white border-l-4 border-[#FF5A5F]" : "bg-gray-50"
                }`}
                onPress={() => handleFilterTabPress("price")}
              >
                <FontAwesome
                  name="rupee"
                  size={20}
                  color={activeFilterTab === "price" ? COLORS.primary : COLORS.textLight}
                />
                <Text
                  className={`text-xs mt-1 text-center ${
                    activeFilterTab === "price" ? "text-[#FF5A5F] font-medium" : "text-[#93959F]"
                  }`}
                >
                  Dish Price
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`py-4 px-2 items-center ${
                  activeFilterTab === "cuisine" ? "bg-white border-l-4 border-[#FF5A5F]" : "bg-gray-50"
                }`}
                onPress={() => handleFilterTabPress("cuisine")}
              >
                <Ionicons
                  name="restaurant-outline"
                  size={20}
                  color={activeFilterTab === "cuisine" ? COLORS.primary : COLORS.textLight}
                />
                <Text
                  className={`text-xs mt-1 text-center ${
                    activeFilterTab === "cuisine" ? "text-[#FF5A5F] font-medium" : "text-[#93959F]"
                  }`}
                >
                  Cuisine
                </Text>
              </TouchableOpacity>
            </View>

            {/* Right Content */}
            <ScrollView className="flex-1 p-4">
              {/* Sort By Options */}
              {activeFilterTab === "sort" && (
                <View>
                  <Text className="text-lg font-medium text-[#3D4152] mb-4">Sort by</Text>
                  <View className="bg-gray-50 p-4 rounded-xl">
                    {SORT_OPTIONS.map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        className={`flex-row justify-between items-center ${
                          index < SORT_OPTIONS.length - 1 ? "mb-4" : ""
                        }`}
                        onPress={() => handleSortOptionPress(option)}
                      >
                        <Text className="text-[#3D4152] font-medium">{option}</Text>
                        {sortBy === option && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Time Options */}
              {activeFilterTab === "time" && (
                <View>
                  <Text className="text-lg font-medium text-[#3D4152] mb-4">Time</Text>
                  <View className="bg-gray-50 p-4 rounded-xl">
                    <View className="flex-row flex-wrap">
                      {TIME_OPTIONS.map((option) => (
                        <TouchableOpacity
                          key={option.id}
                          className={`mr-3 mb-3 p-4 rounded-xl border ${
                            selectedTimeOptions.includes(option.id)
                              ? "border-[#FF5A5F] bg-[#FFEAEB]"
                              : "border-gray-200 bg-white"
                          }`}
                          style={{ width: "45%" }}
                          onPress={() => handleTimeOptionPress(option.id)}
                        >
                          <View className="items-center">
                            <Ionicons
                              name={option.icon === "calendar" ? "calendar-outline" : "time-outline"}
                              size={24}
                              color={selectedTimeOptions.includes(option.id) ? COLORS.primary : COLORS.textDark}
                            />
                            <Text
                              className={`mt-2 text-center ${
                                selectedTimeOptions.includes(option.id)
                                  ? "text-[#FF5A5F] font-medium"
                                  : "text-[#3D4152]"
                              }`}
                            >
                              {option.name}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {/* Rating Options */}
              {activeFilterTab === "rating" && (
                <View>
                  <Text className="text-lg font-medium text-[#3D4152] mb-4">Restaurant Rating</Text>
                  <View className="bg-gray-50 p-4 rounded-xl">
                    <View className="flex-row flex-wrap">
                      {RATING_OPTIONS.map((option) => (
                        <TouchableOpacity
                          key={option.id}
                          className={`mr-3 mb-3 p-4 rounded-xl border ${
                            selectedRatingOptions.includes(option.id)
                              ? "border-[#FF5A5F] bg-[#FFEAEB]"
                              : "border-gray-200 bg-white"
                          }`}
                          style={{ width: "45%" }}
                          onPress={() => handleRatingOptionPress(option.id)}
                        >
                          <View className="items-center">
                            <Ionicons
                              name="star"
                              size={24}
                              color={selectedRatingOptions.includes(option.id) ? COLORS.primary : "#4CAF50"}
                            />
                            <Text
                              className={`mt-2 text-center ${
                                selectedRatingOptions.includes(option.id)
                                  ? "text-[#FF5A5F] font-medium"
                                  : "text-[#3D4152]"
                              }`}
                            >
                              {option.name}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {/* Offers Options */}
              {activeFilterTab === "offers" && (
                <View>
                  <Text className="text-lg font-medium text-[#3D4152] mb-4">Offers</Text>
                  <View className="bg-gray-50 p-4 rounded-xl">
                    {OFFERS_OPTIONS.map((option) => (
                      <TouchableOpacity
                        key={option.id}
                        className={`p-3 mb-3 rounded-xl border ${
                          selectedOfferOptions.includes(option.id)
                            ? "border-[#FF5A5F] bg-[#FFEAEB]"
                            : "border-gray-200 bg-white"
                        }`}
                        onPress={() => handleOfferOptionPress(option.id)}
                      >
                        <Text
                          className={`text-center ${
                            selectedOfferOptions.includes(option.id) ? "text-[#FF5A5F] font-medium" : "text-[#3D4152]"
                          }`}
                        >
                          {option.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Price Options */}
              {activeFilterTab === "price" && (
                <View>
                  <Text className="text-lg font-medium text-[#3D4152] mb-4">Dish Price</Text>
                  <View className="bg-gray-50 p-4 rounded-xl">
                    {PRICE_OPTIONS.map((option) => (
                      <TouchableOpacity
                        key={option.id}
                        className={`p-3 mb-3 rounded-xl border ${
                          selectedPriceOptions.includes(option.id)
                            ? "border-[#FF5A5F] bg-[#FFEAEB]"
                            : "border-gray-200 bg-white"
                        }`}
                        onPress={() => handlePriceOptionPress(option.id)}
                      >
                        <Text
                          className={`text-center ${
                            selectedPriceOptions.includes(option.id) ? "text-[#FF5A5F] font-medium" : "text-[#3D4152]"
                          }`}
                        >
                          {option.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Cuisine Options */}
              {activeFilterTab === "cuisine" && (
                <View>
                  <Text className="text-lg font-medium text-[#3D4152] mb-4">Cuisine</Text>
                  <View className="bg-gray-50 p-4 rounded-xl">
                    <Text className="text-center text-[#93959F]">Cuisine filters coming soon</Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>

          {/* Modal Footer */}
          <View className="flex-row border-t border-gray-100 p-4">
            <TouchableOpacity
              className="flex-1 py-3 items-center justify-center rounded-xl bg-gray-100 mr-2"
              onPress={onClose}
            >
              <Text className="font-medium text-[#3D4152]">Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3 items-center justify-center rounded-xl ml-2 overflow-hidden"
              onPress={handleApplyFilters}
            >
              <LinearGradient
                colors={["#FF5A5F", "#FF7B7F"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="absolute top-0 left-0 right-0 bottom-0"
              />
              <Text className="font-medium text-white">Show results</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}
