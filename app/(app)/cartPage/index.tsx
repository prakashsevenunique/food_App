import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  TextInput,
  Alert,
} from "react-native"
import { Ionicons, Feather } from "@expo/vector-icons"
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

const { width, height } = Dimensions.get("window")

// Sample cart items
const INITIAL_CART_ITEMS = [
  {
    id: 1,
    name: "Margherita Pizza",
    restaurant: "Pizza Paradise",
    price: 299,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591",
    customizations: ["Extra Cheese"],
  },
  {
    id: 2,
    name: "Veg Burger",
    restaurant: "Burger Bliss",
    price: 149,
    quantity: 2,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
    customizations: ["No Onions", "Extra Mayo"],
  },
]

// Sample promo codes
const PROMO_CODES = [
  { code: "WELCOME50", discount: 50, maxDiscount: 100, minOrder: 199 },
  { code: "FREEDEL", discount: "delivery", minOrder: 299 },
  { code: "FLAT100", discount: 100, minOrder: 499 },
]

export default function CartScreen() {
  const insets = useSafeAreaInsets()
  const [cartItems, setCartItems] = useState(INITIAL_CART_ITEMS)
  const [promoCode, setPromoCode] = useState("")
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [deliveryFee, setDeliveryFee] = useState(40)
  const [deliveryAddress, setDeliveryAddress] = useState({
    address: "123 Main Street, Apt 4B",
    type: "Home",
  })

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const checkoutBtnAnim = useRef(new Animated.Value(1)).current

  const itemAnimations = useRef(cartItems.map(() => new Animated.Value(0))).current

  useEffect(() => {
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

    // Animate cart items
    Animated.stagger(
      150,
      itemAnimations.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ),
    ).start()
  }, [])

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const taxes = Math.round(subtotal * 0.05) // 5% tax

  const calculateDiscount = () => {
    if (!appliedPromo) return 0

    if (typeof appliedPromo.discount === "number") {
      if (appliedPromo.discount < 100) {
        const discountAmount = subtotal * (appliedPromo.discount / 100)
        return Math.min(discountAmount, appliedPromo.maxDiscount || Number.POSITIVE_INFINITY)
      } else {
        return appliedPromo.discount
      }
    } else if (appliedPromo.discount === "delivery") {
      return deliveryFee
    }

    return 0
  }

  const discount = calculateDiscount()
  const deliveryCharge = appliedPromo?.discount === "delivery" ? 0 : deliveryFee
  const total = subtotal + taxes + deliveryCharge - discount

  const handleQuantityChange = (id, change) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const newQuantity = item.quantity + change
          if (newQuantity < 1) {
            // Animate removal
            const index = prevItems.findIndex((i) => i.id === id)
            Animated.timing(itemAnimations[index], {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              setCartItems((prev) => prev.filter((i) => i.id !== id))
            })
            return item
          }
          return { ...item, quantity: newQuantity }
        }
        return item
      }),
    )
  }

  const handleRemoveItem = (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    const index = cartItems.findIndex((item) => item.id === id)

    // Animate removal
    Animated.timing(itemAnimations[index], {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCartItems((prev) => prev.filter((item) => item.id !== id))
    })
  }

  const handleApplyPromo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    if (!promoCode.trim()) {
      return
    }

    const promo = PROMO_CODES.find((p) => p.code.toLowerCase() === promoCode.trim().toLowerCase())

    if (promo) {
      if (subtotal < promo.minOrder) {
        Alert.alert("Cannot Apply Promo", `This promo requires a minimum order of ₹${promo.minOrder}.`)
        return
      }

      setAppliedPromo(promo)
      setPromoCode("")

      // Success animation
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } else {
      Alert.alert("Invalid Promo Code", "The promo code you entered is invalid or expired.")
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }

  const handleRemovePromo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setAppliedPromo(null)
  }

  const handleCheckout = () => {
    Animated.sequence([
      Animated.timing(checkoutBtnAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(checkoutBtnAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start()

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push("/(app)/cartPage/checkout")

  }

  function triggerHaptic(intensity) {
    if (intensity === "light") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } else if (intensity === "medium") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    } else if (intensity === "heavy") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    }
  }

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
          className="absolute top-0 left-0 right-0 h-full"
        />
        <View className="flex-row items-center px-3">
          <TouchableOpacity onPress={() => router.back()} className="mx-2">
            <Ionicons name="arrow-back" size={24} color='white' />
          </TouchableOpacity>
          <View className="px-2 py-4">
            <Text className="text-2xl font-bold text-white">My Cart</Text>
          </View>
        </View>
      </View>

      {cartItems.length === 0 ? (
        <Animated.View
          className="flex-1 items-center justify-center px-6"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Image
            source={{ uri: "https://cdn-icons-png.flaticon.com/512/4555/4555971.png" }}
            style={{ width: 150, height: 150, opacity: 0.7 }}
          />
          <Text className="mt-6 text-xl font-bold text-center text-[#3D4152]">Your cart is empty</Text>
          <Text className="mt-2 text-base text-center text-[#93959F]">
            Looks like you haven't added anything to your cart yet
          </Text>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              router.push("/(tabs)/index")
            }}
            className="mt-6 px-6 py-3 rounded-full"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Text className="text-white font-bold text-base">Browse Restaurants</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          className="pt-4"
        >
          {/* Cart Items */}
          <View className="mb-6">
            {cartItems.map((item, index) => (
              <Animated.View
                key={item.id}
                style={{
                  opacity: itemAnimations[index],
                  transform: [
                    {
                      translateX: itemAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [-50, 0],
                      }),
                    },
                  ],
                  marginBottom: 16,
                  marginHorizontal: 16,
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
                  <View className="flex-row p-3">
                    <Image source={{ uri: `${item.image}?w=200` }} className="w-20 h-20 rounded-xl" />
                    <View className="flex-1 ml-3">
                      <View className="flex-row justify-between items-start">
                        <View className="flex-1 pr-2">
                          <Text className="font-bold text-base text-[#3D4152]" numberOfLines={1}>
                            {item.name}
                          </Text>
                          <Text className="text-xs text-[#93959F] mt-1">{item.restaurant}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleRemoveItem(item.id)} className="p-1">
                          <Ionicons name="close" size={20} color={COLORS.textLight} />
                        </TouchableOpacity>
                      </View>

                      {item.customizations?.length > 0 && (
                        <View className="mt-1 mb-2">
                          <Text className="text-xs text-[#93959F]">{item.customizations.join(", ")}</Text>
                        </View>
                      )}

                      <View className="flex-row justify-between items-center mt-auto">
                        <Text className="font-bold text-[#3D4152]">₹{item.price}</Text>

                        <View className="flex-row items-center">
                          <TouchableOpacity
                            onPress={() => handleQuantityChange(item.id, -1)}
                            className="w-8 h-8 rounded-full items-center justify-center"
                            style={{ backgroundColor: COLORS.lightGray }}
                          >
                            <Feather name="minus" size={16} color={COLORS.textDark} />
                          </TouchableOpacity>

                          <Text className="mx-3 font-bold text-[#3D4152]">{item.quantity}</Text>

                          <TouchableOpacity
                            onPress={() => handleQuantityChange(item.id, 1)}
                            className="w-8 h-8 rounded-full items-center justify-center"
                            style={{ backgroundColor: COLORS.primary }}
                          >
                            <Feather name="plus" size={16} color="white" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>

          {/* Delivery Address */}
          <Animated.View
            className="mx-4 mb-6"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Text className="text-base font-bold mb-3 text-[#3D4152]">Delivery Address</Text>
            <View
              className="bg-white rounded-2xl p-4 flex-row items-center"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: COLORS.lightGray }}
              >
                <Ionicons
                  name={deliveryAddress.type === "Home" ? "home" : "briefcase"}
                  size={20}
                  color={COLORS.primary}
                />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="font-bold text-[#3D4152]">{deliveryAddress.type}</Text>
                  <View className="ml-2 px-2 py-0.5 rounded bg-[#F8F8F8]">
                    <Text className="text-xs text-[#93959F]">Default</Text>
                  </View>
                </View>
                <Text className="text-sm text-[#93959F] mt-1" numberOfLines={2}>
                  {deliveryAddress.address}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  // Change address
                }}
                className="px-3 py-1.5 rounded-full"
                style={{ backgroundColor: COLORS.lightGray }}
              >
                <Text className="text-xs font-medium text-[#3D4152]">Change</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Promo Code */}
          <Animated.View
            className="mx-4 mb-6"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Text className="text-base font-bold mb-3 text-[#3D4152]">Promo Code</Text>

            {appliedPromo ? (
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
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: COLORS.accent + "20" }}
                    >
                      <Ionicons name="pricetag" size={20} color={COLORS.accent} />
                    </View>
                    <View>
                      <Text className="font-bold text-[#3D4152]">{appliedPromo.code}</Text>
                      <Text className="text-xs text-[#93959F] mt-0.5">
                        {typeof appliedPromo.discount === "number"
                          ? appliedPromo.discount < 100
                            ? `${appliedPromo.discount}% off up to ₹${appliedPromo.maxDiscount}`
                            : `₹${appliedPromo.discount} off`
                          : "Free Delivery"}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={handleRemovePromo}
                    className="px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: COLORS.lightGray }}
                  >
                    <Text className="text-xs font-medium text-[#E23744]">Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View
                className="bg-white rounded-2xl p-4 flex-row items-center"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: COLORS.lightGray }}
                >
                  <Ionicons name="pricetag-outline" size={20} color={COLORS.primary} />
                </View>
                <TextInput
                  className="flex-1 text-[#3D4152]"
                  placeholder="Enter promo code"
                  placeholderTextColor={COLORS.textLight}
                  value={promoCode}
                  onChangeText={setPromoCode}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  onPress={handleApplyPromo}
                  className="px-4 py-2 rounded-full"
                  style={{
                    backgroundColor: promoCode.trim() ? COLORS.primary : COLORS.lightGray,
                    opacity: promoCode.trim() ? 1 : 0.7,
                  }}
                  disabled={!promoCode.trim()}
                >
                  <Text className={`text-sm font-medium ${promoCode.trim() ? "text-white" : "text-[#93959F]"}`}>
                    Apply
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>

          {/* Bill Details */}
          <Animated.View
            className="mx-4"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Text className="text-base font-bold mb-3 text-[#3D4152]">Bill Details</Text>
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
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-[#93959F]">Item Total</Text>
                <Text className="font-medium text-[#3D4152]">₹{subtotal}</Text>
              </View>

              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-[#93959F]">Delivery Fee</Text>
                <Text className="font-medium text-[#3D4152]">
                  {appliedPromo?.discount === "delivery" ? (
                    <Text>
                      <Text className="line-through text-[#93959F]">₹{deliveryFee}</Text>
                      <Text className="text-[#60B246]"> FREE</Text>
                    </Text>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </Text>
              </View>

              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-[#93959F]">Taxes and Charges</Text>
                <Text className="font-medium text-[#3D4152]">₹{taxes}</Text>
              </View>

              {discount > 0 && (
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-[#60B246]">Discount</Text>
                  <Text className="font-medium text-[#60B246]">-₹{discount}</Text>
                </View>
              )}

              <View className="mt-2 pt-3 border-t border-[#F0F0F0]">
                <View className="flex-row justify-between items-center">
                  <Text className="font-bold text-base text-[#3D4152]">To Pay</Text>
                  <Text className="font-bold text-base text-[#3D4152]">₹{total}</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      )}

      {/* Checkout Button - Fixed at bottom */}
      {cartItems.length > 0 && (
        <View
          className="absolute bottom-0 left-0 right-0 px-2 py-2 bg-white"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 10,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          }}
        >
          <Animated.View
            style={{
              transform: [{ scale: checkoutBtnAnim }],
            }}
          >
            <TouchableOpacity onPress={handleCheckout} activeOpacity={0.9}>
              <LinearGradient
                colors={["#E23744", "#FF5A5F", "#FF7B7F"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-xl py-2 px-6 overflow-hidden"
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-white font-bold text-lg">₹{total}</Text>
                    <Text className="text-white text-xs opacity-90">View detailed bill</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-white font-bold text-base mr-2">Checkout</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </View>
  )
}