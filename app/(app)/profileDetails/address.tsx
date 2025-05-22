import { useState, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native"
import { MaterialIcons, Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons"
import * as Location from "expo-location"
import { router } from "expo-router"
import "react-native-get-random-values"
import React from "react"

// Address type definition
type Address = {
  id: string
  title: string
  type: "home" | "work" | "other"
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  latitude: number
  longitude: number
  isDefault: boolean
}

// Initial saved addresses
const initialAddresses: Address[] = [
  {
    id: "1",
    title: "Home",
    type: "home",
    street: "123 Main Street",
    city: "San Francisco",
    state: "CA",
    zipCode: "94105",
    country: "USA",
    latitude: 37.7749,
    longitude: -122.4194,
    isDefault: true,
  },
  {
    id: "2",
    title: "Office",
    type: "work",
    street: "456 Market Street",
    city: "San Francisco",
    state: "CA",
    zipCode: "94103",
    country: "USA",
    latitude: 37.7899,
    longitude: -122.4009,
    isDefault: false,
  },
]

// Recent searches
const initialRecentSearches = [
  {
    id: "1",
    name: "Jhotwara",
    distance: "21.1 km",
    fullAddress: "Jaipur, Rajasthan, India (jhotwara)",
    latitude: 26.9124,
    longitude: 75.7873,
  },
]

// Google Maps API Key - Replace with your actual key
const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY"

export default function AddressPage({ navigation }: any) {
  // State for addresses and searches
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses)
  const [recentSearches, setRecentSearches] = useState(initialRecentSearches)

  // Location states
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Modal states
  const [addAddressModalVisible, setAddAddressModalVisible] = useState(false)
  const [editAddressModalVisible, setEditAddressModalVisible] = useState(false)
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null)

  // New address form state
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    title: "",
    type: "home",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    latitude: 0,
    longitude: 0,
    isDefault: false,
  })

  // Refs
  const googlePlacesRef = useRef(null)

  // Get current location
  const getCurrentLocation = async () => {
    setLocationLoading(true)
    setLocationError(null)

    try {
      const { status } = await Location.requestForegroundPermissionsAsync()

      if (status !== "granted") {
        setLocationError("Permission to access location was denied")
        setLocationLoading(false)
        return
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })

      const { latitude, longitude } = location.coords
      setCurrentLocation({ latitude, longitude })

      // Get address details from coordinates
      const addressDetails = await getAddressFromCoordinates(latitude, longitude)

      if (addressDetails) {
        Alert.alert(
          "Set as Home Address?",
          `Would you like to set your current location as your home address?\n\n${addressDetails.street}, ${addressDetails.city}, ${addressDetails.state} ${addressDetails.zipCode}`,
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Yes",
              onPress: () => {
                // Create a new address object with current location
                const newHomeAddress: Address = {
                  id: Date.now().toString(),
                  title: "Home",
                  type: "home",
                  street: addressDetails.street,
                  city: addressDetails.city,
                  state: addressDetails.state,
                  zipCode: addressDetails.zipCode,
                  country: addressDetails.country,
                  latitude,
                  longitude,
                  isDefault: true,
                }

                // Update addresses list, setting all other addresses as non-default
                setAddresses((prevAddresses) => {
                  const updatedAddresses = prevAddresses.map((addr) => ({
                    ...addr,
                    isDefault: false,
                  }))

                  // Check if a home address already exists
                  const existingHomeIndex = updatedAddresses.findIndex((addr) => addr.type === "home")

                  if (existingHomeIndex >= 0) {
                    // Replace existing home address
                    updatedAddresses[existingHomeIndex] = newHomeAddress
                    return updatedAddresses
                  } else {
                    // Add new home address
                    return [...updatedAddresses, newHomeAddress]
                  }
                })
              },
            },
          ],
        )
      }
    } catch (error) {
      console.error("Error getting current location:", error)
      setLocationError("Failed to get your current location")
    } finally {
      setLocationLoading(false)
    }
  }

  // Get address from coordinates
  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const response = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      })

      if (response.length > 0) {
        const address = response[0]
        return {
          street: `${address.name || ""} ${address.street || ""}`.trim(),
          city: address.city || "",
          state: address.region || "",
          zipCode: address.postalCode || "",
          country: address.country || "",
        }
      }
      return null
    } catch (error) {
      console.error("Error getting address from coordinates:", error)
      return null
    }
  }

  // Get icon for address type
  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case "home":
        return <MaterialCommunityIcons name="home" size={20} color="#4b5563" />
      case "work":
        return <MaterialIcons name="work" size={20} color="#4b5563" />
      default:
        return <MaterialCommunityIcons name="navigation-variant" size={20} color="#4b5563" />
    }
  }

  // Delete address
  const deleteAddress = (id: string) => {
    Alert.alert("Delete Address", "Are you sure you want to delete this address?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setAddresses((prevAddresses) => prevAddresses.filter((addr) => addr.id !== id))
        },
      },
    ])
  }

  // Set address as default
  const setAsDefault = (id: string) => {
    setAddresses((prevAddresses) =>
      prevAddresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      })),
    )
  }

  // Open edit address modal
  const openEditModal = (address: Address) => {
    setAddressToEdit(address)
    setNewAddress({
      title: address.title,
      type: address.type,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      latitude: address.latitude,
      longitude: address.longitude,
      isDefault: address.isDefault,
    })
    setEditAddressModalVisible(true)
  }

  // Save edited address
  const saveEditedAddress = () => {
    if (!addressToEdit) return

    if (!newAddress.title || !newAddress.street || !newAddress.city) {
      Alert.alert("Missing Information", "Please fill in all required fields")
      return
    }

    setAddresses((prevAddresses) =>
      prevAddresses.map((addr) => {
        if (addr.id === addressToEdit.id) {
          return {
            ...addr,
            ...newAddress,
          } as Address
        }
        return addr
      }),
    )

    setEditAddressModalVisible(false)
    setAddressToEdit(null)
    setNewAddress({
      title: "",
      type: "home",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      latitude: 0,
      longitude: 0,
      isDefault: false,
    })
  }

  // Add new address
  const addNewAddress = () => {
    if (!newAddress.title || !newAddress.street || !newAddress.city) {
      Alert.alert("Missing Information", "Please fill in all required fields")
      return
    }

    const newAddressObj: Address = {
      id: Date.now().toString(),
      title: newAddress.title || "",
      type: newAddress.type as "home" | "work" | "other",
      street: newAddress.street || "",
      city: newAddress.city || "",
      state: newAddress.state || "",
      zipCode: newAddress.zipCode || "",
      country: newAddress.country || "",
      latitude: newAddress.latitude || 0,
      longitude: newAddress.longitude || 0,
      isDefault: newAddress.isDefault || false,
    }

    // If this is set as default, update other addresses
    if (newAddress.isDefault) {
      setAddresses((prevAddresses) => [...prevAddresses.map((addr) => ({ ...addr, isDefault: false })), newAddressObj])
    } else {
      setAddresses((prevAddresses) => [...prevAddresses, newAddressObj])
    }

    setAddAddressModalVisible(false)
    setNewAddress({
      title: "",
      type: "home",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      latitude: 0,
      longitude: 0,
      isDefault: false,
    })
  }

  // Handle place selection from Google Places
  const handlePlaceSelect = (data: any, details: any = null) => {
    if (details) {
      const { geometry, address_components } = details

      // Extract address components
      let street = ""
      let city = ""
      let state = ""
      let zipCode = ""
      let country = ""

      address_components.forEach((component: any) => {
        const types = component.types

        if (types.includes("street_number")) {
          street = component.long_name
        } else if (types.includes("route")) {
          street = street ? `${street} ${component.long_name}` : component.long_name
        } else if (types.includes("locality")) {
          city = component.long_name
        } else if (types.includes("administrative_area_level_1")) {
          state = component.short_name
        } else if (types.includes("postal_code")) {
          zipCode = component.long_name
        } else if (types.includes("country")) {
          country = component.long_name
        }
      })

      // Update new address state
      setNewAddress({
        ...newAddress,
        street,
        city,
        state,
        zipCode,
        country,
        latitude: geometry.location.lat,
        longitude: geometry.location.lng,
      })

      // Add to recent searches
      const searchItem = {
        id: Date.now().toString(),
        name: details.name || details.formatted_address.split(",")[0],
        distance: "N/A",
        fullAddress: details.formatted_address,
        latitude: geometry.location.lat,
        longitude: geometry.location.lng,
      }

      setRecentSearches((prev) => {
        // Check if already exists
        const exists = prev.some((item) => item.fullAddress === searchItem.fullAddress)
        if (!exists) {
          return [searchItem, ...prev].slice(0, 5) // Keep only 5 recent searches
        }
        return prev
      })
    }
  }

  // Alternative to GooglePlacesAutocomplete for environments where it might cause issues
  const renderManualAddressInput = () => (
    <View style={styles.formGroup}>
      <Text style={styles.formLabel}>Search for location</Text>
      <TextInput
        style={styles.formInput}
        placeholder="Enter location manually"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <TouchableOpacity
        style={styles.manualSearchButton}
        onPress={() => {
          // Simple placeholder for search functionality
          Alert.alert("Manual Search", "In a real app, this would search for the address: " + searchQuery)
        }}
      >
        <Text style={styles.manualSearchButtonText}>Search</Text>
      </TouchableOpacity>
    </View>
  )

  // Render add/edit address modal
  const renderAddressModal = (isEdit: boolean) => {
    const modalTitle = isEdit ? "Edit Address" : "Add New Address"
    const saveAction = isEdit ? saveEditedAddress : addNewAddress

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEdit ? editAddressModalVisible : addAddressModalVisible}
        onRequestClose={() => {
          if (isEdit) {
            setEditAddressModalVisible(false)
            setAddressToEdit(null)
          } else {
            setAddAddressModalVisible(false)
          }
          setNewAddress({
            title: "",
            type: "home",
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "",
            latitude: 0,
            longitude: 0,
            isDefault: false,
          })
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <TouchableOpacity
                onPress={() => {
                  if (isEdit) {
                    setEditAddressModalVisible(false)
                    setAddressToEdit(null)
                  } else {
                    setAddAddressModalVisible(false)
                  }
                  setNewAddress({
                    title: "",
                    type: "home",
                    street: "",
                    city: "",
                    state: "",
                    zipCode: "",
                    country: "",
                    latitude: 0,
                    longitude: 0,
                    isDefault: false,
                  })
                }}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Address Title */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Address Title</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Home, Work, etc."
                  value={newAddress.title}
                  onChangeText={(text) => setNewAddress({ ...newAddress, title: text })}
                />
              </View>

              {/* Address Type */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Address Type</Text>
                <View style={styles.addressTypeContainer}>
                  <TouchableOpacity
                    style={[styles.addressTypeButton, newAddress.type === "home" && styles.addressTypeButtonActive]}
                    onPress={() => setNewAddress({ ...newAddress, type: "home" })}
                  >
                    <MaterialCommunityIcons
                      name="home"
                      size={20}
                      color={newAddress.type === "home" ? "#ffffff" : "#4b5563"}
                    />
                    <Text style={[styles.addressTypeText, newAddress.type === "home" && styles.addressTypeTextActive]}>
                      Home
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.addressTypeButton, newAddress.type === "work" && styles.addressTypeButtonActive]}
                    onPress={() => setNewAddress({ ...newAddress, type: "work" })}
                  >
                    <MaterialIcons name="work" size={20} color={newAddress.type === "work" ? "#ffffff" : "#4b5563"} />
                    <Text style={[styles.addressTypeText, newAddress.type === "work" && styles.addressTypeTextActive]}>
                      Work
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.addressTypeButton, newAddress.type === "other" && styles.addressTypeButtonActive]}
                    onPress={() => setNewAddress({ ...newAddress, type: "other" })}
                  >
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={20}
                      color={newAddress.type === "other" ? "#ffffff" : "#4b5563"}
                    />
                    <Text style={[styles.addressTypeText, newAddress.type === "other" && styles.addressTypeTextActive]}>
                      Other
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Search for location - Use manual input as fallback */}
              {!isEdit && renderManualAddressInput()}

              {/* Street */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Street</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Street address"
                  value={newAddress.street}
                  onChangeText={(text) => setNewAddress({ ...newAddress, street: text })}
                />
              </View>

              {/* City */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>City</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="City"
                  value={newAddress.city}
                  onChangeText={(text) => setNewAddress({ ...newAddress, city: text })}
                />
              </View>

              {/* State and Zip Code */}
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.formLabel}>State</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="State"
                    value={newAddress.state}
                    onChangeText={(text) => setNewAddress({ ...newAddress, state: text })}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.formLabel}>Zip Code</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Zip Code"
                    value={newAddress.zipCode}
                    onChangeText={(text) => setNewAddress({ ...newAddress, zipCode: text })}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              {/* Country */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Country</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Country"
                  value={newAddress.country}
                  onChangeText={(text) => setNewAddress({ ...newAddress, country: text })}
                />
              </View>

              {/* Set as default */}
              <TouchableOpacity className="pb-12"
                style={styles.defaultCheckbox}
                onPress={() => setNewAddress({ ...newAddress, isDefault: !newAddress.isDefault })}
              >
                <View
                  style={[
                    styles.checkbox,
                    newAddress.isDefault && { backgroundColor: "#f97316", borderColor: "#f97316" },
                  ]}
                >
                  {newAddress.isDefault && <Ionicons name="checkmark" size={16} color="#ffffff" />}
                </View>
                <Text  style={styles.checkboxLabel}>Set as default address</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  if (isEdit) {
                    setEditAddressModalVisible(false)
                    setAddressToEdit(null)
                  } else {
                    setAddAddressModalVisible(false)
                  }
                  setNewAddress({
                    title: "",
                    type: "home",
                    street: "",
                    city: "",
                    state: "",
                    zipCode: "",
                    country: "",
                    latitude: 0,
                    longitude: 0,
                    isDefault: false,
                  })
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={saveAction}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View className="flex-row items-center px-3 py-4 bg-white ">
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl">Enter your area</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Try JP Nagar, Siri Gardenia, etc."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text)
              // Implement search logic here
              if (text.length > 2) {
                setIsSearching(true)
                // In a real app, you would call the Google Places API here
                // For now, we'll just simulate some results
                setTimeout(() => {
                  setIsSearching(false)
                }, 500)
              } else {
                setIsSearching(false)
                setSearchResults([])
              }
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("")
                setSearchResults([])
                setIsSearching(false)
              }}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity style={styles.currentLocationButton} onPress={getCurrentLocation} disabled={locationLoading}>
          <View style={styles.buttonContent}>
            <Feather name="navigation" size={20} color="#f97316" />
            <Text style={styles.currentLocationText}>Use my current location</Text>
          </View>
          {locationLoading ? (
            <ActivityIndicator size="small" color="#3b82f6" />
          ) : (
            <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addAddressButton}
          onPress={() => {
            setAddAddressModalVisible(true)
          }}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="add" size={20} color="#f97316" />
            <Text style={styles.addAddressText}>Add new address</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Saved Addresses Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SAVED ADDRESSES</Text>

          {addresses.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No saved addresses</Text>
            </View>
          ) : (
            addresses.map((address) => (
              <TouchableOpacity
                key={address.id}
                style={styles.addressItem}
                onPress={() => {
                  // Handle address selection
                  console.log(`Selected address: ${address.title}`)
                }}
              >
                <View style={styles.addressContent}>
                  <View style={styles.addressIconContainer}>{getAddressTypeIcon(address.type)}</View>
                  <View style={styles.addressDetails}>
                    <View style={styles.addressHeader}>
                      <Text style={styles.addressName}>{address.title}</Text>
                      {address.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.addressFull} numberOfLines={1}>
                      {address.street}, {address.city}
                    </Text>
                    <Text style={styles.addressFull} numberOfLines={1}>
                      {address.state} {address.zipCode}, {address.country}
                    </Text>
                  </View>
                </View>
                <View style={styles.addressActions}>
                  {!address.isDefault && (
                    <TouchableOpacity style={styles.actionButton} onPress={() => setAsDefault(address.id)}>
                      <MaterialCommunityIcons name="home" size={18} color="#6b7280" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.actionButton} onPress={() => openEditModal(address)}>
                    <MaterialIcons name="edit" size={18} color="#6b7280" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} onPress={() => deleteAddress(address.id)}>
                    <MaterialIcons name="delete" size={18} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Recent Searches Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECENT SEARCHES</Text>

          {recentSearches.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No recent searches</Text>
            </View>
          ) : (
            recentSearches.map((search) => (
              <TouchableOpacity
                key={search.id}
                style={styles.addressItem}
                onPress={() => {
                  // Handle recent search selection
                  console.log(`Selected recent search: ${search.name}`)
                }}
              >
                <View style={styles.addressContent}>
                  <View style={styles.addressIconContainer}>
                    <Ionicons name="location-outline" size={20} color="#6b7280" />
                  </View>
                  <View style={styles.addressDetails}>
                    <View style={styles.addressHeader}>
                      <Text style={styles.addressName}>{search.name}</Text>
                      <Text style={styles.addressDistance}>• {search.distance}</Text>
                    </View>
                    <Text style={styles.addressFull}>{search.fullAddress}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => {
                    // Handle options for recent search
                    Alert.alert("Options", `What would you like to do with "${search.name}"?`, [
                      {
                        text: "Cancel",
                        style: "cancel",
                      },
                      {
                        text: "Save as Address",
                        onPress: () => {
                          setNewAddress({
                            title: search.name,
                            type: "other",
                            street: search.fullAddress.split(",")[0],
                            city: search.fullAddress.split(",")[1]?.trim() || "",
                            state: search.fullAddress.split(",")[2]?.trim() || "",
                            country: search.fullAddress.split(",")[3]?.trim() || "",
                            latitude: search.latitude,
                            longitude: search.longitude,
                            isDefault: false,
                          })
                          setAddAddressModalVisible(true)
                        },
                      },
                      {
                        text: "Remove from History",
                        style: "destructive",
                        onPress: () => {
                          setRecentSearches((prev) => prev.filter((item) => item.id !== search.id))
                        },
                      },
                    ])
                  }}
                >
                  <Feather name="more-vertical" size={20} color="#6b7280" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>
        <View style={styles.bottomSpacing} />
      </ScrollView>
      {renderAddressModal(false)}
      {renderAddressModal(true)}
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 30,
    paddingHorizontal: 16,
    height: 50,
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
  content: {
    flex: 1,
  },
  currentLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  currentLocationText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#f97316",
    marginLeft: 12,
  },
  addAddressButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  addAddressText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#f97316",
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginTop: 8,
  },
  section: {
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#9ca3af",
    paddingHorizontal: 16,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  addressItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  addressContent: {
    flexDirection: "row",
    flex: 1,
  },
  addressIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  addressDetails: {
    flex: 1,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  addressName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4b5563",
  },
  addressDistance: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 4,
  },
  addressFull: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 4,
    lineHeight: 20,
  },
  addressActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
  },
  menuButton: {
    padding: 8,
  },
  defaultBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: "#dbeafe",
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "500",
  },
  emptyState: {
    padding: 24,
    alignItems: "center",
  },
  emptyStateText: {
    color: "#9ca3af",
    fontSize: 14,
  },
  bottomSpacing: {
    height: 40,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  modalBody: {
    padding: 16,
    maxHeight: "80%",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: "#f97316",
    marginLeft: 8,
  },
  cancelButtonText: {
    color: "#4b5563",
    fontWeight: "500",
  },
  saveButtonText: {
    color: "#ffffff",
    fontWeight: "500",
  },

  // Form styles
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4b5563",
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#111827",
  },
  addressTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  addressTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  addressTypeButtonActive: {
    backgroundColor: "#f97316",
    borderColor: "#f97316",
  },
  addressTypeText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#4b5563",
    fontWeight: "500",
  },
  addressTypeTextActive: {
    color: "#ffffff",
  },
  defaultCheckbox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#d1d5db",
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#4b5563",
  },
  manualSearchButton: {
    backgroundColor: "#f97316",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 8,
  },
  manualSearchButtonText: {
    color: "#ffffff",
    fontWeight: "500",
    fontSize: 14,
  },
})
