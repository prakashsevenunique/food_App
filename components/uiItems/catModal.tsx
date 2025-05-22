import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import React from "react"

const { width } = Dimensions.get("window")
const numColumns = 4
const tileSize = width / numColumns - 16 // Account for padding

interface Category {
  _id: string
  id: string
  name: string
  image: string
}

interface AllCategoriesModalProps {
  visible: boolean
  onClose: () => void
  categories: Category[]
  selectedCategory: string
  onCategoryPress: (categoryId: string) => void
}

const COLORS = {
  primary: "#FF5A5F",
  textDark: "#3D4152",
  background: "#FFFFFF",
  border: "#E8E8E8",
}

const AllCategoriesModal = ({
  visible,
  onClose,
  categories,
  selectedCategory,
  onCategoryPress,
}: AllCategoriesModalProps) => {
  const handleCategorySelect = (categoryId: string) => {
    onCategoryPress(categoryId)
    onClose()
  }

  const renderCategoryItem = ({ item }: { item: Category }) => {
    const isSelected = selectedCategory === item._id

    return (
      <TouchableOpacity style={styles.categoryTile} onPress={() => handleCategorySelect(item._id)} activeOpacity={0.7}>
        <View style={[styles.imageContainer, isSelected ? { borderColor: COLORS.primary, borderWidth: 2 } : null]}>
          <Image source={{ uri: item.image }} style={styles.categoryImage} />
        </View>
        <Text
          style={[styles.categoryName, isSelected ? { color: COLORS.primary, fontWeight: "bold" } : null]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {item.name}
        </Text>
        {isSelected && <View style={styles.selectedIndicator} />}
      </TouchableOpacity>
    )
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Categories</Text>
          <View style={{ width: 24 }} />
        </View>

        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item._id}
          numColumns={numColumns}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <TouchableOpacity
              style={styles.categoryTile}
              onPress={() => handleCategorySelect("all")}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.imageContainer,
                  { backgroundColor: "#FFEAEB" },
                  selectedCategory === "all" ? { borderColor: COLORS.primary, borderWidth: 2 } : null,
                ]}
              >
                <Ionicons name="restaurant-outline" size={32} color={COLORS.primary} />
              </View>
              <Text
                style={[
                  styles.categoryName,
                  selectedCategory === "all" ? { color: COLORS.primary, fontWeight: "bold" } : null,
                ]}
              >
                All Restaurants
              </Text>
              {selectedCategory === "all" && <View style={styles.selectedIndicator} />}
            </TouchableOpacity>
          }
        />
      </SafeAreaView>
    </Modal>
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textDark,
  },
  gridContainer: {
    padding: 12,
    paddingBottom: 40,
  },
  categoryTile: {
    width: tileSize,
    margin: 6,
    alignItems: "center",
  },
  imageContainer: {
    width: tileSize - 12,
    height: tileSize - 12,
    borderRadius: (tileSize - 12) / 2,
    overflow: "hidden",
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  categoryName: {
    marginTop: 6,
    fontSize: 12,
    color: COLORS.textDark,
    textAlign: "center",
    maxWidth: tileSize,
  },
  selectedIndicator: {
    height: 3,
    width: 24,
    backgroundColor: COLORS.primary,
    marginTop: 4,
    borderRadius: 2,
  },
})

export default AllCategoriesModal
