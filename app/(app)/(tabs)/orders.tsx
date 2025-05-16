import { useState, useRef, useEffect } from "react"
import { View, Text, Image, TouchableOpacity, Animated, Dimensions, StatusBar, FlatList } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import * as Haptics from "expo-haptics"
import { router } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
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

const { width } = Dimensions.get("window")

// Sample orders data
const ORDERS = [
  {
    id: "ORD12345",
    date: "Today, 2:30 PM",
    restaurant: "Pizza Paradise",
    items: [
      { name: "Margherita Pizza", quantity: 1 },
      { name: "Garlic Bread", quantity: 1 },
    ],
    total: 450,
    status: "active",
    statusText: "Delivery in progress",
    deliveryTime: "10-15 min",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591",
    trackingSteps: [
      { title: "Order Confirmed", completed: true, time: "2:30 PM" },
      { title: "Food Being Prepared", completed: true, time: "2:45 PM" },
      { title: "Out for Delivery", completed: true, time: "3:10 PM" },
      { title: "Delivered", completed: false, time: "" },
    ],
  },
  {
    id: "ORD12344",
    date: "Today, 12:15 PM",
    restaurant: "Burger Bliss",
    items: [
      { name: "Veg Burger", quantity: 2 },
      { name: "French Fries", quantity: 1 },
      { name: "Coke", quantity: 1 },
    ],
    total: 380,
    status: "completed",
    statusText: "Delivered",
    deliveryTime: "Delivered at 12:50 PM",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
    trackingSteps: [
      { title: "Order Confirmed", completed: true, time: "12:15 PM" },
      { title: "Food Being Prepared", completed: true, time: "12:25 PM" },
      { title: "Out for Delivery", completed: true, time: "12:40 PM" },
      { title: "Delivered", completed: true, time: "12:50 PM" },
    ],
  },
  {
    id: "ORD12343",
    date: "Yesterday, 8:00 PM",
    restaurant: "Spice Junction",
    items: [
      { name: "Butter Chicken", quantity: 1 },
      { name: "Naan", quantity: 2 },
      { name: "Pulao", quantity: 1 },
    ],
    total: 650,
    status: "completed",
    statusText: "Delivered",
    deliveryTime: "Delivered at 8:40 PM",
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0",
    trackingSteps: [
      { title: "Order Confirmed", completed: true, time: "8:00 PM" },
      { title: "Food Being Prepared", completed: true, time: "8:15 PM" },
      { title: "Out for Delivery", completed: true, time: "8:30 PM" },
      { title: "Delivered", completed: true, time: "8:40 PM" },
    ],
  },
  {
    id: "ORD12342",
    date: "20 May, 1:30 PM",
    restaurant: "Noodle House",
    items: [
      { name: "Hakka Noodles", quantity: 1 },
      { name: "Manchurian", quantity: 1 },
    ],
    total: 320,
    status: "completed",
    statusText: "Delivered",
    deliveryTime: "Delivered at 2:05 PM",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624",
    trackingSteps: [
      { title: "Order Confirmed", completed: true, time: "1:30 PM" },
      { title: "Food Being Prepared", completed: true, time: "1:45 PM" },
      { title: "Out for Delivery", completed: true, time: "1:55 PM" },
      { title: "Delivered", completed: true, time: "2:05 PM" },
    ],
  },
]

export default function OrdersScreen() {
  const insets = useSafeAreaInsets()
  const [activeTab, setActiveTab] = useState("active")
  const [expandedOrder, setExpandedOrder] = useState(null)

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const expandedOrderAnim = useRef(new Animated.Value(0)).current

  // Tab indicator animation
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current

  // Order item animations
  const orderAnimations = useRef(ORDERS.map(() => new Animated.Value(0))).current

  useEffect(() => {
    // Initial animations
    Animated.stagger(200, [
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

    // Animate order items
    Animated.stagger(
      150,
      orderAnimations.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ),
    ).start()
  }, [])

  useEffect(() => {
    // Animate tab indicator
    Animated.spring(tabIndicatorAnim, {
      toValue: activeTab === "active" ? 0 : 1,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start()
  }, [activeTab])

  const handleTabPress = (tab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setActiveTab(tab)
  }

  const handleOrderPress = (orderId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    if (expandedOrder === orderId) {
      // Animate out
      Animated.timing(expandedOrderAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setExpandedOrder(null)
      })
    } else {
      setExpandedOrder(orderId)
      // Animate in
      Animated.timing(expandedOrderAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }

  const filteredOrders = ORDERS.filter((order) =>
    activeTab === "active" ? order.status === "active" : order.status === "completed",
  )

  const renderOrderItem = ({ item, index }) => (
    <Animated.View
      style={{
        opacity: orderAnimations[index],
        transform: [
          {
            translateY: orderAnimations[index].interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          },
        ]
      }}
    >
      <TouchableOpacity activeOpacity={0.9} onPress={() => handleOrderPress(item.id)} className="mx-4 my-1">
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
          <View className="p-4 border-b border-[#F0F0F0]">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Image source={{ uri: `${item.image}?w=100` }} className="w-12 h-12 rounded-full" />
                <View className="ml-3">
                  <Text className="font-bold text-base text-[#3D4152]">{item.restaurant}</Text>
                  <Text className="text-xs text-[#93959F] mt-0.5">{item.date}</Text>
                </View>
              </View>
              <View
                className={`px-3 py-1 rounded-full ${item.status === "active" ? "bg-[#60B246]/20" : "bg-[#F8F8F8]"}`}
              >
                <Text
                  className={`text-xs font-medium ${item.status === "active" ? "text-[#60B246]" : "text-[#3D4152]"}`}
                >
                  {item.statusText}
                </Text>
              </View>
            </View>

            <View className="mt-3">
              <Text className="text-sm text-[#3D4152]">
                {item.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
              </Text>
              <View className="flex-row justify-between items-center mt-2">
                <Text className="font-bold text-[#3D4152]">₹{item.total}</Text>
                <View className="flex-row items-center">
                  {item.status === "active" ? (
                    <>
                      <Ionicons name="time-outline" size={14} color={COLORS.primary} />
                      <Text className="text-xs ml-1 font-medium text-[#E23744]">{item.deliveryTime}</Text>
                    </>
                  ) : (
                    <Text className="text-xs text-[#93959F]">{item.deliveryTime}</Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Order Details (Expanded) */}
          {expandedOrder === item.id && (
            <Animated.View
              className="p-4"
              style={{
                opacity: expandedOrderAnim,
                transform: [
                  {
                    translateY: expandedOrderAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              }}
            >
              <Text className="font-bold text-sm mb-3 text-[#3D4152]">Order Tracking</Text>

              {/* Tracking Steps */}
              <View className="mb-4">
                {item.trackingSteps.map((step, stepIndex) => (
                  <View key={stepIndex} className="flex-row mb-4 last:mb-0">
                    <View className="items-center mr-3">
                      <View
                        className={`w-6 h-6 rounded-full items-center justify-center ${
                          step.completed ? "bg-[#60B246]" : "bg-[#F0F0F0]"
                        }`}
                      >
                        {step.completed ? (
                          <Ionicons name="checkmark" size={16} color="white" />
                        ) : (
                          <View className="w-2 h-2 rounded-full bg-[#93959F]" />
                        )}
                      </View>

                      {stepIndex < item.trackingSteps.length - 1 && (
                        <View
                          className={`w-0.5 h-10 ${
                            step.completed && item.trackingSteps[stepIndex + 1].completed
                              ? "bg-[#60B246]"
                              : "bg-[#F0F0F0]"
                          }`}
                        />
                      )}
                    </View>

                    <View className="flex-1">
                      <Text className={`font-medium ${step.completed ? "text-[#3D4152]" : "text-[#93959F]"}`}>
                        {step.title}
                      </Text>
                      {step.time && <Text className="text-xs text-[#93959F] mt-0.5">{step.time}</Text>}
                    </View>
                  </View>
                ))}
              </View>

              {/* Action Buttons */}
              <View className="flex-row mt-2">
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    // Help with order
                  }}
                  className="flex-1 mr-2 py-2 rounded-xl items-center justify-center bg-[#F8F8F8]"
                >
                  <Text className="font-medium text-sm text-[#3D4152]">Help</Text>
                </TouchableOpacity>

                {item.status === "active" ? (
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push("/(app)/orderDetails")
                    }}
                    className="flex-1 ml-2 py-2 rounded-xl items-center justify-center overflow-hidden"
                  >
                    <LinearGradient
                      colors={["#E23744", "#FF5A5F", "#FF7B7F"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="absolute top-0 left-0 right-0 bottom-0"
                    />
                    <Text className="font-medium text-sm text-white">Track Order</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      router.push("/(tabs)/cart")
                    }}
                    className="flex-1 ml-2 py-2 rounded-xl items-center justify-center overflow-hidden"
                  >
                    <LinearGradient
                      colors={["#E23744", "#FF5A5F", "#FF7B7F"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="absolute top-0 left-0 right-0 bottom-0"
                    />
                    <Text className="font-medium text-sm text-white">Reorder</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  )

  return (
    <View className="flex-1 bg-white">
      <View style={{ 
        paddingTop: insets.top,
        backgroundColor: COLORS.background,
        zIndex: 10
      }}>
        <LinearGradient
          colors={["#FF5A5F", "#FF5A5F", "#FF7B7F"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          className="absolute top-0 left-0 right-0 h-[60px]"
        />
        <View className="px-4 py-4 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-white">My Orders</Text>
        </View>
      </View>

      {/* Tabs */}
      <View className="px-4 py-4">
        <View className="flex-row bg-[#F8F8F8] rounded-xl p-1">
          <Animated.View
            className="absolute top-1 bottom-1 rounded-lg bg-white"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          />

          <TouchableOpacity
            onPress={() => handleTabPress("active")}
            className="flex-1 py-2.5 items-center justify-center z-10"
          >
            <Text className={`font-medium ${activeTab === "active" ? "text-[#3D4152]" : "text-[#93959F]"}`}>
              Active Orders
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleTabPress("past")}
            className="flex-1 py-2.5 items-center justify-center z-10"
          >
            <Text className={`font-medium ${activeTab === "past" ? "text-[#3D4152]" : "text-[#93959F]"}`}>
              Past Orders
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Animated.View
          className="flex-1 items-center justify-center px-6"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Image
            source={{
              uri:
                activeTab === "active"
                  ? "https://cdn-icons-png.flaticon.com/512/5996/5996522.png"
                  : "https://cdn-icons-png.flaticon.com/512/1170/1170576.png",
            }}
            style={{ width: 150, height: 150, opacity: 0.7 }}
          />
          <Text className="mt-6 text-xl font-bold text-center text-[#3D4152]">
            {activeTab === "active" ? "No active orders" : "No past orders"}
          </Text>
          <Text className="mt-2 text-base text-center text-[#93959F]">
            {activeTab === "active"
              ? "Looks like you haven't placed any orders yet"
              : "You haven't completed any orders yet"}
          </Text>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              router.push("/(tabs)/index")
            }}
            className="mt-6 px-6 py-3 rounded-full overflow-hidden"
          >
            <LinearGradient
              colors={["#E23744", "#FF5A5F", "#FF7B7F"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="absolute top-0 left-0 right-0 bottom-0"
            />
            <Text className="text-white font-bold text-base">Browse Restaurants</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  )
}  