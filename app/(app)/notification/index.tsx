import { useState, useEffect, useContext } from "react"
import { View, Text, TouchableOpacity, ScrollView, Linking } from "react-native"
import { router } from "expo-router"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { UserContext } from "@/hooks/userInfo"
import AsyncStorage from "@react-native-async-storage/async-storage"

const colors = {
  primary: "#E65305", // Bright red-orange as primary
  primaryLight: "#FF7A3D", // Lighter version of primary
  secondary: "#FBA059", // Light orange as secondary
  secondaryLight: "#FFC59F",
  tertiary: "#F4A36C", // Peach/salmon as tertiary
  tertiaryLight: "#FFD0B0", // Lighter version of tertiary
  background: "#FFF9F5",
  cardBg: "#FFFFFF", // White for cards
  text: "#3D2C24", // Dark brown for text
  textLight: "#7D6E66", // Lighter text color
  textLighter: "#A99E98", // Even lighter text
  divider: "#FFE8D6",
}

const NotificationScreen = () => {
  const { notification } = useContext(UserContext) as any
  const [notifications, setNotifications] = useState([])

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
        url : content?.data?.url || "",
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
        return "tag"
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
        return colors.primary // Primary orange-red
      case "appointment":
      case "booking":
        return colors.secondary // Secondary orange
      case "payment":
        return colors.tertiary // Tertiary peach
      case "reminder":
        return colors.accent || colors.secondary // Accent color
      default:
        return colors.textLight // Medium brown
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
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginLeft: 16, color: colors.text }}>Notifications</Text>
          </View>
          <TouchableOpacity onPress={clearAllNotifications}>
            <Text style={{ color: colors.primary, fontWeight: "500" }}>Clear All</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notification List */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 8 }}>
        {notifications.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 80 }}>
            <MaterialIcons name="notifications-off" size={48} color={colors.tertiaryLight} />
            <Text style={{ color: colors.textLight, fontSize: 18, marginTop: 16, fontWeight: "500" }}>
              No notifications yet
            </Text>
            <Text style={{ color: colors.textLighter, marginTop: 4, textAlign: "center" }}>
              We'll notify you when there's something new
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={{
                backgroundColor: colors.cardBg,
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
                borderLeftWidth: !notification.read ? 4 : 0,
                borderLeftColor: !notification.read ? colors.primary : "transparent",
              }}
              onPress={() => {markAsRead(notification.id); notification.url ? Linking.openURL(notification.url) : null}}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <View style={{ marginRight: 12 }}>
                  <MaterialIcons name={notification.icon} size={24} color={getIconColor(notification.type)} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Text
                      style={{
                        fontWeight: "bold",
                        color: !notification.read ? colors.text : colors.textLight,
                      }}
                    >
                      {notification.title}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textLighter }}>{notification.time}</Text>
                  </View>
                  <Text
                    style={{
                      marginTop: 4,
                      color: !notification.read ? colors.textLight : colors.textLighter,
                    }}
                  >
                    {notification.message}
                  </Text>
                  {!notification.read && (
                    <View style={{ marginTop: 8 }}>
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: colors.primary,
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
          backgroundColor: colors.cardBg,
          borderTopWidth: 1,
          borderTopColor: colors.divider,
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
      >
        <Text style={{ textAlign: "center", color: colors.textLight, fontSize: 14 }}>
          {notifications.filter((n) => !n.read).length} unread notifications
        </Text>
      </View>
    </View>
  )
}

export default NotificationScreen
