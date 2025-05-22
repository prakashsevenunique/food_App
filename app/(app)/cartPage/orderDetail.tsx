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
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"
import { router, useLocalSearchParams } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import api from "@/utils/axiosInstance"
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

// Order status types
const ORDER_STATUS = {
  PLACED: "PLACED",
  CONFIRMED: "CONFIRMED",
  PREPARING: "PREPARING",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
}

// Mock order data - in a real app, this would come from your API
const mockOrderData = {
  id: "ORD12345678",
  status: ORDER_STATUS.OUT_FOR_DELIVERY,
  placedAt: "2023-05-20T14:30:00Z",
  estimatedDelivery: "2023-05-20T15:15:00Z",
  restaurant: {
    id: "REST123",
    name: "Spice Paradise",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&h=500&fit=crop",
    address: "123 Main Street, Cityville",
    phone: "+1 234-567-8900",
  },
  items: [
    {
      id: "ITEM1",
      name: "Butter Chicken",
      price: 12.99,
      quantity: 1,
      customizations: ["Extra spicy", "No cilantro"],
      image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&h=500&fit=crop",
    },
    {
      id: "ITEM2",
      name: "Garlic Naan",
      price: 2.99,
      quantity: 2,
      customizations: [],
      image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&h=500&fit=crop",
    },
    {
      id: "ITEM3",
      name: "Mango Lassi",
      price: 3.99,
      quantity: 1,
      customizations: ["Less sugar"],
      image: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=500&h=500&fit=crop",
    },
  ],
  delivery: {
    address: "456 Apartment Blvd, Apt 789, Cityville",
    instructions: "Please leave at the door. Building code: 4321",
    driver: {
      name: "John Doe",
      phone: "+1 234-567-8901",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=500&fit=crop",
      rating: 4.8,
    },
  },
  payment: {
    method: "Credit Card",
    cardLast4: "1234",
    subtotal: 22.96,
    tax: 1.84,
    deliveryFee: 2.99,
    tip: 3.00,
    total: 30.79,
  },
}

export default function OrderDetailScreen() {
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams()
  const orderId = params.id as string

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current

  // Fetch order details
  useEffect(() => {
    fetchOrderDetails()
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      // In a real app, you would fetch from your API
      // const response = await api.get(`/orders/${orderId}`)
      // const data = response.data

      // Using mock data for demonstration
      setTimeout(() => {
        setOrder(mockOrderData)
        setLoading(false)
      }, 1000)
    } catch (err) {
      console.error("Failed to fetch order details:", err)
      setError(err.message || "Failed to load order details")
      setLoading(false)
    }
  }

  // Animations
  useEffect(() => {
    if (!loading && order) {
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
  }, [loading, order])

  const triggerHaptic = (type = "light") => {
    switch (type) {
      case "light":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        break
      case "medium":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        break
      case "heavy":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
        break
      case "success":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        break
      case "error":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        break
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
  }

  const handleBack = () => {
    triggerHaptic("light")
    router.back()
  }

  const handleContactDriver = () => {
    triggerHaptic("medium")
    // Implement contact driver functionality
    alert("Calling driver...")
  }

  const handleContactRestaurant = () => {
    triggerHaptic("medium")
    // Implement contact restaurant functionality
    alert("Calling restaurant...")
  }

  const handleContactSupport = () => {
    triggerHaptic("medium")
    // Implement contact support functionality
    alert("Contacting support...")
  }

  const handleReorder = () => {
    triggerHaptic("success")
    // Implement reorder functionality
    alert("Adding items to cart...")
  }

  const getStatusColor = (status) => {
    switch (status) {
      case ORDER_STATUS.PLACED:
        return COLORS.accent2
      case ORDER_STATUS.CONFIRMED:
        return COLORS.secondary
      case ORDER_STATUS.PREPARING:
        return COLORS.secondary
      case ORDER_STATUS.OUT_FOR_DELIVERY:
        return COLORS.tertiary
      case ORDER_STATUS.DELIVERED:
        return COLORS.success
      case ORDER_STATUS.CANCELLED:
        return COLORS.error
      default:
        return COLORS.textLight
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case ORDER_STATUS.PLACED:
        return "Order Placed"
      case ORDER_STATUS.CONFIRMED:
        return "Order Confirmed"
      case ORDER_STATUS.PREPARING:
        return "Preparing Your Food"
      case ORDER_STATUS.OUT_FOR_DELIVERY:
        return "Out for Delivery"
      case ORDER_STATUS.DELIVERED:
        return "Delivered"
      case ORDER_STATUS.CANCELLED:
        return "Cancelled"
      default:
        return "Processing"
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })
  }

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`
  }

  // Calculate delivery progress percentage
  const getDeliveryProgress = (status) => {
    switch (status) {
      case ORDER_STATUS.PLACED:
        return 0.2
      case ORDER_STATUS.CONFIRMED:
        return 0.4
      case ORDER_STATUS.PREPARING:
        return 0.6
      case ORDER_STATUS.OUT_FOR_DELIVERY:
        return 0.8
      case ORDER_STATUS.DELIVERED:
        return 1
      case ORDER_STATUS.CANCELLED:
        return 0
      default:
        return 0
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading order details...</Text>
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
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchOrderDetails}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (!order) {
    return null
  }

  const deliveryProgress = getDeliveryProgress(order.status)

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 24 }} />
      </View>

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
          {/* Order ID and Date */}
          <View style={styles.orderInfoContainer}>
            <View>
              <Text style={styles.orderId}>Order #{order.id}</Text>
              <Text style={styles.orderDate}>Placed on {formatDate(order.placedAt)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
            </View>
          </View>

          {/* Delivery Progress */}
          {order.status !== ORDER_STATUS.CANCELLED && (
            <View style={styles.deliveryProgressContainer}>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground} />
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${deliveryProgress * 100}%`,
                      backgroundColor: getStatusColor(order.status),
                    },
                  ]}
                />
                <View style={styles.progressSteps}>
                  <View
                    style={[
                      styles.progressStep,
                      deliveryProgress >= 0.2 ? { backgroundColor: getStatusColor(order.status) } : {},
                    ]}
                  />
                  <View
                    style={[
                      styles.progressStep,
                      deliveryProgress >= 0.4 ? { backgroundColor: getStatusColor(order.status) } : {},
                    ]}
                  />
                  <View
                    style={[
                      styles.progressStep,
                      deliveryProgress >= 0.6 ? { backgroundColor: getStatusColor(order.status) } : {},
                    ]}
                  />
                  <View
                    style={[
                      styles.progressStep,
                      deliveryProgress >= 0.8 ? { backgroundColor: getStatusColor(order.status) } : {},
                    ]}
                  />
                  <View
                    style={[
                      styles.progressStep,
                      deliveryProgress >= 1 ? { backgroundColor: getStatusColor(order.status) } : {},
                    ]}
                  />
                </View>
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabel}>Placed</Text>
                <Text style={styles.progressLabel}>Confirmed</Text>
                <Text style={styles.progressLabel}>Preparing</Text>
                <Text style={styles.progressLabel}>On the way</Text>
                <Text style={styles.progressLabel}>Delivered</Text>
              </View>
              {order.status === ORDER_STATUS.OUT_FOR_DELIVERY && order.delivery.driver && (
                <View style={styles.driverInfoContainer}>
                  <View style={styles.driverInfo}>
                    <Image source={{ uri: order.delivery.driver.image }} style={styles.driverImage} />
                    <View style={styles.driverDetails}>
                      <Text style={styles.driverName}>{order.delivery.driver.name}</Text>
                      <View style={styles.driverRating}>
                        <Ionicons name="star" size={14} color={COLORS.secondary} />
                        <Text style={styles.driverRatingText}>{order.delivery.driver.rating}</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.contactDriverButton} onPress={handleContactDriver}>
                    <Ionicons name="call" size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              )}
              {order.estimatedDelivery && order.status !== ORDER_STATUS.DELIVERED && (
                <View style={styles.estimatedDeliveryContainer}>
                  <Ionicons name="time-outline" size={16} color={COLORS.textLight} />
                  <Text style={styles.estimatedDeliveryText}>
                    Estimated delivery by {formatDate(order.estimatedDelivery)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Restaurant Info */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Restaurant</Text>
            <View style={styles.restaurantContainer}>
              <Image source={{ uri: order.restaurant.image }} style={styles.restaurantImage} />
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{order.restaurant.name}</Text>
                <Text style={styles.restaurantAddress}>{order.restaurant.address}</Text>
              </View>
              <TouchableOpacity style={styles.contactButton} onPress={handleContactRestaurant}>
                <Ionicons name="call-outline" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Order Items */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Your Order</Text>
            {order.items.map((item) => (
              <View key={item.id} style={styles.orderItemContainer}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <View style={styles.itemNameContainer}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                  </View>
                  <Text style={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
                  {item.customizations.length > 0 && (
                    <View style={styles.customizationsContainer}>
                      {item.customizations.map((customization, index) => (
                        <View key={index} style={styles.customizationBadge}>
                          <Text style={styles.customizationText}>{customization}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Delivery Address */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <View style={styles.addressContainer}>
              <Ionicons name="location" size={20} color={COLORS.primary} style={styles.addressIcon} />
              <View style={styles.addressDetails}>
                <Text style={styles.addressText}>{order.delivery.address}</Text>
                {order.delivery.instructions && (
                  <Text style={styles.deliveryInstructions}>{order.delivery.instructions}</Text>
                )}
              </View>
            </View>
          </View>

          {/* Payment Summary */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Payment Summary</Text>
            <View style={styles.paymentMethodContainer}>
              <Ionicons name="card-outline" size={20} color={COLORS.textLight} />
              <Text style={styles.paymentMethodText}>
                {order.payment.method} •••• {order.payment.cardLast4}
              </Text>
            </View>
            <View style={styles.paymentBreakdown}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Subtotal</Text>
                <Text style={styles.paymentValue}>{formatCurrency(order.payment.subtotal)}</Text>
              </View>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Tax</Text>
                <Text style={styles.paymentValue}>{formatCurrency(order.payment.tax)}</Text>
              </View>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Delivery Fee</Text>
                <Text style={styles.paymentValue}>{formatCurrency(order.payment.deliveryFee)}</Text>
              </View>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Tip</Text>
                <Text style={styles.paymentValue}>{formatCurrency(order.payment.tip)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatCurrency(order.payment.total)}</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.supportButton} onPress={handleContactSupport}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={COLORS.textDark} />
              <Text style={styles.supportButtonText}>Help & Support</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reorderButton} onPress={handleReorder}>
              <Text style={styles.reorderButtonText}>Reorder</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
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
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.light,
    fontWeight: "600",
  },
  orderInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  orderId: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  orderDate: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: COLORS.light,
    fontWeight: "600",
    fontSize: 12,
  },
  deliveryProgressContainer: {
    backgroundColor: COLORS.light,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
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
  progressBarContainer: {
    height: 4,
    marginVertical: 16,
    position: "relative",
  },
  progressBarBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#EEEEEE",
    borderRadius: 2,
  },
  progressBarFill: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 4,
    borderRadius: 2,
  },
  progressSteps: {
    position: "absolute",
    top: -4,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressStep: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#EEEEEE",
    borderWidth: 2,
    borderColor: COLORS.light,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 0,
  },
  progressLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    textAlign: "center",
    width: 60,
    marginHorizontal: -10,
  },
  driverInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  driverDetails: {
    marginLeft: 12,
  },
  driverName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  driverRating: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  driverRatingText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  contactDriverButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  estimatedDeliveryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  estimatedDeliveryText: {
    fontSize: 13,
    color: COLORS.textLight,
    marginLeft: 6,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  restaurantContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.light,
    borderRadius: 12,
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  restaurantImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  restaurantInfo: {
    flex: 1,
    marginLeft: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  restaurantAddress: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  contactButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  orderItemContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.light,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemNameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
  },
  itemQuantity: {
    fontSize: 14,
    color: COLORS.textLight,
    marginLeft: 8,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 4,
  },
  customizationsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  customizationBadge: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  customizationText: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  addressContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.light,
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  addressIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  addressDetails: {
    flex: 1,
  },
  addressText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  deliveryInstructions: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 8,
    fontStyle: "italic",
  },
  paymentMethodContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  paymentMethodText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
  },
  paymentBreakdown: {
    backgroundColor: COLORS.light,
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  paymentValue: {
    fontSize: 14,
    color: COLORS.text,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  actionsContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  supportButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingVertical: 14,
    marginRight: 8,
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textDark,
    marginLeft: 8,
  },
  reorderButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginLeft: 8,
  },
  reorderButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.light,
  },
})
