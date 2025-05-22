import { useState, useEffect, useContext } from "react"
import { View, Text, TouchableOpacity, ScrollView, Linking } from "react-native"
import { router } from "expo-router"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { UserContext } from "@/hooks/userInfo"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import React from "react"

// Food Delivery color palette
const COLORS = {
  primary: "#E23744", // Zomato-inspired red
  primaryDark: "#D32F2F", // Darker shade for gradient
  primaryLight: "#FF5A5F", // Lighter shade for gradient
  secondary: "#FC8019", // Swiggy-inspired orange
  accent: "#60B246", // Green for success/confirmation
  background: "#FFFFFF",
  textDark: "#3D4152",
  textLight: "#93959F",
  lightGray: "#F8F8F8",
  gray: "#EEEEEE",
  border: "#E8E8E8",
}

const NotificationScreen = () => {
  const { notification } = useContext(UserContext) as any
  const [notifications, setNotifications] = useState([])
  const insets = useSafeAreaInsets()

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const storedNotifications = await AsyncStorage.getItem("@notifications")
        if (storedNotifications) {
          setNotifications(JSON.parse(storedNotifications))
        }
      } catch (error) {
        console.error("Failed to load notifications", error)
      }
    }
    loadNotifications()
  }, [])

  useEffect(() => {
    const saveNotifications = async () => {
      try {
        await AsyncStorage.setItem("@notifications", JSON.stringify(notifications))
      } catch (error) {
        console.error("Failed to save notifications", error)
      }
    }

    if (notifications.length > 0) {
      saveNotifications()
    }
  }, [notifications])

  useEffect(() => {
    if (notification) {
      const timestamp = notification.date ? new Date(notification.date) : new Date()
      const now = new Date()
      const diffMs = now.getTime() - timestamp.getTime()
      const diffMins = Math.round(diffMs / 60000)

      let timeString = "Just now"
      if (diffMins > 1) {
        timeString =
          diffMins < 60
            ? `${diffMins} minutes ago`
            : diffMins < 1440
              ? `${Math.floor(diffMins / 60)} hours ago`
              : `${Math.floor(diffMins / 1440)} days ago`
      }

      const content = notification.request?.content
      const notificationType = content?.data?.type || "system"
      const notificationId = content?.data?.id || `notification-${Date.now()}`

      const pushNotification = {
        id: notificationId,
        type: notificationType,
        title: content?.title || "New Notification",
        message: content?.body || "",
        url: content?.data?.url || "",
        time: timeString,
        read: false,
        icon: getIconForNotificationType(notificationType),
      }
      setNotifications((prevNotifications) => {
        const exists = prevNotifications.some((item) => item.id === notificationId)
        if (exists) {
          return prevNotifications
        } else {
          return [pushNotification, ...prevNotifications]
        }
      })
    }
  }, [notification])

  const getIconForNotificationType = (type) => {
    switch (type) {
      case "offer":
        return "local-offer"
      case "appointment":
        return "calendar-today"
      case "payment":
        return "payment"
      case "review":
        return "rate-review"
      case "booking":
        return "event-available"
      case "reminder":
        return "alarm"
      case "order":
        return "restaurant"
      case "delivery":
        return "delivery-dining"
      default:
        return "notifications"
    }
  }

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const clearAllNotifications = async () => {
    setNotifications([])
    try {
      await AsyncStorage.removeItem("@notifications")
    } catch (error) {
      console.error("Failed to clear notifications from storage", error)
    }
  }

  const getIconColor = (type) => {
    switch (type) {
      case "offer":
        return COLORS.primary // Primary red
      case "appointment":
      case "booking":
        return COLORS.secondary // Secondary orange
      case "payment":
        return "#4CAF50" // Green for payments
      case "order":
        return COLORS.primary // Primary red for orders
      case "delivery":
        return COLORS.secondary // Secondary orange for delivery
      case "reminder":
        return "#2196F3" // Blue for reminders
      default:
        return COLORS.textLight // Medium gray
    }
  }

  // Format date for display
  const formatNotificationDate = (timestamp) => {
    if (!timestamp) return "Unknown time"

    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.round(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`
    if (diffMins < 10080) return `${Math.floor(diffMins / 1440)} days ago`

    return date.toLocaleDateString()
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LinearGradient
        colors={["#FF5A5F", "#FF5A5F", "#FF7B7F"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          paddingTop: insets.top,
          paddingHorizontal: 16,
          paddingBottom: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <View className="py-1 pt-3" style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginLeft: 16, color: "#fff" }}>
              Notifications
            </Text>
          </View>
          <TouchableOpacity onPress={clearAllNotifications}>
            <Text style={{ color: "#fff", fontWeight: "500" }}>Clear All</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 8 }}>
        {notifications.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 80 }}>
            <MaterialIcons name="notifications-off" size={48} color={COLORS.gray} />
            <Text style={{ color: COLORS.textDark, fontSize: 18, marginTop: 16, fontWeight: "500" }}>
              No notifications yet
            </Text>
            <Text style={{ color: COLORS.textLight, marginTop: 4, textAlign: "center" }}>
              We'll notify you when there's something new
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={{
                backgroundColor: COLORS.background,
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                shadowColor: COLORS.textDark,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
                borderLeftWidth: !notification.read ? 4 : 0,
                borderLeftColor: !notification.read ? COLORS.primary : "transparent",
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
              onPress={() => {
                markAsRead(notification.id)
                notification.url ? Linking.openURL(notification.url) : null
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <View
                  style={{
                    marginRight: 12,
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: `${getIconColor(notification.type)}15`,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialIcons name={notification.icon} size={22} color={getIconColor(notification.type)} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Text
                      style={{
                        fontWeight: "bold",
                        color: !notification.read ? COLORS.textDark : COLORS.textLight,
                        fontSize: 16,
                      }}
                    >
                      {notification.title}
                    </Text>
                    <Text style={{ fontSize: 12, color: COLORS.textLight }}>{notification.time}</Text>
                  </View>
                  <Text
                    style={{
                      marginTop: 4,
                      color: !notification.read ? COLORS.textDark : COLORS.textLight,
                      fontSize: 14,
                    }}
                  >
                    {notification.message}
                  </Text>
                  {!notification.read && (
                    <View style={{ marginTop: 8, alignItems: "flex-end" }}>
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: COLORS.primary,
                        }}
                      />
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      <View
        style={{
          backgroundColor: COLORS.background,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          paddingHorizontal: 16,
          paddingVertical: 12,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
        }}
      >
        <Text style={{ textAlign: "center", color: COLORS.textLight, fontSize: 14 }}>
          {notifications.filter((n) => !n.read).length} unread notifications
        </Text>
      </View>
    </View>
  )
}

export default NotificationScreen