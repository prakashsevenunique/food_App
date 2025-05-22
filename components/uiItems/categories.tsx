import { useState, useEffect } from "react"
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import axiosInstance from "@/utils/axiosInstance"
import AllCategoriesModal from "./catModal"
import React from "react"

// Types for the component props
interface Category {
  _id: string
  id: string
  name: string
  image: string
}

interface FoodCategoriesProps {
  selectedCategory: string
  onCategoryPress: (categoryId: string) => void
  onCategoriesLoaded?: (categories: Category[]) => void
}

const COLORS = {
  primary: "#FF5A5F",
  textDark: "#3D4152",
}

const FoodCategories = ({ selectedCategory, onCategoryPress, onCategoriesLoaded }: FoodCategoriesProps) => {
  // State for categories
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAllCategories, setShowAllCategories] = useState(false)

  // Fetch categories from API
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await axiosInstance.get("api/categories")
      const data = response.data
      setCategories(data)
      if (onCategoriesLoaded) {
        onCategoriesLoaded(data)
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err)
      setError(err.message || "Failed to load categories")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCategoryPress = (categoryId: string) => {
    if (onCategoryPress) {
      onCategoryPress(categoryId)
    }
  }

  const handleSeeAllPress = () => {
    setShowAllCategories(true)
  }

  // Render loading state for categories
  if (isLoading) {
    return (
      <View className="items-center justify-center px-4 py-4">
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text className="mt-2 text-sm text-[#3D4152]">Loading categories...</Text>
      </View>
    )
  }

  // Render error state for categories
  if (error) {
    return (
      <View className="items-center justify-center px-4 py-4">
        <Ionicons name="alert-circle-outline" size={24} color={COLORS.primary} />
        <Text className="mt-2 text-sm text-[#3D4152]">Failed to load categories</Text>
        <TouchableOpacity className="mt-2 px-4 py-2 bg-[#FF5A5F] rounded-full" onPress={fetchCategories}>
          <Text className="text-white font-medium">Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // If no categories were loaded, show a message
  if (categories.length === 0) {
    return (
      <View className="items-center justify-center px-4 py-4">
        <Text className="text-sm text-[#3D4152]">No categories available</Text>
      </View>
    )
  }

  // Limit the number of categories shown in the horizontal scroll
  const visibleCategories = categories.slice(0, 8)
  const hasMoreCategories = categories.length > 8

  // Render categories
  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
        {visibleCategories.map((category) => (
          <TouchableOpacity
            key={category._id}
            className="items-center mr-5"
            onPress={() => handleCategoryPress(category._id)}
          >
            <View
              className={`w-16 h-16 rounded-full overflow-hidden border border-orange-100 ${
                selectedCategory === category._id ? "border-2 border-[#FF5A5F]" : ""
              }`}
            >
              <Image source={{ uri: category.image }} className="w-full h-full" />
            </View>
            <Text
              className={`mt-1 text-sm ${
                selectedCategory === category._id ? "font-bold text-[#FF5A5F]" : "text-[#3D4152]"
              }`}
            >
              {category.name}
            </Text>
            {selectedCategory === category._id && <View className="h-0.5 w-8 bg-[#FF5A5F] mt-1 rounded-full" />}
          </TouchableOpacity>
        ))}

        {/* See All button - now opens the modal */}
        <TouchableOpacity className="items-center mr-5" onPress={handleSeeAllPress}>
          <View className="w-16 h-16 rounded-full overflow-hidden bg-[#FFEAEB] items-center justify-center">
            <Ionicons
              name={hasMoreCategories ? "grid-outline" : "restaurant-outline"}
              size={24}
              color={COLORS.primary}
            />
          </View>
          <Text className="mt-1 text-sm text-[#3D4152]">See all</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* All Categories Modal */}
      <AllCategoriesModal
        visible={showAllCategories}
        onClose={() => setShowAllCategories(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryPress={handleCategoryPress}
      />
    </>
  )
}

export default FoodCategories
