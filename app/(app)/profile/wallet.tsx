import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Linking,
  ActivityIndicator,
  RefreshControl,
} from "react-native"
import { Ionicons, FontAwesome, MaterialIcons } from "@expo/vector-icons"
import { useContext, useState, useEffect, useCallback } from "react"
import { router } from "expo-router"
import axiosInstance from "@/utils/axiosInstance"
import { UserContext } from "@/hooks/userInfo"
import { LinearGradient } from "expo-linear-gradient"

// Su stylo Salon color palette
const colors = {
  primary: "#E65305", // Bright red-orange as primary
  primaryLight: "#FF7A3D", // Lighter version of primary
  primaryLighter: "#FFA273", // Even lighter version
  secondary: "#FBA059", // Light orange as secondary
  secondaryLight: "#FFC59F", // Lighter version of secondary
  accent: "#FB8807", // Bright orange as accent
  accentLight: "#FFAA4D", // Lighter version of accent
  tertiary: "#F4A36C", // Peach/salmon as tertiary
  tertiaryLight: "#FFD0B0", // Lighter version of tertiary
  background: "#FFF9F5", // Very light orange/peach background
  cardBg: "#FFFFFF", // White for cards
  text: "#3D2C24", // Dark brown for text
  textLight: "#7D6E66", // Lighter text color
  textLighter: "#A99E98", // Even lighter text
  divider: "#FFE8D6", // Very light divider color
  success: "#10B981", // Green for success/credit
  error: "#EF4444", // Red for errors/debit
}

export default function WalletScreen() {
  const [isAddMoneyModalVisible, setIsAddMoneyModalVisible] = useState(false)
  const [amount, setAmount] = useState("")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("UPI")
  const { userInfo, fetchUserInfo } = useContext(UserContext) as any
  const [loading, setLoading] = useState(false)
  const [creditTransactions, setCreditTransactions] = useState([])
  const [debitTransactions, setDebitTransactions] = useState([])
  const [transactionsLoading, setTransactionsLoading] = useState(true)
  const [selectedGender, setSelectedGender] = useState("credit")
  const [refreshing, setRefreshing] = useState(false)

  const paymentMethods = [
    { id: "1", name: "UPI", icon: "currency-rupee", provider: "Any UPI App" },
    { id: "2", name: "Credit Card", icon: "credit-card", provider: "VISA/Mastercard" },
    { id: "3", name: "Debit Card", icon: "credit-card", provider: "VISA/Mastercard" },
    { id: "4", name: "Net Banking", icon: "money", provider: "All Banks" },
  ]

  useEffect(() => {
    fetchTransactions()
    fetchUserInfo()
  }, [])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchTransactions()
    fetchUserInfo()
  }, [])

  const fetchTransactions = async () => {
    setTransactionsLoading(true)
    try {
      // Fetch credit transactions (payIn)
      const creditResponse = await axiosInstance.get(`/api/payment/payin/report?userId=${userInfo?._id}`)
      const formattedCredit = creditResponse?.data?.data.map((txn: any) => ({
        id: txn._id,
        type: "credit",
        amount: txn.amount,
        description: txn.description || "Wallet Top-up",
        date: new Date(txn.createdAt).toLocaleDateString(),
        time: new Date(txn.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        icon: "arrow-down",
        iconColor: colors.success,
        status: txn.status,
      }))
      setCreditTransactions(formattedCredit)

      const debitResponse = await axiosInstance.get(`/api/payment/payOut/report?userId=${userInfo?._id}`)
      const formattedDebit = debitResponse?.data?.data.map((txn: any) => ({
        id: txn._id,
        type: "debit",
        amount: txn.amount,
        description: txn.description || "Paid for the order",
        date: new Date(txn.createdAt).toLocaleDateString(),
        time: new Date(txn.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        icon: "arrow-up",
        iconColor: colors.error,
        status: txn.status,
        account: `${txn.account} (${txn.ifsc})`,
      }))
      setDebitTransactions(formattedDebit)
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setTransactionsLoading(false)
      setRefreshing(false)
    }
  }

  const makePayment = async () => {
    if (!amount) {
      alert("Please enter a valid amount")
      return
    }
    if (!selectedPaymentMethod) {
      alert("Please select a payment method")
      return
    }
    setLoading(true)
    const referenceId = generateReferenceId()

    const data = {
      userId: userInfo?._id,
      amount: amount,
      reference: referenceId,
      name: userInfo?.name || "unknown",
      mobile: userInfo?.mobileNumber,
      email: userInfo?.email || "example@gmail.com",
    }
    try {
      const response = await axiosInstance.post("/api/payment/payIn", data)
      const paymentUrl = response.data?.data?.data?.payment_link
      Linking.openURL(paymentUrl)
      setAmount("")
      setSelectedPaymentMethod("")
      setIsAddMoneyModalVisible(false)
      router.push(`/(app)/profile/payment_success?trxId=${data.reference}&amount=${data.amount}`)
    } catch (error) {
      console.error("Error making payment request:", error)
      alert("Payment failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const generateReferenceId = () => {
    const prefix = "txn"
    const randomString = Math.random().toString(36).substring(2, 10)
    const randomNumber = Math.floor(Math.random() * 10000)
    return `${prefix}${randomNumber}${randomString}`
  }

  const renderTransactionItem = ({ item }: any) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            backgroundColor: item.type === "credit" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
            padding: 8,
            borderRadius: 9999,
          }}
        >
          <FontAwesome name={item.icon} size={18} color={item.iconColor} />
        </View>
        <View style={{ marginLeft: 12 }}>
          <Text style={{ fontWeight: "500", color: colors.text }}>{item.description}</Text>
          <Text style={{ color: colors.textLight, fontSize: 12, marginTop: 4 }}>
            {item.date} • {item.time}
          </Text>
          <View
            style={{
              marginTop: 4,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 9999,
              alignSelf: "flex-start",
              backgroundColor: item.status === "Completed" ? "rgba(16, 185, 129, 0.1)" : "rgba(251, 136, 7, 0.1)",
            }}
          >
            <Text
              style={{
                fontSize: 10,
                color: item.status === "Completed" ? colors.success : colors.accent,
              }}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </View>
      <Text
        style={{
          fontWeight: "bold",
          color: item.type === "credit" ? colors.success : colors.error,
        }}
      >
        {item.type === "credit" ? "+" : "-"}₹{item.amount}
      </Text>
    </View>
  )

  const renderPaymentMethod = ({ item }: any) => (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        marginBottom: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: selectedPaymentMethod === item.name ? colors.primary : colors.divider,
        backgroundColor: selectedPaymentMethod === item.name ? colors.tertiaryLight : colors.cardBg,
      }}
      onPress={() => {
        item.name == "UPI" && setSelectedPaymentMethod(item.name)
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <MaterialIcons name={item.icon} size={24} color={colors.textLight} />
        <View style={{ marginLeft: 12 }}>
          <Text style={{ fontWeight: "500", color: colors.text }}>{item.name}</Text>
          <Text style={{ color: colors.textLight, fontSize: 12 }}>{item.provider}</Text>
        </View>
      </View>
      {selectedPaymentMethod === item.name && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
    </TouchableOpacity>
  )

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: colors.cardBg,
          paddingHorizontal: 16,
          paddingVertical: 16,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
          borderBottomWidth: 1,
          borderBottomColor: colors.divider,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={25} color={colors.primary} />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 12, color: colors.text }}>My Wallet</Text>
          </View>
          <TouchableOpacity className="mr-2" onPress={() => router.push("/notification")}>
            <Ionicons name="notifications-outline" size={25} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Wallet Balance */}
      <LinearGradient
        colors={[colors.primary, colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          padding: 24,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <Text style={{ color: "white", fontSize: 18 }}>Wallet Balance</Text>
        <Text style={{ color: "white", fontSize: 36, fontWeight: "bold", marginTop: 8 }}>
          ₹{userInfo?.wallet?.balance}
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: "white",
            borderRadius: 9999,
            paddingHorizontal: 24,
            paddingVertical: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 24,
            shadowColor: "rgba(0,0,0,0.1)",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
          onPress={() => setIsAddMoneyModalVisible(true)}
        >
          <Ionicons name="add" size={20} color={colors.primary} />
          <Text style={{ color: colors.primary, fontWeight: "bold", marginLeft: 8 }}>Add Money</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Transaction Filter */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginVertical: 8,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.text }}>Recent Transactions</Text>
        <View
          style={{
            flexDirection: "row",
            backgroundColor: colors.tertiaryLight,
            borderRadius: 9999,
            padding: 4,
          }}
        >
          {["credit", "debit"].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 9999,
                backgroundColor: selectedGender === gender ? colors.primary : "transparent",
              }}
              onPress={() => setSelectedGender(gender)}
            >
              <Text
                style={{
                  color: selectedGender === gender ? "white" : colors.text,
                  fontWeight: selectedGender === gender ? "bold" : "normal",
                }}
              >
                {gender === "credit" ? "Credit" : "Debit"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Transactions List */}
      <View style={{ flex: 1, paddingHorizontal: 16, marginTop: 16 }}>
        {transactionsLoading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {selectedGender === "credit" ? (
              creditTransactions.length > 0 ? (
                <FlatList
                  data={creditTransactions}
                  renderItem={renderTransactionItem}
                  keyExtractor={(item: any) => item.id}
                  showsVerticalScrollIndicator={false}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      colors={[colors.primary]}
                      tintColor={colors.primary}
                    />
                  }
                />
              ) : (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 }}>
                  <Ionicons name="wallet-outline" size={50} color={colors.textLighter} />
                  <Text style={{ color: colors.textLight, marginTop: 12 }}>No credit transactions yet</Text>
                </View>
              )
            ) : debitTransactions.length > 0 ? (
              <FlatList
                data={debitTransactions}
                renderItem={renderTransactionItem}
                keyExtractor={(item: any) => item.id}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[colors.primary]}
                    tintColor={colors.primary}
                  />
                }
              />
            ) : (
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 }}>
                <Ionicons name="wallet-outline" size={50} color={colors.textLighter} />
                <Text style={{ color: colors.textLight, marginTop: 12 }}>No debit transactions yet</Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* Add Money Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddMoneyModalVisible}
        onRequestClose={() => setIsAddMoneyModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: colors.cardBg,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              maxHeight: "90%",
            }}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}
            >
              <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text }}>Add Money</Text>
              <TouchableOpacity onPress={() => setIsAddMoneyModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textLight} />
              </TouchableOpacity>
            </View>

            <Text style={{ color: colors.textLight, marginBottom: 4 }}>Enter Amount</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.divider,
                borderRadius: 8,
                paddingHorizontal: 16,
                marginBottom: 24,
              }}
            >
              <Text style={{ color: colors.text, fontWeight: "bold" }}>₹</Text>
              <TextInput
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  color: colors.text,
                  fontWeight: "bold",
                }}
                placeholder="0"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                placeholderTextColor={colors.textLighter}
              />
            </View>

            <Text style={{ color: colors.textLight, marginBottom: 12 }}>Choose Payment Method</Text>
            <FlatList
              data={paymentMethods}
              renderItem={renderPaymentMethod}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              style={{ marginBottom: 24 }}
            />

            <TouchableOpacity
              style={{
                backgroundColor: colors.primary,
                borderRadius: 9999,
                paddingVertical: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={makePayment}
              disabled={!amount || loading}
            >
              {loading ? (
                <ActivityIndicator size={22} color="white" />
              ) : (
                <Text style={{ color: "white", fontWeight: "bold" }}>Proceed to Pay ₹{amount || "0"}</Text>
              )}
            </TouchableOpacity>

            <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 16 }}>
              <Text style={{ color: colors.textLight, fontSize: 12 }}>
                By continuing, you agree to our Terms & Conditions
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}
