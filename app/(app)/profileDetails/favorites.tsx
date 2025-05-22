import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Image,
  FlatList,
  Modal,
  Alert,
} from "react-native"
import { MaterialIcons, Ionicons, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons"
import { router } from "expo-router"
import React from "react"

// Restaurant type definition
type Restaurant = {
  id: string
  name: string
  image: string
  cuisine: string
  rating: number
  priceLevel: 1 | 2 | 3 | 4
  address: string
  distance: string
  isFavorite: boolean
  coordinates: {
    latitude: number
    longitude: number
  }
}

// Initial restaurant data
const initialRestaurants: Restaurant[] = [
  {
    id: "1",
    name: "Spice Garden",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80",
    cuisine: "Indian",
    rating: 4.5,
    priceLevel: 2,
    address: "123 Main St, San Francisco, CA",
    distance: "1.2 km",
    isFavorite: true,
    coordinates: {
      latitude: 37.7749,
      longitude: -122.4194,
    },
  },
  {
    id: "2",
    name: "Pasta Paradise",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80",
    cuisine: "Italian",
    rating: 4.2,
    priceLevel: 3,
    address: "456 Market St, San Francisco, CA",
    distance: "0.8 km",
    isFavorite: true,
    coordinates: {
      latitude: 37.7899,
      longitude: -122.4009,
    },
  },
  {
    id: "3",
    name: "Sushi Spot",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80",
    cuisine: "Japanese",
    rating: 4.8,
    priceLevel: 4,
    address: "789 Mission St, San Francisco, CA",
    distance: "2.5 km",
    isFavorite: true,
    coordinates: {
      latitude: 37.7833,
      longitude: -122.4167,
    },
  },
  {
    id: "4",
    name: "Taco Town",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80",
    cuisine: "Mexican",
    rating: 4.0,
    priceLevel: 1,
    address: "101 Valencia St, San Francisco, CA",
    distance: "1.5 km",
    isFavorite: true,
    coordinates: {
      latitude: 37.7583,
      longitude: -122.4267,
    },
  },
  {
    id: "5",
    name: "Burger Bistro",
    image:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cmVzdGF1cmFudHxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80",
    cuisine: "American",
    rating: 4.3,
    priceLevel: 2,
    address: "222 Fillmore St, San Francisco, CA",
    distance: "3.0 km",
    isFavorite: true,
    coordinates: {
      latitude: 37.7694,
      longitude: -122.4294,
    },
  },
]

// Cuisine filter options
const cuisineFilters = [
  "All",
  "Indian",
  "Italian",
  "Japanese",
  "Mexican",
  "American",
  "Chinese",
  "Thai",
  "Mediterranean",
]

export default function FavoriteRestaurants({ navigation }: any) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants)
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(initialRestaurants)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCuisine, setSelectedCuisine] = useState("All")
  const [sortBy, setSortBy] = useState<"rating" | "distance" | "name">("rating")
  const [showSortModal, setShowSortModal] = useState(false)
  const [showRestaurantDetail, setShowRestaurantDetail] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)

  // Filter and sort restaurants when search query, cuisine filter, or sort option changes
  useEffect(() => {
    let result = [...restaurants]

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
          restaurant.address.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply cuisine filter
    if (selectedCuisine !== "All") {
      result = result.filter((restaurant) => restaurant.cuisine === selectedCuisine)
    }

    // Apply sorting
    if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating)
    } else if (sortBy === "distance") {
      result.sort((a, b) => {
        const distanceA = Number.parseFloat(a.distance.replace(" km", ""))
        const distanceB = Number.parseFloat(b.distance.replace(" km", ""))
        return distanceA - distanceB
      })
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name))
    }

    setFilteredRestaurants(result)
  }, [restaurants, searchQuery, selectedCuisine, sortBy])

  // Toggle favorite status
  const toggleFavorite = (id: string) => {
    setRestaurants((prevRestaurants) =>
      prevRestaurants.map((restaurant) =>
        restaurant.id === id ? { ...restaurant, isFavorite: !restaurant.isFavorite } : restaurant,
      ),
    )
  }

  // Remove restaurant from favorites
  const removeFromFavorites = (id: string) => {
    Alert.alert("Remove from Favorites", "Are you sure you want to remove this restaurant from your favorites?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setRestaurants((prevRestaurants) => prevRestaurants.filter((restaurant) => restaurant.id !== id))
          setShowRestaurantDetail(false)
        },
      },
    ])
  }

  // Open restaurant detail modal
  const openRestaurantDetail = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant)
    setShowRestaurantDetail(true)
  }

  // Render price level ($ symbols)
  const renderPriceLevel = (level: number) => {
    const symbols = []
    for (let i = 0; i < level; i++) {
      symbols.push(
        <Text key={i} style={styles.priceSymbol}>
          $
        </Text>,
      )
    }
    for (let i = level; i < 4; i++) {
      symbols.push(
        <Text key={i + 4} style={[styles.priceSymbol, styles.priceSymbolInactive]}>
          $
        </Text>,
      )
    }
    return <View style={styles.priceContainer}>{symbols}</View>
  }

  // Render rating stars
  const renderRatingStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const halfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FontAwesome key={i} name="star" size={16} color="#FFD700" />)
    }

    if (halfStar) {
      stars.push(<FontAwesome key="half" name="star-half-o" size={16} color="#FFD700" />)
    }

    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FontAwesome key={`empty-${i}`} name="star-o" size={16} color="#FFD700" />)
    }

    return <View style={styles.ratingContainer}>{stars}</View>
  }

  // Render restaurant card
  const renderRestaurantCard = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity style={styles.restaurantCard} onPress={() => openRestaurantDetail(item)} activeOpacity={0.8}>
      <Image source={{ uri: item.image }} style={styles.restaurantImage} />
      <View style={styles.favoriteButton}>
        <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
          <MaterialIcons
            name={item.isFavorite ? "favorite" : "favorite-border"}
            size={24}
            color={item.isFavorite ? "#f97316" : "#ffffff"}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.restaurantName}>{item.name}</Text>
          <View style={styles.cuisineBadge}>
            <Text style={styles.cuisineText}>{item.cuisine}</Text>
          </View>
        </View>
        <View style={styles.cardDetails}>
          <View style={styles.ratingRow}>
            {renderRatingStars(item.rating)}
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MaterialIcons name="attach-money" size={16} color="#6b7280" />
              {renderPriceLevel(item.priceLevel)}
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="place" size={16} color="#6b7280" />
              <Text style={styles.infoText}>{item.distance}</Text>
            </View>
          </View>
          <Text style={styles.addressText} numberOfLines={1}>
            {item.address}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  // Render restaurant detail modal
  const renderRestaurantDetailModal = () => {
    if (!selectedRestaurant) return null

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showRestaurantDetail}
        onRequestClose={() => setShowRestaurantDetail(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.detailModalContent}>
            <Image source={{ uri: selectedRestaurant.image }} style={styles.detailImage} />
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowRestaurantDetail(false)}>
              <Ionicons name="close-circle" size={32} color="#ffffff" />
            </TouchableOpacity>
            <View style={styles.detailContent}>
              <View style={styles.detailHeader}>
                <Text style={styles.detailName}>{selectedRestaurant.name}</Text>
                <TouchableOpacity
                  onPress={() => toggleFavorite(selectedRestaurant.id)}
                  style={styles.detailFavoriteButton}
                >
                  <MaterialIcons
                    name={selectedRestaurant.isFavorite ? "favorite" : "favorite-border"}
                    size={28}
                    color={selectedRestaurant.isFavorite ? "#f97316" : "#6b7280"}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.cuisineBadge}>
                  <Text style={styles.cuisineText}>{selectedRestaurant.cuisine}</Text>
                </View>
                <View style={styles.ratingRow}>
                  {renderRatingStars(selectedRestaurant.rating)}
                  <Text style={styles.ratingText}>{selectedRestaurant.rating.toFixed(1)}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <MaterialIcons name="attach-money" size={18} color="#6b7280" />
                  {renderPriceLevel(selectedRestaurant.priceLevel)}
                </View>
                <View style={styles.detailItem}>
                  <MaterialIcons name="place" size={18} color="#6b7280" />
                  <Text style={styles.detailItemText}>{selectedRestaurant.distance}</Text>
                </View>
              </View>

              <View style={styles.addressContainer}>
                <MaterialIcons name="location-on" size={20} color="#6b7280" />
                <Text style={styles.detailAddress}>{selectedRestaurant.address}</Text>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <MaterialIcons name="directions" size={20} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Directions</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <MaterialIcons name="phone" size={20} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <MaterialIcons name="share" size={20} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Share</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.removeButton} onPress={() => removeFromFavorites(selectedRestaurant.id)}>
                <MaterialIcons name="delete" size={20} color="#ef4444" />
                <Text style={styles.removeButtonText}>Remove from Favorites</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    )
  }

  // Render sort modal
  const renderSortModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showSortModal}
      onRequestClose={() => setShowSortModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.sortModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sort By</Text>
            <TouchableOpacity onPress={() => setShowSortModal(false)}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.sortOption, sortBy === "rating" && styles.selectedSortOption]}
            onPress={() => {
              setSortBy("rating")
              setShowSortModal(false)
            }}
          >
            <MaterialIcons name="star" size={20} color={sortBy === "rating" ? "#f97316" : "#6b7280"} />
            <Text style={[styles.sortOptionText, sortBy === "rating" && styles.selectedSortOptionText]}>
              Highest Rated
            </Text>
            {sortBy === "rating" && <MaterialIcons name="check" size={20} color="#f97316" />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortOption, sortBy === "distance" && styles.selectedSortOption]}
            onPress={() => {
              setSortBy("distance")
              setShowSortModal(false)
            }}
          >
            <MaterialIcons name="place" size={20} color={sortBy === "distance" ? "#f97316" : "#6b7280"} />
            <Text style={[styles.sortOptionText, sortBy === "distance" && styles.selectedSortOptionText]}>
              Nearest First
            </Text>
            {sortBy === "distance" && <MaterialIcons name="check" size={20} color="#f97316" />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortOption, sortBy === "name" && styles.selectedSortOption]}
            onPress={() => {
              setSortBy("name")
              setShowSortModal(false)
            }}
          >
            <MaterialIcons name="sort-by-alpha" size={20} color={sortBy === "name" ? "#f97316" : "#6b7280"} />
            <Text style={[styles.sortOptionText, sortBy === "name" && styles.selectedSortOptionText]}>
              Alphabetical
            </Text>
            {sortBy === "name" && <MaterialIcons name="check" size={20} color="#f97316" />}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorite Restaurants</Text>
        <TouchableOpacity style={styles.sortButton} onPress={() => setShowSortModal(true)}>
          <MaterialIcons name="sort" size={24} color="#4b5563" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants, cuisines..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Cuisine Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContent}
        >
          {cuisineFilters.map((cuisine) => (
            <TouchableOpacity
              key={cuisine}
              style={[styles.filterChip, selectedCuisine === cuisine && styles.activeFilterChip]}
              onPress={() => setSelectedCuisine(cuisine)}
            >
              <Text style={[styles.filterChipText, selectedCuisine === cuisine && styles.activeFilterChipText]}>
                {cuisine}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Restaurant List */}
      {filteredRestaurants.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="food-off" size={64} color="#d1d5db" />
          <Text style={styles.emptyStateTitle}>No restaurants found</Text>
          <Text style={styles.emptyStateText}>Try changing your search or filter criteria</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRestaurants}
          renderItem={renderRestaurantCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.restaurantList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Sort Modal */}
      {renderSortModal()}

      {/* Restaurant Detail Modal */}
      {renderRestaurantDetailModal()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  sortButton: {
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 30,
    paddingHorizontal: 16,
    height: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  clearButton: {
    padding: 4,
  },
  filtersContainer: {
    paddingBottom: 12,
  },
  filtersScrollContent: {
    paddingHorizontal: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    marginHorizontal: 4,
  },
  activeFilterChip: {
    backgroundColor: "#f97316",
  },
  filterChipText: {
    fontSize: 14,
    color: "#4b5563",
    fontWeight: "500",
  },
  activeFilterChipText: {
    color: "#ffffff",
  },
  restaurantList: {
    padding: 16,
    paddingTop: 8,
  },
  restaurantCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  restaurantImage: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  favoriteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 20,
    padding: 6,
  },
  cardContent: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  cuisineBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cuisineText: {
    fontSize: 12,
    color: "#4b5563",
    fontWeight: "500",
  },
  cardDetails: {
    gap: 6,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    marginRight: 6,
  },
  ratingText: {
    fontSize: 14,
    color: "#4b5563",
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  infoText: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: "row",
    marginLeft: 4,
  },
  priceSymbol: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
  },
  priceSymbolInactive: {
    color: "#d1d5db",
  },
  addressText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4b5563",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  sortModalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  selectedSortOption: {
    backgroundColor: "#f9fafb",
  },
  sortOptionText: {
    fontSize: 16,
    color: "#4b5563",
    marginLeft: 12,
    flex: 1,
  },
  selectedSortOptionText: {
    color: "#f97316",
    fontWeight: "500",
  },
  detailModalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: "85%",
  },
  detailImage: {
    width: "100%",
    height: 220,
    resizeMode: "cover",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 20,
  },
  detailContent: {
    padding: 16,
    flex: 1,
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  detailName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  detailFavoriteButton: {
    padding: 4,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  detailItemText: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 4,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  detailAddress: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f97316",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: "#ffffff",
    fontWeight: "500",
    marginLeft: 6,
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ef4444",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  removeButtonText: {
    color: "#ef4444",
    fontWeight: "500",
    marginLeft: 6,
  },
})
