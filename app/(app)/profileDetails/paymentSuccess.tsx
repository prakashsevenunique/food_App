import { useEffect, useRef } from "react"
import { View, Text, TouchableOpacity, ScrollView, Animated, Dimensions, Share } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import * as Haptics from "expo-haptics"
import { router, useLocalSearchParams } from "expo-router"
import LottieView from "lottie-react-native"
import React from "react"

// Food Delivery color palette
const COLORS = {
    primary: "#E23744", // Zomato-inspired red
    textDark: "#3D4152",
    textLight: "#93959F",
    lightGray: "#F8F8F8",
    green: "#3AB757",
}

const { width: SCREEN_WIDTH } = Dimensions.get("window")

export default function PaymentSuccessScreen() {
    const insets = useSafeAreaInsets()
    const params = useLocalSearchParams()

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current
    const scaleAnim = useRef(new Animated.Value(0.9)).current
    const lottieRef = useRef(null)

    // Mock payment data - in a real app, this would come from params or API
    const paymentData = {
        amount: params.amount || "249.50",
        orderId: params.orderId || "FD8765",
        transactionId: params.transactionId || "TXN123456789",
        paymentMethod: params.paymentMethod || "Credit Card",
        date: params.date || new Date().toISOString(),
        restaurant: params.restaurant || "Burger King",
        items: [
            { name: "Whopper Burger", quantity: 1, price: 149.5 },
            { name: "French Fries (Medium)", quantity: 1, price: 70.0 },
            { name: "Coke (Medium)", quantity: 1, price: 30.0 },
        ],
        deliveryAddress: params.address || "123 Main Street, Apartment 4B, New York, NY 10001",
        deliveryTime: params.deliveryTime || "30-35 min",
    }

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    // Start animations when component mounts
    useEffect(() => {
        // Play haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

        // Start animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start()

        // Play lottie animation
        if (lottieRef.current) {
            lottieRef.current.play()
        }
    }, [])

    // Share receipt
    const shareReceipt = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        try {
            const message = `
Payment Successful!
Amount: ₹${paymentData.amount}
Order ID: ${paymentData.orderId}
Transaction ID: ${paymentData.transactionId}
Date: ${formatDate(paymentData.date)}
Restaurant: ${paymentData.restaurant}
      `.trim()

            await Share.share({
                message,
                title: "Payment Receipt",
            })
        } catch (error) {
            console.error("Error sharing receipt:", error)
        }
    }

    // Navigate to order tracking
    const goToOrderTracking = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        router.push({
            pathname: "/order-tracking",
            params: { orderId: paymentData.orderId },
        })
    }

    // Navigate to home
    const goToHome = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        router.replace("/")
    }

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View
                style={{
                    paddingTop: Math.max(20, insets.top),
                    paddingBottom: 12,
                }}
                className="bg-white px-4 flex-row items-center justify-between"
            >
                <TouchableOpacity onPress={goToHome}>
                    <Ionicons name="close" size={24} color="#3D4152" />
                </TouchableOpacity>
                <TouchableOpacity onPress={shareReceipt}>
                    <Ionicons name="share-outline" size={24} color="#3D4152" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Success Animation */}
                <Animated.View
                    className="items-center justify-center py-6"
                    style={{
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    }}
                >
                    <View className="w-32 h-32 mb-4">
                        <LottieView
                            ref={lottieRef}
                            source={require("@/assets/animation/animation.json")}
                            autoPlay
                            loop={false}
                        />
                    </View>
                    <Text className="text-2xl font-bold text-[#3D4152] text-center">Payment Successful!</Text>
                    <Text className="text-base text-[#93959F] text-center mt-2">Your order has been placed successfully</Text>
                    <View className="mt-4 bg-green-50 px-6 py-3 rounded-full">
                        <Text className="text-xl font-bold text-green-600">₹{paymentData.amount}</Text>
                    </View>
                </Animated.View>

                {/* Order Details */}
                <Animated.View
                    className="mx-4 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm mb-6"
                    style={{ opacity: fadeAnim }}
                >
                    <View className="p-4 border-b border-gray-100">
                        <Text className="text-lg font-bold text-[#3D4152]">Order Details</Text>
                    </View>

                    <View className="p-4 space-y-3">
                        <View className="flex-row justify-between">
                            <Text className="text-[#93959F]">Order ID</Text>
                            <Text className="text-[#3D4152] font-medium">{paymentData.orderId}</Text>
                        </View>

                        <View className="flex-row justify-between">
                            <Text className="text-[#93959F]">Restaurant</Text>
                            <Text className="text-[#3D4152] font-medium">{paymentData.restaurant}</Text>
                        </View>

                        <View className="flex-row justify-between">
                            <Text className="text-[#93959F]">Date & Time</Text>
                            <Text className="text-[#3D4152] font-medium">{formatDate(paymentData.date)}</Text>
                        </View>

                        <View className="flex-row justify-between">
                            <Text className="text-[#93959F]">Payment Method</Text>
                            <Text className="text-[#3D4152] font-medium">{paymentData.paymentMethod}</Text>
                        </View>

                        <View className="flex-row justify-between">
                            <Text className="text-[#93959F]">Transaction ID</Text>
                            <Text className="text-[#3D4152] font-medium">{paymentData.transactionId}</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Order Items */}
                <Animated.View
                    className="mx-4 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm mb-6"
                    style={{ opacity: fadeAnim }}
                >
                    <View className="p-4 border-b border-gray-100">
                        <Text className="text-lg font-bold text-[#3D4152]">Order Summary</Text>
                    </View>

                    <View className="p-4">
                        {paymentData.items.map((item, index) => (
                            <View key={index} className="flex-row justify-between py-2 border-b border-gray-50">
                                <View className="flex-row items-center">
                                    <View className="w-6 h-6 bg-gray-100 rounded-full items-center justify-center mr-2">
                                        <Text className="text-xs text-[#3D4152] font-medium">{item.quantity}x</Text>
                                    </View>
                                    <Text className="text-[#3D4152]">{item.name}</Text>
                                </View>
                                <Text className="text-[#3D4152]">₹{item.price.toFixed(2)}</Text>
                            </View>
                        ))}

                        <View className="mt-4 pt-3 border-t border-gray-100">
                            <View className="flex-row justify-between py-1">
                                <Text className="text-[#93959F]">Item Total</Text>
                                <Text className="text-[#3D4152]">
                                    ₹{paymentData.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                                </Text>
                            </View>

                            <View className="flex-row justify-between py-1">
                                <Text className="text-[#93959F]">Delivery Fee</Text>
                                <Text className="text-[#3D4152]">₹30.00</Text>
                            </View>

                            <View className="flex-row justify-between py-1">
                                <Text className="text-[#93959F]">Taxes</Text>
                                <Text className="text-[#3D4152]">₹20.00</Text>
                            </View>

                            <View className="flex-row justify-between py-2 mt-2 border-t border-gray-100">
                                <Text className="text-[#3D4152] font-bold">Total</Text>
                                <Text className="text-[#3D4152] font-bold">₹{paymentData.amount}</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* Delivery Details */}
                <Animated.View
                    className="mx-4 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm mb-6"
                    style={{ opacity: fadeAnim }}
                >
                    <View className="p-4 border-b border-gray-100">
                        <Text className="text-lg font-bold text-[#3D4152]">Delivery Details</Text>
                    </View>

                    <View className="p-4 space-y-3">
                        <View className="flex-row">
                            <View className="mr-3">
                                <Ionicons name="location-outline" size={20} color="#93959F" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[#3D4152] font-medium">Delivery Address</Text>
                                <Text className="text-[#93959F] mt-1">{paymentData.deliveryAddress}</Text>
                            </View>
                        </View>

                        <View className="flex-row">
                            <View className="mr-3">
                                <Ionicons name="time-outline" size={20} color="#93959F" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[#3D4152] font-medium">Estimated Delivery Time</Text>
                                <Text className="text-[#93959F] mt-1">{paymentData.deliveryTime}</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>

            {/* Bottom Actions */}
            <View className="p-4 bg-white border-t border-gray-100" style={{ paddingBottom: Math.max(16, insets.bottom) }}>
                <TouchableOpacity className="bg-[#E23744] py-3 rounded-lg items-center" onPress={goToOrderTracking}>
                    <Text className="text-white font-bold">Track Order</Text>
                </TouchableOpacity>

                <TouchableOpacity className="mt-3 py-3 rounded-lg items-center border border-gray-200" onPress={goToHome}>
                    <Text className="text-[#3D4152] font-medium">Back to Home</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}
