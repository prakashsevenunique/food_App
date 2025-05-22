import { useRef, useEffect, useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, Animated, Modal, TextInput, ActivityIndicator } from "react-native"
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import * as Haptics from "expo-haptics"
import { router } from "expo-router"
import React from "react"

// Food Delivery color palette
const COLORS = {
  primary: "#E23744", // Zomato-inspired red
  textDark: "#3D4152",
  textLight: "#93959F",
  lightGray: "#F8F8F8",
  green: "#3AB757",
  red: "#E23744",
}

// Sample transaction data
const TRANSACTIONS = [
  {
    id: "1",
    type: "credit",
    amount: 100,
    date: "2023-05-18T14:30:00",
    description: "Added money to wallet",
    paymentMethod: "Credit Card",
  },
  {
    id: "2",
    type: "debit",
    amount: 45.5,
    date: "2023-05-17T19:15:00",
    description: "Payment for order #FD8765",
    restaurant: "Burger King",
  },
  {
    id: "3",
    type: "credit",
    amount: 200,
    date: "2023-05-15T10:45:00",
    description: "Added money to wallet",
    paymentMethod: "UPI",
  },
  {
    id: "4",
    type: "debit",
    amount: 120.75,
    date: "2023-05-14T21:20:00",
    description: "Payment for order #FD8740",
    restaurant: "Pizza Hut",
  },
  {
    id: "5",
    type: "credit",
    amount: 50,
    date: "2023-05-10T16:30:00",
    description: "Cashback reward",
    paymentMethod: "Promotion",
  },
]

// Payment method options
const PAYMENT_METHODS = [
  {
    id: "credit-card",
    name: "Credit/Debit Card",
    icon: "credit-card",
    iconType: "FontAwesome5",
  },
  {
    id: "upi",
    name: "UPI",
    icon: "google-pay",
    iconType: "FontAwesome5",
  },
  {
    id: "net-banking",
    name: "Net Banking",
    icon: "wallet",
    iconType: "FontAwesome5",
  },
  {
    id: "wallet",
    name: "Other Wallets",
    icon: "wallet",
    iconType: "FontAwesome5",
  },
]

// Quick amount options
const QUICK_AMOUNTS = [100, 200, 500, 1000]

export default function WalletScreen() {
  const insets = useSafeAreaInsets()
  const [walletBalance, setWalletBalance] = useState(350.25)
  const [loading, setLoading] = useState(false)
  const [transactions, setTransactions] = useState(TRANSACTIONS)
  const [addMoneyModalVisible, setAddMoneyModalVisible] = useState(false)
  const [amount, setAmount] = useState("")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null)
  const [processingPayment, setProcessingPayment] = useState(false)

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const modalScaleAnim = useRef(new Animated.Value(0.9)).current
  const balanceScaleAnim = useRef(new Animated.Value(1)).current

  // Initialize animations
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [])

  // Animate modal when it becomes visible
  useEffect(() => {
    if (addMoneyModalVisible) {
      Animated.spring(modalScaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start()
    } else {
      modalScaleAnim.setValue(0.9)
    }
  }, [addMoneyModalVisible])

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Handle add money button press
  const handleAddMoneyPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setAmount("")
    setSelectedPaymentMethod(null)
    setAddMoneyModalVisible(true)
  }

  // Handle quick amount selection
  const handleQuickAmountSelect = (value) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setAmount(value.toString())
  }

  // Handle payment method selection
  const handlePaymentMethodSelect = (method) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelectedPaymentMethod(method)
  }

  // Handle add money confirmation
  const handleAddMoneyConfirm = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      return
    }

    if (!selectedPaymentMethod) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      return
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setProcessingPayment(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Add new transaction
      const newTransaction = {
        id: Date.now().toString(),
        type: "credit",
        amount: Number.parseFloat(amount),
        date: new Date().toISOString(),
        description: "Added money to wallet",
        paymentMethod: selectedPaymentMethod.name,
      }

      setTransactions([newTransaction, ...transactions])

      // Update wallet balance
      const newBalance = walletBalance + Number.parseFloat(amount)
      setWalletBalance(newBalance)

      // Animate balance change
      Animated.sequence([
        Animated.timing(balanceScaleAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(balanceScaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()

      // Close modal
      setAddMoneyModalVisible(false)
      setAmount("")
      setSelectedPaymentMethod(null)

      // Success feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch (error) {
      console.error("Error adding money:", error)
    } finally {
      setProcessingPayment(false)
    }
  }

  // Render transaction item
  const renderTransactionItem = ({ item }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-gray-100"
      onPress={() => {
        // Handle transaction details view
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      }}
    >
      <View
        className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
          item.type === "credit" ? "bg-green-100" : "bg-red-100"
        }`}
      >
        <Ionicons
          name={item.type === "credit" ? "arrow-down" : "arrow-up"}
          size={18}
          color={item.type === "credit" ? COLORS.green : COLORS.red}
        />
      </View>

      <View className="flex-1">
        <Text className="text-[#3D4152] font-medium">{item.description}</Text>
        <View className="flex-row items-center mt-1">
          <Text className="text-xs text-[#93959F]">{formatDate(item.date)}</Text>
          <Text className="text-xs text-[#93959F] mx-1">•</Text>
          <Text className="text-xs text-[#93959F]">{formatTime(item.date)}</Text>
        </View>
        {item.restaurant && (
          <Text className="text-xs text-[#93959F] mt-1">
            <Ionicons name="restaurant-outline" size={12} /> {item.restaurant}
          </Text>
        )}
        {item.paymentMethod && (
          <Text className="text-xs text-[#93959F] mt-1">
            <Ionicons name="card-outline" size={12} /> {item.paymentMethod}
          </Text>
        )}
      </View>

      <Text className={`font-bold ${item.type === "credit" ? "text-[#3AB757]" : "text-[#E23744]"}`}>
        {item.type === "credit" ? "+" : "-"}₹{item.amount.toFixed(2)}
      </Text>
    </TouchableOpacity>
  )

  // Render add money modal
  const renderAddMoneyModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={addMoneyModalVisible}
      onRequestClose={() => setAddMoneyModalVisible(false)}
    >
      <View className="flex-1 justify-end bg-black/50">
        <Animated.View
          className="bg-white rounded-t-3xl"
          style={{
            transform: [{ scale: modalScaleAnim }],
            opacity: fadeAnim,
          }}
        >
          <View className="p-5">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-[#3D4152]">Add Money</Text>
              <TouchableOpacity
                onPress={() => setAddMoneyModalVisible(false)}
                className="p-2"
                disabled={processingPayment}
              >
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View className="mb-6">
              <Text className="text-sm text-[#93959F] mb-2">Enter Amount</Text>
              <View className="flex-row items-center border-b border-gray-300 pb-2">
                <Text className="text-2xl font-bold text-[#3D4152] mr-2">₹</Text>
                <TextInput
                  className="text-2xl flex-1 text-[#3D4152] font-bold"
                  placeholder="0"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                  editable={!processingPayment}
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-sm text-[#93959F] mb-3">Quick Select</Text>
              <View className="flex-row justify-between">
                {QUICK_AMOUNTS.map((value) => (
                  <TouchableOpacity
                    key={value}
                    className={`py-2 px-4 rounded-full ${
                      amount === value.toString() ? "bg-[#E23744] border-[#E23744]" : "bg-white border-gray-300"
                    } border`}
                    onPress={() => handleQuickAmountSelect(value)}
                    disabled={processingPayment}
                  >
                    <Text className={`${amount === value.toString() ? "text-white" : "text-[#3D4152]"} font-medium`}>
                      ₹{value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-sm text-[#93959F] mb-3">Payment Method</Text>
              <View className="gap-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    className={`flex-row items-center p-3 rounded-lg border ${
                      selectedPaymentMethod?.id === method.id ? "border-[#E23744] bg-red-50" : "border-gray-200"
                    }`}
                    onPress={() => handlePaymentMethodSelect(method)}
                    disabled={processingPayment}
                  >
                    <View
                      className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                        selectedPaymentMethod?.id === method.id ? "bg-[#E23744]" : "bg-[#F8F8F8]"
                      }`}
                    >
                      {method.iconType === "FontAwesome5" ? (
                        <FontAwesome5
                          name={method.icon}
                          size={16}
                          color={selectedPaymentMethod?.id === method.id ? "white" : "#6B7280"}
                        />
                      ) : (
                        <Ionicons
                          name={method.icon}
                          size={16}
                          color={selectedPaymentMethod?.id === method.id ? "white" : "#6B7280"}
                        />
                      )}
                    </View>
                    <Text
                      className={`flex-1 font-medium ${
                        selectedPaymentMethod?.id === method.id ? "text-[#E23744]" : "text-[#3D4152]"
                      }`}
                    >
                      {method.name}
                    </Text>
                    <Ionicons
                      name={selectedPaymentMethod?.id === method.id ? "checkmark-circle" : "checkmark-circle-outline"}
                      size={22}
                      color={selectedPaymentMethod?.id === method.id ? "#E23744" : "#D1D5DB"}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              className={`py-4 rounded-lg items-center justify-center ${
                !amount || !selectedPaymentMethod || processingPayment ? "bg-red-300" : "bg-[#E23744]"
              }`}
              onPress={handleAddMoneyConfirm}
              disabled={!amount || !selectedPaymentMethod || processingPayment}
            >
              {processingPayment ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-bold text-base">Add Money</Text>
              )}
            </TouchableOpacity>
          </View>
          <View style={{ height: insets.bottom }} className="bg-white" />
        </Animated.View>
      </View>
    </Modal>
  )

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View
        className="bg-white px-4 border-b border-gray-100 flex-row items-center"
        style={{
          paddingTop: Math.max(20, insets.top),
          paddingBottom: 16,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#3D4152" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#3D4152]">Wallet</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Wallet Balance Card */}
        <Animated.View
          className="m-4 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
          style={{
            opacity: fadeAnim,
            transform: [{ scale: balanceScaleAnim }],
          }}
        >
          <View className="p-5">
            <Text className="text-[#93959F] font-medium">Available Balance</Text>
            <View className="flex-row items-center mt-2">
              <Text className="text-3xl font-bold text-[#3D4152]">₹{walletBalance.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              className="bg-[#E23744] py-3 px-4 rounded-lg mt-4 flex-row items-center justify-center"
              onPress={handleAddMoneyPress}
            >
              <Ionicons name="add-circle-outline" size={20} color="white" />
              <Text className="text-white font-bold ml-2">Add Money</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Transaction History */}
        <View className="mt-2 mb-4">
          <View className="px-4 py-3 flex-row justify-between items-center">
            <Text className="text-lg font-bold text-[#3D4152]">Transaction History</Text>
          </View>

          {transactions.length === 0 ? (
            <View className="items-center justify-center py-10">
              <MaterialCommunityIcons name="wallet-outline" size={60} color="#D1D5DB" />
              <Text className="text-[#93959F] mt-4 text-center">No transactions yet</Text>
            </View>
          ) : (
            <Animated.View style={{ opacity: fadeAnim }}>
              {transactions.map((transaction) => (
                <View key={transaction.id}>{renderTransactionItem({ item: transaction })}</View>
              ))}
            </Animated.View>
          )}
        </View>
      </ScrollView>

      {/* Add Money Modal */}
      {renderAddMoneyModal()}
    </View>
  )
}
