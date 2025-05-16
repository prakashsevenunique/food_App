import { useState, useRef, useEffect } from "react"
import { View, Text, Image, TouchableOpacity, Animated, ScrollView, Dimensions, Linking } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import * as Haptics from "expo-haptics"
import { router, useLocalSearchParams } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import LottieView from "lottie-react-native"
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
}

const { width, height } = Dimensions.get("window")

// Sample order data - in a real app, this would come from an API
const ORDER_DETAILS = {
  id: "ORD12345",
  date: "Today, 2:30 PM",
  restaurant: {
    name: "Pizza Paradise",
    address: "123 Main Street, Downtown",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591",
    phone: "+1 555-123-4567",
  },
  items: [
    { name: "Margherita Pizza", quantity: 1, price: 350 },
    { name: "Garlic Bread", quantity: 1, price: 100 },
  ],
  subtotal: 450,
  deliveryFee: 40,
  discount: 50,
  total: 440,
  paymentMethod: "Paid via Credit Card",
  deliveryAddress: "456 Apartment Building, Apt 4B, New York, NY 10001",
  status: "active",
  statusText: "Delivery in progress",
  estimatedDelivery: "3:15 PM",
  deliveryTime: "10-15 min",
  trackingSteps: [
    { title: "Order Confirmed", completed: true, time: "2:30 PM", description: "Your order has been received" },
    {
      title: "Food Being Prepared",
      completed: true,
      time: "2:45 PM",
      description: "Restaurant is preparing your food",
    },
    {
      title: "Out for Delivery",
      completed: true,
      time: "3:10 PM",
      description: "Your order is on the way",
    },
    { title: "Delivered", completed: false, time: "", description: "Enjoy your meal!" },
  ],
  deliveryPartner: {
    name: "Michael Johnson",
    phone: "+1 555-987-6543",
    rating: 4.8,
    image: "https://randomuser.me/api/portraits/men/36.jpg",
    totalDeliveries: 342,
    location: {
      latitude: 40.7128,
      longitude: -74.006,
    },
  },
  userLocation: {
    latitude: 40.7282,
    longitude: -73.994,
  },
  restaurantLocation: {
    latitude: 40.7058,
    longitude: -74.009,
  },
}

export default function TrackOrderScreen() {
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams()
  const orderId = params.id || "ORD12345"

  // In a real app, you would fetch the order details based on the ID
  const orderDetails = ORDER_DETAILS

  const [mapExpanded, setMapExpanded] = useState(false)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [currentStep, setCurrentStep] = useState(2) // Index of the current tracking step

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const mapHeightAnim = useRef(new Animated.Value(220)).current
  const detailsHeightAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  // Lottie animation ref
  const deliveryAnimation = useRef(null)

  useEffect(() => {
    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start()

    // Start pulsing animation for the delivery partner marker
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start()

    // Play delivery animation
    if (deliveryAnimation.current) {
      deliveryAnimation.current.play()
    }

    // Simulate order progress updates
    const timer = setTimeout(() => {
      setCurrentStep(3)
    }, 15000)

    return () => clearTimeout(timer)
  }, [])

  const toggleMapExpanded = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    Animated.spring(mapHeightAnim, {
      toValue: mapExpanded ? 220 : height * 0.5,
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start()

    setMapExpanded(!mapExpanded)
  }

  const toggleOrderDetails = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    Animated.timing(detailsHeightAnim, {
      toValue: showOrderDetails ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start()

    setShowOrderDetails(!showOrderDetails)
  }

  const handleCallDeliveryPartner = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    Linking.openURL(`tel:${orderDetails.deliveryPartner.phone}`)
  }

  const handleCallRestaurant = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    Linking.openURL(`tel:${orderDetails.restaurant.phone}`)
  }

  const handleNavigateBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.back()
  }

  const getRegion = () => {
    const { userLocation, restaurantLocation, deliveryPartner } = orderDetails

    // Calculate the center point between all locations
    const centerLat = (userLocation.latitude + restaurantLocation.latitude + deliveryPartner.location.latitude) / 3
    const centerLong = (userLocation.longitude + restaurantLocation.longitude + deliveryPartner.location.longitude) / 3

    // Calculate the deltas to ensure all points are visible
    const latDelta =
      Math.max(
        Math.abs(userLocation.latitude - restaurantLocation.latitude),
        Math.abs(userLocation.latitude - deliveryPartner.location.latitude),
        Math.abs(restaurantLocation.latitude - deliveryPartner.location.latitude),
      ) * 2.5

    const longDelta =
      Math.max(
        Math.abs(userLocation.longitude - restaurantLocation.longitude),
        Math.abs(userLocation.longitude - deliveryPartner.location.longitude),
        Math.abs(restaurantLocation.longitude - deliveryPartner.location.longitude),
      ) * 2.5

    return {
      latitude: centerLat,
      longitude: centerLong,
      latitudeDelta: latDelta,
      longitudeDelta: longDelta,
    }
  }

  const calculateProgress = () => {
    const completedSteps = orderDetails.trackingSteps.filter((step) => step.completed).length
    return completedSteps / orderDetails.trackingSteps.length
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top,
          backgroundColor: COLORS.background,
          zIndex: 10,
        }}
      >
        <LinearGradient
          colors={["#FF5A5F", "#FF5A5F", "#FF7B7F"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          className="absolute top-0 left-0 right-0 h-full"
        />
        <View className="px-4 py-4 flex-row items-center justify-between">
          <TouchableOpacity onPress={handleNavigateBack} className="p-1">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Track Order</Text>
          <TouchableOpacity className="p-1">
            <Ionicons name="notifications-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Animated.View
          style={{
            height: mapHeightAnim,
            width: "100%",
          }}
        >
          <View style={{ flex: 1, backgroundColor: "#f0f0f0", justifyContent: "center", alignItems: "center" }}>
            <View style={{ flexDirection: "row", marginTop: 10, justifyContent: "space-around", width: "80%" }}>
              <View style={{ alignItems: "center" }}>
                <View style={{ backgroundColor: "white", padding: 8, borderRadius: 20, marginBottom: 5 }}>
                  <Ionicons name="restaurant" size={18} color={COLORS.primary} />
                </View>
                <Text style={{ fontSize: 12 }}>Restaurant</Text>
              </View>

              <Animated.View
                style={{
                  alignItems: "center",
                  transform: [{ scale: pulseAnim }],
                }}
              >
                <View style={{ backgroundColor: COLORS.accent, padding: 8, borderRadius: 20, marginBottom: 5 }}>
                  <Ionicons name="bicycle" size={18} color="white" />
                </View>
                <Text style={{ fontSize: 12 }}>Delivery Partner</Text>
              </Animated.View>

              <View style={{ alignItems: "center" }}>
                <View style={{ backgroundColor: "white", padding: 8, borderRadius: 20, marginBottom: 5 }}>
                  <Ionicons name="home" size={18} color={COLORS.textDark} />
                </View>
                <Text style={{ fontSize: 12 }}>Your Location</Text>
              </View>
            </View>
          </View>

          {/* Map Expand Button */}
          <TouchableOpacity
            onPress={toggleMapExpanded}
            className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-md"
          >
            <Ionicons name={mapExpanded ? "contract" : "expand"} size={20} color={COLORS.textDark} />
          </TouchableOpacity>
        </Animated.View>

        {/* Delivery Partner Card */}
        <Animated.View
          className="mx-4 mt-4"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View
            className="bg-white rounded-2xl p-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Image source={{ uri: orderDetails.deliveryPartner.image }} className="w-14 h-14 rounded-full" />
                <View className="ml-3">
                  <Text className="font-bold text-base text-[#3D4152]">{orderDetails.deliveryPartner.name}</Text>
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="star" size={14} color="#FFCC00" />
                    <Text className="text-xs ml-1 text-[#3D4152]">{orderDetails.deliveryPartner.rating}</Text>
                    <Text className="text-xs ml-2 text-[#93959F]">
                      {orderDetails.deliveryPartner.totalDeliveries} deliveries
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row">
                <TouchableOpacity
                  onPress={handleCallDeliveryPartner}
                  className="w-10 h-10 rounded-full bg-[#60B246] items-center justify-center mr-2"
                >
                  <Ionicons name="call" size={18} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    // Open chat with delivery partner
                  }}
                  className="w-10 h-10 rounded-full bg-[#F8F8F8] items-center justify-center"
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color={COLORS.textDark} />
                </TouchableOpacity>
              </View>
            </View>

            <View className="mt-4 pt-4 border-t border-[#F0F0F0]">
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-[#F8F8F8] items-center justify-center">
                    <Ionicons name="time-outline" size={16} color={COLORS.primary} />
                  </View>
                  <Text className="ml-2 text-[#3D4152]">Estimated arrival</Text>
                </View>
                <Text className="font-bold text-[#3D4152]">{orderDetails.estimatedDelivery}</Text>
              </View>

              <View className="mt-3">
                <View className="h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                  <View
                    className="h-full bg-[#60B246] rounded-full"
                    style={{ width: `${calculateProgress() * 100}%` }}
                  />
                </View>
                <View className="flex-row justify-between mt-1">
                  <Text className="text-xs text-[#93959F]">Order placed</Text>
                  <Text className="text-xs text-[#93959F]">Delivered</Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Order Status Card */}
        <Animated.View
          className="mx-4 mt-4"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View
            className="bg-white rounded-2xl p-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-full bg-[#F8F8F8] items-center justify-center">

              </View>
              <View className="ml-3">
                <Text className="font-bold text-base text-[#3D4152]">Order Status</Text>
                <Text className="text-sm text-[#60B246] font-medium">
                  {orderDetails.trackingSteps[currentStep].title}
                </Text>
              </View>
            </View>

            {/* Tracking Steps */}
            <View className="mb-2">
              {orderDetails.trackingSteps.map((step, stepIndex) => (
                <View key={stepIndex} className="flex-row mb-4 last:mb-0">
                  <View className="items-center mr-3">
                    <View
                      className={`w-6 h-6 rounded-full items-center justify-center ${
                        step.completed || stepIndex === currentStep ? "bg-[#60B246]" : "bg-[#F0F0F0]"
                      }`}
                    >
                      {step.completed ? (
                        <Ionicons name="checkmark" size={16} color="white" />
                      ) : stepIndex === currentStep ? (
                        <View className="w-2 h-2 rounded-full bg-white" />
                      ) : (
                        <View className="w-2 h-2 rounded-full bg-[#93959F]" />
                      )}
                    </View>

                    {stepIndex < orderDetails.trackingSteps.length - 1 && (
                      <View
                        className={`w-0.5 h-12 ${
                          step.completed &&
                          (orderDetails.trackingSteps[stepIndex + 1].completed || stepIndex + 1 === currentStep)
                            ? "bg-[#60B246]"
                            : "bg-[#F0F0F0]"
                        }`}
                      />
                    )}
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text
                        className={`font-medium ${
                          step.completed || stepIndex === currentStep ? "text-[#3D4152]" : "text-[#93959F]"
                        }`}
                      >
                        {step.title}
                      </Text>
                      {step.time && (
                        <Text
                          className={`text-xs ${
                            step.completed || stepIndex === currentStep ? "text-[#3D4152]" : "text-[#93959F]"
                          }`}
                        >
                          {step.time}
                        </Text>
                      )}
                    </View>
                    <Text className="text-xs text-[#93959F] mt-1">{step.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Order Details Card */}
        <Animated.View
          className="mx-4 mt-4 mb-6"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View
            className="bg-white rounded-2xl overflow-hidden"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            {/* Order Header */}
            <TouchableOpacity activeOpacity={0.9} onPress={toggleOrderDetails} className="p-4">
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Image source={{ uri: orderDetails.restaurant.image }} className="w-12 h-12 rounded-full" />
                  <View className="ml-3">
                    <Text className="font-bold text-base text-[#3D4152]">{orderDetails.restaurant.name}</Text>
                    <Text className="text-xs text-[#93959F] mt-0.5">Order #{orderDetails.id}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={handleCallRestaurant}
                  className="w-10 h-10 rounded-full bg-[#F8F8F8] items-center justify-center"
                >
                  <Ionicons name="call-outline" size={18} color={COLORS.textDark} />
                </TouchableOpacity>
              </View>

              <View className="mt-3 flex-row justify-between items-center">
                <Text className="text-sm text-[#3D4152]">
                  {orderDetails.items.length} {orderDetails.items.length > 1 ? "items" : "item"}
                </Text>
                <View className="flex-row items-center">
                  <Text className="font-bold text-[#3D4152] mr-2">₹{orderDetails.total}</Text>
                  <Ionicons
                    name={showOrderDetails ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={COLORS.textLight}
                  />
                </View>
              </View>
            </TouchableOpacity>

            {/* Order Details (Expanded) */}
            <Animated.View
              style={{
                height: detailsHeightAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 250],
                }),
                opacity: detailsHeightAnim,
                overflow: "hidden",
              }}
            >
              <View className="p-4 pt-0 border-t border-[#F0F0F0] mt-2">
                {/* Order Items */}
                {orderDetails.items.map((item, index) => (
                  <View key={index} className="flex-row justify-between items-center py-2">
                    <View className="flex-row items-center">
                      <View className="w-6 h-6 rounded-full bg-[#F8F8F8] items-center justify-center mr-2">
                        <Text className="text-xs font-medium text-[#3D4152]">{item.quantity}x</Text>
                      </View>
                      <Text className="text-[#3D4152]">{item.name}</Text>
                    </View>
                    <Text className="text-[#3D4152]">₹{item.price}</Text>
                  </View>
                ))}

                {/* Order Summary */}
                <View className="mt-3 pt-3 border-t border-[#F0F0F0]">
                  <View className="flex-row justify-between items-center py-1">
                    <Text className="text-sm text-[#93959F]">Item Total</Text>
                    <Text className="text-sm text-[#3D4152]">₹{orderDetails.subtotal}</Text>
                  </View>
                  <View className="flex-row justify-between items-center py-1">
                    <Text className="text-sm text-[#93959F]">Delivery Fee</Text>
                    <Text className="text-sm text-[#3D4152]">₹{orderDetails.deliveryFee}</Text>
                  </View>
                  <View className="flex-row justify-between items-center py-1">
                    <Text className="text-sm text-[#93959F]">Discount</Text>
                    <Text className="text-sm text-[#60B246]">-₹{orderDetails.discount}</Text>
                  </View>
                  <View className="flex-row justify-between items-center pt-2 mt-2 border-t border-[#F0F0F0]">
                    <Text className="font-bold text-[#3D4152]">Total</Text>
                    <Text className="font-bold text-[#3D4152]">₹{orderDetails.total}</Text>
                  </View>
                </View>

                {/* Payment Method */}
                <View className="mt-3 pt-3 border-t border-[#F0F0F0] flex-row items-center">
                  <Ionicons name="card-outline" size={16} color={COLORS.textLight} />
                  <Text className="text-sm text-[#93959F] ml-2">{orderDetails.paymentMethod}</Text>
                </View>

                {/* Delivery Address */}
                <View className="mt-3 pt-3 border-t border-[#F0F0F0] flex-row">
                  <Ionicons name="location-outline" size={16} color={COLORS.textLight} className="mt-1" />
                  <Text className="text-sm text-[#93959F] ml-2 flex-1">{orderDetails.deliveryAddress}</Text>
                </View>
              </View>
            </Animated.View>
          </View>
        </Animated.View>

        {/* Help Button */}
        <View className="mx-4 mb-10">
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              // Navigate to help screen
            }}
            className="py-3 rounded-xl items-center justify-center bg-[#F8F8F8]"
          >
            <Text className="font-medium text-[#3D4152]">Need Help with this order?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}
