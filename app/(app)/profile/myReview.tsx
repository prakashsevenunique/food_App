"use client"

import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, FlatList, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { imageBaseUrl } from '@/utils/helpingData';
import axiosInstance from '@/utils/axiosInstance';
import { UserContext } from '@/hooks/userInfo';

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
}

export default function MyReviewsScreen() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {userInfo} = useContext(UserContext) as any;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axiosInstance.get(`/api/user/user-reviews/${userInfo?._id}`);
        if (response) {
          setReviews(response.data.reviews);
        }
      } catch (err) {
        setReviews([]);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [userInfo]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderStars = (rating) => {
    return (
      <View className="flex-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <MaterialCommunityIcons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={20}
            color={star <= rating ? '#FFD700' : colors.textLighter}
          />
        ))}
      </View>
    );
  };

  const renderReviewItem = ({ item }) => (
    <View className="bg-white p-4 rounded-lg mb-3" style={{ 
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2
    }}>
      <View className="flex-row">
        <Image
          source={{
            uri: item.salon.mainPhoto
              && `${imageBaseUrl}/${item.salon.mainPhoto}`
          }}
          defaultSource={require('@/assets/img/logo.png')}
          className="w-24 h-24 rounded-md mr-3"
        />
        <View className="flex-1">
          <Text className="font-semibold text-lg" style={{ color: colors.text }}>{item?.salon?.name}</Text>
          <Text className="text-sm" style={{ color: colors.textLight }}>{item?.salon?.address}</Text>
          {item.review.comment && (
            <Text className="mt-1" style={{ color: colors.text }}>{item?.review?.comment}</Text>
          )}
          <View className="mt-1">
            {renderStars(item.review.rating)}
          </View>
        </View>
      </View>
      <Text className="text-xs mt-1" style={{ color: colors.textLight }}>
        Reviewed on {formatDate(item?.review?.date)}
      </Text>
    </View>
  );

  if (error) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.background }}>
        <Text className="mb-2" style={{ color: colors.error || 'red' }}>Error loading reviews</Text>
        <Text style={{ color: colors.textLight }}>{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View className="px-4 py-4" style={{ 
        backgroundColor: colors.cardBg,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
      }}>
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons
                name="arrow-back"
                size={25}
                color={colors.primary}
              />
            </TouchableOpacity>
            <Text className="text-lg font-bold ml-3" style={{ color: colors.text }}>My Reviews</Text>
          </View>
        </View>
      </View>
      
      {loading ? (
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.background }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
          {reviews.length > 0 ? (
            <FlatList
              data={reviews}
              renderItem={renderReviewItem}
              keyExtractor={(item) => item.review.id}
              scrollEnabled={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View className="items-center justify-center py-10">
              <Feather name="file-text" size={40} color={colors.textLighter} />
              <Text className="mt-3" style={{ color: colors.textLight }}>No reviews yet</Text>
              <TouchableOpacity
                className="mt-4 px-6 py-2 rounded-full"
                style={{ backgroundColor: colors.primary }}
                onPress={() => router.push('/')}
              >
                <Text className="text-white font-medium">Book a Service</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
