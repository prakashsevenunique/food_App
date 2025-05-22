import { useRef, useEffect, useState, useMemo } from "react"
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Animated,
    Modal,
    TextInput,
    ActivityIndicator,
    Dimensions,
    Pressable,
    ScrollView,
} from "react-native"
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import * as Haptics from "expo-haptics"
import { router } from "expo-router"
import DateTimePicker from "@react-native-community/datetimepicker"
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

// Screen dimensions
const { width: SCREEN_WIDTH } = Dimensions.get("window")

// Sample transaction data - more comprehensive for filtering demo
const TRANSACTIONS = [
    {
        id: "1",
        type: "credit",
        amount: 100,
        date: "2023-05-18T14:30:00",
        description: "Added money to wallet",
        paymentMethod: "Credit Card",
        category: "deposit",
    },
    {
        id: "2",
        type: "debit",
        amount: 45.5,
        date: "2023-05-17T19:15:00",
        description: "Payment for order #FD8765",
        restaurant: "Burger King",
        category: "food",
    },
    {
        id: "3",
        type: "credit",
        amount: 200,
        date: "2023-05-15T10:45:00",
        description: "Added money to wallet",
        paymentMethod: "UPI",
        category: "deposit",
    },
    {
        id: "4",
        type: "debit",
        amount: 120.75,
        date: "2023-05-14T21:20:00",
        description: "Payment for order #FD8740",
        restaurant: "Pizza Hut",
        category: "food",
    },
    {
        id: "5",
        type: "credit",
        amount: 50,
        date: "2023-05-10T16:30:00",
        description: "Cashback reward",
        paymentMethod: "Promotion",
        category: "reward",
    },
    {
        id: "6",
        type: "debit",
        amount: 35.25,
        date: "2023-05-08T12:10:00",
        description: "Payment for order #FD8720",
        restaurant: "Subway",
        category: "food",
    },
    {
        id: "7",
        type: "credit",
        amount: 150,
        date: "2023-05-05T09:30:00",
        description: "Referral bonus",
        paymentMethod: "Promotion",
        category: "reward",
    },
    {
        id: "8",
        type: "debit",
        amount: 89.5,
        date: "2023-05-03T20:45:00",
        description: "Payment for order #FD8705",
        restaurant: "KFC",
        category: "food",
    },
    {
        id: "9",
        type: "credit",
        amount: 300,
        date: "2023-05-01T11:20:00",
        description: "Added money to wallet",
        paymentMethod: "Net Banking",
        category: "deposit",
    },
    {
        id: "10",
        type: "debit",
        amount: 65.75,
        date: "2023-04-28T18:30:00",
        description: "Payment for order #FD8690",
        restaurant: "Domino's Pizza",
        category: "food",
    },
    {
        id: "11",
        type: "credit",
        amount: 75,
        date: "2023-04-25T14:15:00",
        description: "Cashback reward",
        paymentMethod: "Promotion",
        category: "reward",
    },
    {
        id: "12",
        type: "debit",
        amount: 110.25,
        date: "2023-04-22T19:40:00",
        description: "Payment for order #FD8675",
        restaurant: "McDonald's",
        category: "food",
    },
]

// Filter options
const TRANSACTION_TYPES = [
    { id: "all", label: "All", icon: "list" },
    { id: "credit", label: "Money In", icon: "arrow-down", color: COLORS.green },
    { id: "debit", label: "Money Out", icon: "arrow-up", color: COLORS.red },
]

const CATEGORIES = [
    { id: "all", label: "All Categories" },
    { id: "food", label: "Food Orders" },
    { id: "deposit", label: "Deposits" },
    { id: "reward", label: "Rewards & Cashback" },
]

const DATE_RANGES = [
    { id: "all", label: "All Time" },
    { id: "this-month", label: "This Month" },
    { id: "last-month", label: "Last Month" },
    { id: "last-3-months", label: "Last 3 Months" },
    { id: "custom", label: "Custom Range" },
]

export default function WalletStatementScreen() {
    const insets = useSafeAreaInsets()
    const [loading, setLoading] = useState(false)
    const [transactions, setTransactions] = useState(TRANSACTIONS)
    const [filteredTransactions, setFilteredTransactions] = useState(TRANSACTIONS)
    const [searchQuery, setSearchQuery] = useState("")
    const [showSearch, setShowSearch] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [activeFilters, setActiveFilters] = useState({
        type: "all",
        category: "all",
        dateRange: "all",
        startDate: null,
        endDate: null,
        minAmount: "",
        maxAmount: "",
    })
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [datePickerMode, setDatePickerMode] = useState("start") // 'start' or 'end'
    const [tempFilters, setTempFilters] = useState({ ...activeFilters })
    const [refreshing, setRefreshing] = useState(false)

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current
    const searchInputAnim = useRef(new Animated.Value(0)).current
    const filterModalAnim = useRef(new Animated.Value(0)).current

    // Initialize animations
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start()
    }, [])

    // Toggle search input animation
    useEffect(() => {
        Animated.timing(searchInputAnim, {
            toValue: showSearch ? 1 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start()
    }, [showSearch])

    // Toggle filter modal animation
    useEffect(() => {
        Animated.timing(filterModalAnim, {
            toValue: showFilters ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start()
    }, [showFilters])

    // Apply filters when they change
    useEffect(() => {
        applyFilters()
    }, [activeFilters, searchQuery])

    // Apply all filters to transactions
    const applyFilters = () => {
        setLoading(true)

        // Small delay to show loading state and make transitions smoother
        setTimeout(() => {
            let result = [...transactions]

            // Filter by transaction type
            if (activeFilters.type !== "all") {
                result = result.filter((transaction) => transaction.type === activeFilters.type)
            }

            // Filter by category
            if (activeFilters.category !== "all") {
                result = result.filter((transaction) => transaction.category === activeFilters.category)
            }

            // Filter by date range
            if (activeFilters.dateRange !== "all") {
                const now = new Date()
                let startDate = new Date()

                if (activeFilters.dateRange === "this-month") {
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
                } else if (activeFilters.dateRange === "last-month") {
                    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
                    const endDate = new Date(now.getFullYear(), now.getMonth(), 0)
                    result = result.filter((transaction) => {
                        const transactionDate = new Date(transaction.date)
                        return transactionDate >= startDate && transactionDate <= endDate
                    })
                    setLoading(false)
                    setFilteredTransactions(result)
                    return
                } else if (activeFilters.dateRange === "last-3-months") {
                    startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
                } else if (activeFilters.dateRange === "custom" && activeFilters.startDate && activeFilters.endDate) {
                    startDate = new Date(activeFilters.startDate)
                    const endDate = new Date(activeFilters.endDate)
                    endDate.setHours(23, 59, 59, 999) // End of day
                    result = result.filter((transaction) => {
                        const transactionDate = new Date(transaction.date)
                        return transactionDate >= startDate && transactionDate <= endDate
                    })
                    setLoading(false)
                    setFilteredTransactions(result)
                    return
                }

                if (activeFilters.dateRange !== "custom") {
                    result = result.filter((transaction) => {
                        const transactionDate = new Date(transaction.date)
                        return transactionDate >= startDate
                    })
                }
            }

            // Filter by amount range
            if (activeFilters.minAmount) {
                const minAmount = Number.parseFloat(activeFilters.minAmount)
                if (!isNaN(minAmount)) {
                    result = result.filter((transaction) => transaction.amount >= minAmount)
                }
            }

            if (activeFilters.maxAmount) {
                const maxAmount = Number.parseFloat(activeFilters.maxAmount)
                if (!isNaN(maxAmount)) {
                    result = result.filter((transaction) => transaction.amount <= maxAmount)
                }
            }

            // Filter by search query
            if (searchQuery) {
                const query = searchQuery.toLowerCase()
                result = result.filter(
                    (transaction) =>
                        transaction.description.toLowerCase().includes(query) ||
                        (transaction.restaurant && transaction.restaurant.toLowerCase().includes(query)) ||
                        (transaction.paymentMethod && transaction.paymentMethod.toLowerCase().includes(query)),
                )
            }

            setLoading(false)
            setFilteredTransactions(result)
        }, 300)
    }

    // Handle refresh
    const handleRefresh = async () => {
        setRefreshing(true)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setRefreshing(false)
    }

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

    // Group transactions by date
    const groupedTransactions = useMemo(() => {
        const groups = {}
        filteredTransactions.forEach((transaction) => {
            const date = formatDate(transaction.date)
            if (!groups[date]) {
                groups[date] = []
            }
            groups[date].push(transaction)
        })
        return Object.entries(groups).map(([date, transactions]) => ({
            date,
            data: transactions,
        }))
    }, [filteredTransactions])

    // Toggle search input
    const toggleSearch = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setShowSearch(!showSearch)
        if (showSearch) {
            setSearchQuery("")
        }
    }

    // Toggle filter sheet
    const toggleFilters = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        if (!showFilters) {
            setTempFilters({ ...activeFilters })
        }
        setShowFilters(!showFilters)
    }

    // Apply temp filters
    const applyTempFilters = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        setActiveFilters({ ...tempFilters })
        setShowFilters(false)
    }

    // Reset all filters
    const resetFilters = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        const defaultFilters = {
            type: "all",
            category: "all",
            dateRange: "all",
            startDate: null,
            endDate: null,
            minAmount: "",
            maxAmount: "",
        }
        setTempFilters(defaultFilters)
        setActiveFilters(defaultFilters)
        setShowFilters(false)
    }

    // Show date picker
    const showDatePickerModal = (mode) => {
        setDatePickerMode(mode)
        setShowDatePicker(true)
    }

    // Handle date change
    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false)
        if (selectedDate) {
            if (datePickerMode === "start") {
                setTempFilters({ ...tempFilters, startDate: selectedDate.toISOString() })
            } else {
                setTempFilters({ ...tempFilters, endDate: selectedDate.toISOString() })
            }
        }
    }

    // Check if any filters are active
    const hasActiveFilters = useMemo(() => {
        return (
            activeFilters.type !== "all" ||
            activeFilters.category !== "all" ||
            activeFilters.dateRange !== "all" ||
            activeFilters.minAmount !== "" ||
            activeFilters.maxAmount !== "" ||
            searchQuery !== ""
        )
    }, [activeFilters, searchQuery])

    // Render transaction item
    const renderTransactionItem = ({ item }) => (
        <Animated.View   >
            <TouchableOpacity
                className="flex-row items-center p-4 border-b border-gray-100"
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                }}
            >
                <View
                    className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${item.type === "credit" ? "bg-green-100" : "bg-red-100"
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
        </Animated.View>
    )

    // Render section header
    const renderSectionHeader = ({ section }) => (
        <Animated.View>
            <View className="px-4 py-2 bg-gray-50">
                <Text className="text-sm font-medium text-[#6B7280]">{section.date}</Text>
            </View>
        </Animated.View>
    )

    // Render list header
    const renderListHeader = () => (
        <View className="mb-2">
            {/* Active Filters */}
            {hasActiveFilters && (
                <Animated.View
                    className="px-4 py-3 bg-gray-50"
                >
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-sm font-medium text-[#6B7280]">Active Filters</Text>
                        <TouchableOpacity onPress={resetFilters}>
                            <Text className="text-[#E23744] text-sm font-medium">Clear All</Text>
                        </TouchableOpacity>
                    </View>
                    <View className="flex-row flex-wrap">
                        {activeFilters.type !== "all" && (
                            <View className="bg-white border border-gray-200 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center">
                                <Text className="text-xs text-[#3D4152] mr-1">
                                    {TRANSACTION_TYPES.find((t) => t.id === activeFilters.type)?.label}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setActiveFilters({ ...activeFilters, type: "all" })}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                                </TouchableOpacity>
                            </View>
                        )}
                        {activeFilters.category !== "all" && (
                            <View className="bg-white border border-gray-200 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center">
                                <Text className="text-xs text-[#3D4152] mr-1">
                                    {CATEGORIES.find((c) => c.id === activeFilters.category)?.label}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setActiveFilters({ ...activeFilters, category: "all" })}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                                </TouchableOpacity>
                            </View>
                        )}
                        {activeFilters.dateRange !== "all" && (
                            <View className="bg-white border border-gray-200 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center">
                                <Text className="text-xs text-[#3D4152] mr-1">
                                    {DATE_RANGES.find((d) => d.id === activeFilters.dateRange)?.label}
                                </Text>
                                <TouchableOpacity
                                    onPress={() =>
                                        setActiveFilters({ ...activeFilters, dateRange: "all", startDate: null, endDate: null })
                                    }
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                                </TouchableOpacity>
                            </View>
                        )}
                        {activeFilters.minAmount && (
                            <View className="bg-white border border-gray-200 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center">
                                <Text className="text-xs text-[#3D4152] mr-1">Min: ₹{activeFilters.minAmount}</Text>
                                <TouchableOpacity
                                    onPress={() => setActiveFilters({ ...activeFilters, minAmount: "" })}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                                </TouchableOpacity>
                            </View>
                        )}
                        {activeFilters.maxAmount && (
                            <View className="bg-white border border-gray-200 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center">
                                <Text className="text-xs text-[#3D4152] mr-1">Max: ₹{activeFilters.maxAmount}</Text>
                                <TouchableOpacity
                                    onPress={() => setActiveFilters({ ...activeFilters, maxAmount: "" })}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                                </TouchableOpacity>
                            </View>
                        )}
                        {searchQuery && (
                            <View className="bg-white border border-gray-200 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center">
                                <Text className="text-xs text-[#3D4152] mr-1">"{searchQuery}"</Text>
                                <TouchableOpacity
                                    onPress={() => setSearchQuery("")}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </Animated.View>
            )}

            {/* Summary */}
            <Animated.View
                className="px-4 py-3"
            >
                <Text className="text-lg font-bold text-[#3D4152]">Transaction Summary</Text>
                <View className="flex-row justify-between mt-2">
                    <View className="flex-1 mr-2 bg-green-50 rounded-lg p-3">
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-2">
                                <Ionicons name="arrow-down" size={16} color={COLORS.green} />
                            </View>
                            <Text className="text-sm font-medium text-[#3D4152]">Money In</Text>
                        </View>
                        <Text className="text-lg font-bold text-[#3AB757] mt-1">
                            ₹
                            {filteredTransactions
                                .filter((t) => t.type === "credit")
                                .reduce((sum, t) => sum + t.amount, 0)
                                .toFixed(2)}
                        </Text>
                    </View>
                    <View className="flex-1 ml-2 bg-red-50 rounded-lg p-3">
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center mr-2">
                                <Ionicons name="arrow-up" size={16} color={COLORS.red} />
                            </View>
                            <Text className="text-sm font-medium text-[#3D4152]">Money Out</Text>
                        </View>
                        <Text className="text-lg font-bold text-[#E23744] mt-1">
                            ₹
                            {filteredTransactions
                                .filter((t) => t.type === "debit")
                                .reduce((sum, t) => sum + t.amount, 0)
                                .toFixed(2)}
                        </Text>
                    </View>
                </View>
            </Animated.View>

            {/* Transaction Count */}
            <View className="px-4 py-3 flex-row justify-between items-center">
                <Text className="text-sm text-[#6B7280]">
                    Showing {filteredTransactions.length} {filteredTransactions.length === 1 ? "transaction" : "transactions"}
                </Text>
                <TouchableOpacity className="flex-row items-center" onPress={() => { }}>
                    <Text className="text-[#E23744] text-sm font-medium mr-1">Sort</Text>
                    <Feather name="chevron-down" size={16} color={COLORS.primary} />
                </TouchableOpacity>
            </View>
        </View>
    )

    // Render empty state
    const renderEmptyState = () => (
        <View className="items-center justify-center py-10">
            <MaterialCommunityIcons name="wallet-outline" size={60} color="#D1D5DB" />
            <Text className="text-[#3D4152] font-medium mt-4 text-center">No transactions found</Text>
            <Text className="text-[#93959F] mt-2 text-center px-10">
                Try changing your filters or search criteria to see more results
            </Text>
            <TouchableOpacity className="mt-6 bg-[#E23744] py-2 px-4 rounded-lg" onPress={resetFilters}>
                <Text className="text-white font-medium">Clear Filters</Text>
            </TouchableOpacity>
        </View>
    )

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View
                className="bg-white border-b border-gray-100"
                style={{
                    paddingTop: 12,
                    paddingBottom: 12,
                }}
            >
                <View className="flex-row px-4">
                    <View className="flex-row items-center flex-1">
                        <TouchableOpacity onPress={() => router.back()} className="mr-3">
                            <Ionicons name="arrow-back" size={24} color="#3D4152" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-[#3D4152]">Wallet Statement</Text>
                    </View>
                    {/* 
                    <Animated.View
                        className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2"
                    >
                        <Ionicons name="search" size={18} color="#9CA3AF" />
                        <TextInput
                            className="flex-1 ml-2 text-[#3D4152]"
                            placeholder="Search transactions..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus={showSearch}
                        />
                        {searchQuery ? (
                            <TouchableOpacity onPress={() => setSearchQuery("")}>
                                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                            </TouchableOpacity>
                        ) : null}
                    </Animated.View> */}

                    <View className="flex-row">
                        {/* <TouchableOpacity onPress={toggleSearch} className="ml-3 p-2">
                            <Ionicons name={showSearch ? "close" : "search"} size={22} color="#3D4152" />
                        </TouchableOpacity> */}
                        <TouchableOpacity onPress={toggleFilters} className="ml-2 p-2">
                            <Ionicons name="options" size={22} color="#3D4152" />
                            {hasActiveFilters && <View className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#E23744]" />}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Transaction List */}
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text className="mt-4 text-[#6B7280]">Loading transactions...</Text>
                </View>
            ) : (
                <FlatList
                    data={groupedTransactions}
                    keyExtractor={(item) => item.date}
                    renderItem={({ item }) => (
                        <View>
                            {renderSectionHeader({ section: item })}
                            {item.data.map((transaction) => (
                                <View key={transaction.id}>{renderTransactionItem({ item: transaction })}</View>
                            ))}
                        </View>
                    )}
                    ListHeaderComponent={renderListHeader}
                    ListEmptyComponent={renderEmptyState}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
                />
            )}

            {/* Filter Modal */}
            <Modal visible={showFilters} transparent={true} animationType="fade" onRequestClose={() => setShowFilters(false)}>
                <View className="flex-1 bg-black/50 justify-end">
                    <Pressable className="flex-1" onPress={() => setShowFilters(false)} />
                    <Animated.View
                        className="bg-white rounded-t-3xl"
                        style={{
                            transform: [
                                {
                                    translateY: filterModalAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [300, 0],
                                    }),
                                },
                            ],
                        }}
                    >
                        <View className="p-4">
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-xl font-bold text-[#3D4152]">Filter Transactions</Text>
                                <TouchableOpacity onPress={toggleFilters}>
                                    <Ionicons name="close" size={24} color="#9CA3AF" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView className="max-h-[60vh]" showsVerticalScrollIndicator={false}>
                                {/* Transaction Type */}
                                <View className="mb-6">
                                    <Text className="text-sm font-medium text-[#6B7280] mb-3">Transaction Type</Text>
                                    <View className="flex-row">
                                        {TRANSACTION_TYPES.map((type) => (
                                            <TouchableOpacity
                                                key={type.id}
                                                className={`flex-1 py-2 px-3 rounded-lg mr-2 border ${tempFilters.type === type.id
                                                    ? type.id === "credit"
                                                        ? "border-[#3AB757] bg-green-50"
                                                        : type.id === "debit"
                                                            ? "border-[#E23744] bg-red-50"
                                                            : "border-[#E23744] bg-red-50"
                                                    : "border-gray-200"
                                                    }`}
                                                onPress={() => setTempFilters({ ...tempFilters, type: type.id })}
                                            >
                                                <View className="items-center">
                                                    <Ionicons
                                                        name={type.icon}
                                                        size={20}
                                                        color={
                                                            tempFilters.type === type.id
                                                                ? type.id === "credit"
                                                                    ? COLORS.green
                                                                    : type.id === "debit"
                                                                        ? COLORS.red
                                                                        : COLORS.primary
                                                                : "#6B7280"
                                                        }
                                                    />
                                                    <Text
                                                        className={`text-xs mt-1 ${tempFilters.type === type.id
                                                            ? type.id === "credit"
                                                                ? "text-[#3AB757]"
                                                                : type.id === "debit"
                                                                    ? "text-[#E23744]"
                                                                    : "text-[#E23744]"
                                                            : "text-[#6B7280]"
                                                            }`}
                                                    >
                                                        {type.label}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* Category */}
                                <View className="mb-6">
                                    <Text className="text-sm font-medium text-[#6B7280] mb-3">Category</Text>
                                    {CATEGORIES.map((category) => (
                                        <TouchableOpacity
                                            key={category.id}
                                            className="flex-row items-center py-3 border-b border-gray-100"
                                            onPress={() => setTempFilters({ ...tempFilters, category: category.id })}
                                        >
                                            <Text
                                                className={`flex-1 ${tempFilters.category === category.id ? "text-[#E23744] font-medium" : "text-[#3D4152]"
                                                    }`}
                                            >
                                                {category.label}
                                            </Text>
                                            {tempFilters.category === category.id && (
                                                <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Date Range */}
                                <View className="mb-6">
                                    <Text className="text-sm font-medium text-[#6B7280] mb-3">Date Range</Text>
                                    {DATE_RANGES.map((dateRange) => (
                                        <TouchableOpacity
                                            key={dateRange.id}
                                            className="flex-row items-center py-3 border-b border-gray-100"
                                            onPress={() => {
                                                if (dateRange.id === "custom") {
                                                    setTempFilters({
                                                        ...tempFilters,
                                                        dateRange: dateRange.id,
                                                    })
                                                } else {
                                                    setTempFilters({
                                                        ...tempFilters,
                                                        dateRange: dateRange.id,
                                                        startDate: null,
                                                        endDate: null,
                                                    })
                                                }
                                            }}
                                        >
                                            <Text
                                                className={`flex-1 ${tempFilters.dateRange === dateRange.id ? "text-[#E23744] font-medium" : "text-[#3D4152]"
                                                    }`}
                                            >
                                                {dateRange.label}
                                            </Text>
                                            {tempFilters.dateRange === dateRange.id && (
                                                <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                                            )}
                                        </TouchableOpacity>
                                    ))}

                                    {/* Custom Date Range */}
                                    {tempFilters.dateRange === "custom" && (
                                        <View className="mt-3 bg-gray-50 p-3 rounded-lg">
                                            <View className="flex-row justify-between mb-3">
                                                <TouchableOpacity
                                                    className="flex-1 mr-2 bg-white border border-gray-200 rounded-lg p-3"
                                                    onPress={() => showDatePickerModal("start")}
                                                >
                                                    <Text className="text-xs text-[#6B7280] mb-1">Start Date</Text>
                                                    <Text className="text-[#3D4152] font-medium">
                                                        {tempFilters.startDate ? formatDate(tempFilters.startDate) : "Select"}
                                                    </Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    className="flex-1 ml-2 bg-white border border-gray-200 rounded-lg p-3"
                                                    onPress={() => showDatePickerModal("end")}
                                                >
                                                    <Text className="text-xs text-[#6B7280] mb-1">End Date</Text>
                                                    <Text className="text-[#3D4152] font-medium">
                                                        {tempFilters.endDate ? formatDate(tempFilters.endDate) : "Select"}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}
                                </View>

                                {/* Amount Range */}
                                <View className="mb-6">
                                    <Text className="text-sm font-medium text-[#6B7280] mb-3">Amount Range</Text>
                                    <View className="flex-row justify-between">
                                        <View className="flex-1 mr-2">
                                            <Text className="text-xs text-[#6B7280] mb-1">Min Amount</Text>
                                            <View className="flex-row items-center border border-gray-200 rounded-lg px-3 py-2 bg-white">
                                                <Text className="text-[#3D4152] mr-1">₹</Text>
                                                <TextInput
                                                    className="flex-1 text-[#3D4152]"
                                                    placeholder="0"
                                                    keyboardType="numeric"
                                                    value={tempFilters.minAmount}
                                                    onChangeText={(text) => setTempFilters({ ...tempFilters, minAmount: text })}
                                                />
                                            </View>
                                        </View>
                                        <View className="flex-1 ml-2">
                                            <Text className="text-xs text-[#6B7280] mb-1">Max Amount</Text>
                                            <View className="flex-row items-center border border-gray-200 rounded-lg px-3 py-2 bg-white">
                                                <Text className="text-[#3D4152] mr-1">₹</Text>
                                                <TextInput
                                                    className="flex-1 text-[#3D4152]"
                                                    placeholder="Any"
                                                    keyboardType="numeric"
                                                    value={tempFilters.maxAmount}
                                                    onChangeText={(text) => setTempFilters({ ...tempFilters, maxAmount: text })}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </ScrollView>

                            <View className="flex-row mt-4">
                                <TouchableOpacity className="flex-1 py-3 rounded-lg border border-gray-200 mr-2" onPress={resetFilters}>
                                    <Text className="text-center font-medium text-[#3D4152]">Reset</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="flex-1 py-3 rounded-lg bg-[#E23744] ml-2" onPress={applyTempFilters}>
                                    <Text className="text-center font-medium text-white">Apply Filters</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Safe area bottom padding */}
                        <View style={{ height: insets.bottom }} className="bg-white" />
                    </Animated.View>
                </View>
            </Modal>

            {showDatePicker && (
                <DateTimePicker
                    value={
                        datePickerMode === "start" && tempFilters.startDate
                            ? new Date(tempFilters.startDate)
                            : datePickerMode === "end" && tempFilters.endDate
                                ? new Date(tempFilters.endDate)
                                : new Date()
                    }
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                />
            )}
        </View>
    )
}
