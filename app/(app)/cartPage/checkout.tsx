import React, { useEffect, useState, useRef } from "react"
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Animated,
    Dimensions,
    Easing,
    ActivityIndicator
} from "react-native"
import { router } from "expo-router"
import * as Haptics from "expo-haptics"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"

const { width, height } = Dimensions.get("window")

// Payment status types
type PaymentStatus = "processing" | "success" | "failed" | "pending"

export default function OrderConfirmationScreen() {
    // State to track payment status
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("processing")

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current
    const scaleAnim = useRef(new Animated.Value(0.9)).current
    const spinAnim = useRef(new Animated.Value(0)).current
    const successScaleAnim = useRef(new Animated.Value(0)).current
    const progressAnim = useRef(new Animated.Value(0)).current

    // Simulate payment processing
    useEffect(() => {
        // Start initial animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            })
        ]).start()

        // Start spinner animation
        Animated.loop(
            Animated.timing(spinAnim, {
                toValue: 1,
                duration: 1500,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start()

        // Start progress animation
        Animated.timing(progressAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
        }).start()

        const timer = setTimeout(() => {

            const statuses: PaymentStatus[] = ["success", "failed", "pending"]
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

            const finalStatus = Math.random() > 0.3 ? "pending" : randomStatus

            setPaymentStatus(finalStatus)

            // Trigger haptic feedback based on status
            if (finalStatus === "success") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

                // Animate success icon
                Animated.sequence([
                    Animated.timing(successScaleAnim, {
                        toValue: 1.2,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.spring(successScaleAnim, {
                        toValue: 1,
                        friction: 3,
                        tension: 40,
                        useNativeDriver: true,
                    })
                ]).start()
            } else if (finalStatus === "failed") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
            } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
            }
        }, 2000)

        return () => clearTimeout(timer)
    }, [])

    // Spin interpolation for the loading spinner
    const spin = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    })

    // Progress width interpolation
    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%']
    })

    // Get content based on payment status
    const getStatusContent = () => {
        switch (paymentStatus) {
            case "processing":
                return (
                    <View className="items-center">
                        <Animated.View
                            style={{
                                transform: [{ rotate: spin }],
                                marginBottom: 20
                            }}
                        >
                            <View className="rounded-full bg-[#E23744]/10 p-6">
                                <MaterialIcons name="payments" size={40} color="#E23744" />
                            </View>
                        </Animated.View>

                        <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
                            Processing Payment
                        </Text>
                        <Text className="text-gray-500 mb-6 text-center">
                            Please wait while we confirm your payment...
                        </Text>

                        <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-8">
                            <Animated.View
                                className="h-full bg-[#E23744]"
                                style={{ width: progressWidth }}
                            />
                        </View>
                    </View>
                )

            case "success":
                return (
                    <View className="items-center">
                        <Animated.View
                            className="rounded-full bg-[#60B246]/20 p-6 mb-6"
                            style={{
                                transform: [{ scale: successScaleAnim }]
                            }}
                        >
                            <Ionicons name="checkmark-circle" size={50} color="#60B246" />
                        </Animated.View>

                        <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
                            Order Confirmed!
                        </Text>
                        <Text className="text-gray-500 mb-6 text-center">
                            Your order has been placed successfully. You can track the status of your order below.
                        </Text>
                    </View>
                )

            case "failed":
                return (
                    <View className="items-center">
                        <View className="rounded-full bg-red-100 p-6 mb-6">
                            <Ionicons name="close-circle" size={50} color="#EF4444" />
                        </View>

                        <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
                            Payment Failed
                        </Text>
                        <Text className="text-gray-500 mb-6 text-center">
                            We couldn't process your payment. Please try again or use a different payment method.
                        </Text>
                    </View>
                )

            case "pending":
                return (
                    <View className="items-center">
                        <View className="rounded-full bg-yellow-100 p-6 mb-6">
                            <Ionicons name="time" size={50} color="#F59E0B" />
                        </View>

                        <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
                            Payment Pending
                        </Text>
                        <Text className="text-gray-500 mb-6 text-center">
                            Your payment is being processed. We'll notify you once it's confirmed.
                        </Text>
                    </View>
                )
        }
    }

    // Get action buttons based on payment status
    const getActionButtons = () => {
        switch (paymentStatus) {
            case "processing":
                return (
                    <View className="w-full opacity-50">
                        <TouchableOpacity
                            className="w-full bg-[#E23744] py-4 rounded-lg items-center"
                            disabled={true}
                        >
                            <Text className="text-white font-bold">Please Wait...</Text>
                        </TouchableOpacity>
                    </View>
                )

            case "success":
                return (
                    <View className="gap-y-3 w-full">
                        <TouchableOpacity
                            className="w-full bg-[#E23744] py-4 rounded-lg items-center flex-row justify-center"
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                router.push("/track-order")
                            }}
                        >
                            <Text className="text-white font-bold mr-2">Track Order</Text>
                            <Ionicons name="location" size={18} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="w-full bg-white border border-gray-200 py-4 rounded-lg items-center"
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                router.push("/")
                            }}
                        >
                            <Text className="text-gray-800 font-medium">Continue Shopping</Text>
                        </TouchableOpacity>
                    </View>
                )

            case "failed":
                return (
                    <View className="gap-y-3 w-full">
                        <TouchableOpacity
                            className="w-full bg-[#E23744] py-4 rounded-lg items-center"
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                                router.push("/checkout")
                            }}
                        >
                            <Text className="text-white font-bold">Try Again</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="w-full bg-white border border-gray-200 py-4 rounded-lg items-center"
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                router.push("/")
                            }}
                        >
                            <Text className="text-gray-800 font-medium">Cancel Order</Text>
                        </TouchableOpacity>
                    </View>
                )

            case "pending":
                return (
                    <View className="gap-y-3 w-full">
                        <TouchableOpacity
                            className="w-full bg-[#E23744] py-4 rounded-lg items-center"
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                // Refresh payment status
                                setPaymentStatus("processing")

                                // Simulate checking again
                                setTimeout(() => {
                                    setPaymentStatus(Math.random() > 0.5 ? "success" : "pending")
                                }, 2000)
                            }}
                        >
                            <Text className="text-white font-bold">Check Status</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="w-full bg-white border border-gray-200 py-4 rounded-lg items-center"
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                router.push("/support")
                            }}
                        >
                            <Text className="text-gray-800 font-medium">Contact Support</Text>
                        </TouchableOpacity>
                    </View>
                )
        }
    }

    return (
        <SafeAreaView className="flex-1">
            <StatusBar
                translucent={true}
                backgroundColor="transparent"
                barStyle="dark-content"
            />
            <LinearGradient
                colors={
                    paymentStatus === "success" ? ["#60B246", "#4CAF50"] :
                        paymentStatus === "failed" ? ["#EF4444", "#DC2626"] :
                            paymentStatus === "pending" ? ["#F59E0B", "#FBBF24"] :
                                ["#E23744", "#FF5A5F"]
                }
                className="absolute top-0 left-0 right-0 h-64"
            />

            <Animated.View
                className="flex-1 items-center justify-center p-4"
                style={{
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }]
                }}
            >
                <View className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
                    {getStatusContent()}

                    <View className="bg-gray-50 rounded-lg p-4 mb-6">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-500">Order ID</Text>
                            <Text className="font-medium">#ORD12345</Text>
                        </View>
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-500">Amount Paid</Text>
                            <Text className="font-medium">₹488</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-500">Estimated Delivery</Text>
                            <Text className="font-medium">30-40 mins</Text>
                        </View>
                    </View>

                    {getActionButtons()}
                </View>
            </Animated.View>

            {/* Animated background elements for visual appeal */}
            {paymentStatus === "success" && (
                <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}>
                    {[...Array(10)].map((_, i) => {
                        const size = Math.random() * 20 + 10
                        const animatedValue = new Animated.Value(0)

                        Animated.timing(animatedValue, {
                            toValue: 1,
                            duration: 2000 + Math.random() * 3000,
                            delay: i * 200,
                            useNativeDriver: true,
                            easing: Easing.ease
                        }).start()

                        const translateY = animatedValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [height, -100]
                        })

                        const translateX = animatedValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [Math.random() * width, Math.random() * width - 50]
                        })

                        const opacity = animatedValue.interpolate({
                            inputRange: [0, 0.7, 1],
                            outputRange: [0, 0.7, 0]
                        })

                        return (
                            <Animated.View
                                key={i}
                                style={{
                                    position: 'absolute',
                                    width: size,
                                    height: size,
                                    borderRadius: size / 2,
                                    backgroundColor: '#60B246',
                                    opacity,
                                    transform: [{ translateY }, { translateX }]
                                }}
                            />
                        )
                    })}
                </Animated.View>
            )}
        </SafeAreaView>
    )
}