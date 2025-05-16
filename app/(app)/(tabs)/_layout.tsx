import React from "react"
import { useRef, useEffect } from "react"
import { Tabs, router } from "expo-router"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { Platform, StyleSheet, Text, View, Animated, Dimensions, TouchableOpacity } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

// Food Delivery color palette
const COLORS = {
  primary: "#E23744", // Zomato-inspired red
  secondary: "#FC8019", // Swiggy-inspired orange
  accent: "#60B246", // Green for success/confirmation
  background: "#FFFFFF",
  textDark: "#3D4152",
  textLight: "#93959F",
}

const { width } = Dimensions.get("window")

export default function TabLayout() {
  // Animation values
  const tabAnimValue = useRef(new Animated.Value(0)).current
  const insets = useSafeAreaInsets()

  // Custom Tab Bar Component
  function CustomTabBar({ state, descriptors, navigation }) {
    const tabWidth = width / state.routes.length

    // Update animation value when tab changes
    useEffect(() => {
      Animated.spring(tabAnimValue, {
        toValue: state.index * tabWidth,
        useNativeDriver: true,
        tension: 70,
        friction: 10,
      }).start()
    }, [state.index])

    return (
      <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom }]}>
        {/* Animated Indicator */}
        <Animated.View
          style={[
            styles.tabIndicator,
            {
              transform: [{ translateX: tabAnimValue }],
              width: tabWidth,
            },
          ]}
        >
          <View style={styles.activeTabBackground} />
        </Animated.View>

        {/* Tab Buttons */}
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key]
          const label = options.tabBarLabel || options.title || route.name
          const isFocused = state.index === index

          // Get the icon based on the route name
          const getTabIcon = () => {
            const iconSize = isFocused ? 24 : 22
            const iconColor = isFocused ? COLORS.primary : COLORS.textLight

            switch (route.name) {
              case "index":
                return <Ionicons name={isFocused ? "home" : "home-outline"} size={iconSize} color={iconColor} />
              case "explore":
                return <Ionicons name={isFocused ? "search" : "search-outline"} size={iconSize} color={iconColor} />
              case "cart":
                return (
                  <View>
                    <Ionicons name={isFocused ? "cart" : "cart-outline"} size={iconSize} color={iconColor} />
                    {/* Cart badge */}
                    <View style={styles.cartBadge}>
                      <Text style={styles.cartBadgeText}>2</Text>
                    </View>
                  </View>
                )
              case "orders":
                return (
                  <MaterialCommunityIcons
                    name={isFocused ? "clipboard-list" : "clipboard-list-outline"}
                    size={iconSize}
                    color={iconColor}
                  />
                )
              case "profile":
                return <Ionicons name={isFocused ? "person" : "person-outline"} size={iconSize} color={iconColor} />
              default:
                return <Ionicons name="help-circle-outline" size={iconSize} color={iconColor} />
            }
          }

          // Animation values for each tab
          const scaleAnim = useRef(new Animated.Value(1)).current

          const onTabPress = () => {
            Animated.sequence([
              Animated.timing(scaleAnim, {
                toValue: 0.9,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 100,
                friction: 5,
                useNativeDriver: true,
              }),
            ]).start()

            // Special handling for cart tab
            if (route.name === 'cart') {
              // Navigate to the cart page outside of tab layout
              router.push('/(app)/cartPage');
              return;
            }

            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            })

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name)
            }
          }

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onTabPress}
              style={styles.tabButton}
            >
              <Animated.View style={[styles.tabContent, { transform: [{ scale: scaleAnim }] }]}>
                {getTabIcon()}
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isFocused ? COLORS.primary : COLORS.textLight,
                      fontWeight: isFocused ? "600" : "400",
                      opacity: isFocused ? 1 : 0.8,
                    },
                  ]}
                >
                  {label}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          )
        })}
      </View>
    )
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      {/* Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />

      {/* Explore/Search */}
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
        }}
      />

      {/* Cart - Keep href: null to prevent default navigation */}
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          href: null,
        }}
      />

      {/* Orders */}
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
        }}
      />

      {/* Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: "row",
    height: Platform.OS === "ios" ? 80 : 70,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    paddingTop: 1,
  },
  tabIndicator: {
    position: "absolute",
    top: 0,
    height: 3,
    alignItems: "center",
  },
  activeTabBackground: {
    width: 40,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -8,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: COLORS.background,
  },
  cartBadgeText: {
    color: "white",
    fontSize: 9,
    fontWeight: "bold",
  },
})
