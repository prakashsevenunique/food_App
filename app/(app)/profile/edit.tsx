"use client"

import { useContext, useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
  Modal,
} from "react-native"
import { router } from "expo-router"
import { Ionicons, Feather } from "@expo/vector-icons"
import { UserContext } from "@/hooks/userInfo"
import axiosInstance from "@/utils/axiosInstance"
import { useForm, Controller } from "react-hook-form"
import * as ImagePicker from "expo-image-picker"
import { imageBaseUrl } from "@/utils/helpingData"

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
  success: "#4CAF50", // Green for success messages
  error: "#EF4444", // Red for error messages
  verified: "#38bdf8", // Blue for verification
}

type FormData = {
  name: string
  email: string
  gender: string
}

export default function EditProfileScreen() {
  const { userInfo, setUserInfo, fetchUserInfo } = useContext(UserContext) as any
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [image, setImage] = useState<string | null>(userInfo?.profileImage || null)
  const [uploading, setUploading] = useState<boolean>(false)
  const [previewVisible, setPreviewVisible] = useState<boolean>(false)
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: userInfo?.name || "",
      email: userInfo?.email || "",
      gender: userInfo?.gender || "",
    },
  })

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission required", "We need access to your photos to upload a profile picture")
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      })

      if (!result.canceled) {
        setImage(result.assets[0].uri)
        await uploadImage(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Image picker error:", error)
      Alert.alert("Error", "Failed to pick image")
    }
  }

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission required", "We need access to your camera to take a profile picture")
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        exif: false,
      })

      if (!result.canceled) {
        const uri = result.assets[0].uri

        // Check file size
        const fileInfo = await getFileInfo(uri)
        if (fileInfo.size > 5 * 1024 * 1024) {
          // 5MB limit
          Alert.alert("File too large", "Please select an image smaller than 5MB")
          return
        }

        setSelectedImageUri(uri)
        setPreviewVisible(true)
      }
    } catch (error) {
      console.error("Camera error:", error)
      Alert.alert("Error", "Failed to take photo")
    }
  }

  const getFileInfo = async (fileUri: string) => {
    try {
      const fileInfo = await fetch(fileUri).then((response) => {
        return {
          size: Number.parseInt(response.headers.get("Content-Length") || "0"),
          type: response.headers.get("Content-Type"),
        }
      })
      return fileInfo
    } catch (error) {
      console.error("Error getting file info:", error)
      return { size: 0, type: "unknown" }
    }
  }

  const showImageOptions = () => {
    Alert.alert("Profile Picture", "Choose a source", [
      {
        text: "Take Photo",
        onPress: takePhoto,
      },
      {
        text: "Choose from Library",
        onPress: pickImage,
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ])
  }

  const confirmImage = async () => {
    if (selectedImageUri) {
      setImage(selectedImageUri)
      setPreviewVisible(false)
      await uploadImage(selectedImageUri)
    }
  }

  const uploadImage = async (uri: string) => {
    if (!userInfo?._id) {
      Alert.alert("Error", "User ID not found")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      const uriParts = uri.split("/")
      const fileName = uriParts[uriParts.length - 1]
      const fileType = fileName.split(".").pop() || "jpg"
      const mimeType = fileType === "jpg" || fileType === "jpeg" ? "image/jpeg" : `image/${fileType}`
      formData.append("profileImage", {
        uri: Platform.OS === "ios" ? uri.replace("file://", "") : uri,
        name: fileName || `profile_${Date.now()}.${fileType}`,
        type: mimeType,
      } as any)
      const response = await axiosInstance.post(`/api/user/user/${userInfo?._id}/profile-photo`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      })
      if (response.data) {
        fetchUserInfo()
        Alert.alert("Success", "Profile picture updated successfully")
      }
    } catch (error) {
      console.error("Upload error:", error)
      Alert.alert("Error", "Failed to upload profile picture")
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    if (!data.name.trim()) {
      Alert.alert("Error", "Please enter your name")
      return
    }

    if (!data.email.trim()) {
      Alert.alert("Error", "Please enter your email")
      return
    }

    if (!data.gender) {
      Alert.alert("Error", "Please select your gender")
      return
    }

    setIsLoading(true)
    try {
      const response = await axiosInstance.put(`/api/user/update-profile/${userInfo?._id}`, data)
      setUserInfo(response?.data?.user)
      Alert.alert("Success", "Profile updated successfully")
      router.back()
    } catch (error: any) {
      console.error("Update profile error:", error.message)
      Alert.alert("Error", "An error occurred while updating your profile")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.cardBg }}>
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
            <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 12, color: colors.text }}>Edit Profile</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={{ alignItems: "center", marginTop: 2 }}>
          <View style={{ position: "relative" }}>
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 56,
                borderWidth: 2,
                borderColor: colors.tertiaryLight,
                overflow: "hidden",
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Image
                source={{
                  uri: userInfo?.profilePhoto
                    ? `${imageBaseUrl}/${userInfo?.profilePhoto}`
                    : "https://static.vecteezy.com/system/resources/thumbnails/035/857/779/small/people-face-avatar-icon-cartoon-character-png.png",
                }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            </View>
            <TouchableOpacity
              onPress={showImageOptions}
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                backgroundColor: colors.primary,
                padding: 10,
                borderRadius: 20,
                borderWidth: 2,
                borderColor: colors.cardBg,
                shadowColor: colors.text,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Feather name="camera" size={16} color="white" />
              )}
            </TouchableOpacity>
          </View>
          <Text
            style={{
              marginTop: 12,
              color: colors.primary,
              fontSize: 18,
              fontWeight: "600",
            }}
          >
            {userInfo?.name || "Your Name"}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
            <Ionicons name="checkmark-circle" size={16} color={colors.verified} />
            <Text style={{ color: colors.textLight }}>{userInfo?.mobileNumber || "Mobile Number"}</Text>
          </View>
        </View>

        {/* Form Fields */}
        <View style={{ marginTop: 12 }}>
          {/* Name Input */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: colors.textLight, marginBottom: 4 }}>Full Name</Text>
            <Controller
              control={control}
              rules={{
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  style={{
                    borderWidth: 1,
                    borderColor: errors.name ? colors.error : colors.divider,
                    padding: 16,
                    borderRadius: 8,
                    color: colors.text,
                  }}
                  placeholder="Enter full name"
                  placeholderTextColor={colors.textLighter}
                />
              )}
              name="name"
            />
            {errors.name && (
              <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>{errors.name.message}</Text>
            )}
          </View>

          {/* Phone Number Input (disabled if verified) */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: colors.textLight, marginBottom: 4 }}>Phone Number</Text>
            <TextInput
              value={userInfo?.mobileNumber}
              style={{
                borderWidth: 1,
                borderColor: colors.divider,
                padding: 16,
                borderRadius: 8,
                backgroundColor: colors.background,
                color: colors.text,
              }}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              editable={false}
              placeholderTextColor={colors.textLighter}
            />
            {userInfo?.mobileNumber && (
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                <Text style={{ color: colors.success, fontSize: 12 }}>Verified </Text>
                <Ionicons name="checkmark-circle" size={12} color={colors.success} />
              </View>
            )}
          </View>

          {/* Email Input */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: colors.textLight, marginBottom: 4 }}>Email Address</Text>
            <Controller
              control={control}
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  style={{
                    borderWidth: 1,
                    borderColor: errors.email ? colors.error : colors.divider,
                    padding: 16,
                    borderRadius: 8,
                    color: colors.text,
                  }}
                  placeholder="Enter Email Address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={colors.textLighter}
                />
              )}
              name="email"
            />
            {errors.email && (
              <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>{errors.email.message}</Text>
            )}
          </View>

          {/* Gender Selection */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: colors.textLight, marginBottom: 4 }}>Gender</Text>
            <Controller
              control={control}
              rules={{ required: "Gender is required" }}
              render={({ field: { onChange, value } }) => (
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <TouchableOpacity
                    onPress={() => onChange("male")}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: value === "male" ? colors.primary : colors.divider,
                      backgroundColor: value === "male" ? colors.tertiaryLight : colors.cardBg,
                    }}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        color: value === "male" ? colors.primary : colors.textLight,
                        fontWeight: value === "male" ? "bold" : "normal",
                      }}
                    >
                      Male
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onChange("female")}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: value === "female" ? colors.primary : colors.divider,
                      backgroundColor: value === "female" ? colors.tertiaryLight : colors.cardBg,
                    }}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        color: value === "female" ? colors.primary : colors.textLight,
                        fontWeight: value === "female" ? "bold" : "normal",
                      }}
                    >
                      Female
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              name="gender"
            />
            {errors.gender && (
              <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>{errors.gender.message}</Text>
            )}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            style={{
              marginTop: 24,
              padding: 16,
              borderRadius: 8,
              alignItems: "center",
              backgroundColor: isLoading ? colors.primaryLight : colors.primary,
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ActivityIndicator size="small" color="white" />
                <Text style={{ color: "white", fontWeight: "600", marginLeft: 8 }}>Saving...</Text>
              </View>
            ) : (
              <Text style={{ color: "white", fontWeight: "600" }}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Image Preview Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={previewVisible}
        onRequestClose={() => setPreviewVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.7)",
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
          }}
        >
          <View
            style={{
              backgroundColor: colors.cardBg,
              borderRadius: 12,
              overflow: "hidden",
              width: "100%",
              maxWidth: 360,
            }}
          >
            <View
              style={{
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.divider,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.text }}>Preview Profile Picture</Text>
              <TouchableOpacity onPress={() => setPreviewVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textLight} />
              </TouchableOpacity>
            </View>

            <View style={{ alignItems: "center", justifyContent: "center", padding: 16 }}>
              {selectedImageUri && (
                <Image
                  source={{ uri: selectedImageUri }}
                  style={{ width: 256, height: 256, borderRadius: 128 }}
                  resizeMode="cover"
                />
              )}
            </View>

            <View style={{ padding: 16, flexDirection: "row" }}>
              <TouchableOpacity
                onPress={() => setPreviewVisible(false)}
                style={{
                  flex: 1,
                  marginRight: 8,
                  backgroundColor: colors.background,
                  padding: 12,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "600", color: colors.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmImage}
                style={{
                  flex: 1,
                  marginLeft: 8,
                  backgroundColor: colors.primary,
                  padding: 12,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "600", color: "white" }}>Use This Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}
