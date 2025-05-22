import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { useRef } from "react";
import { Animated, TouchableOpacity ,Image,View,Text, StyleSheet} from "react-native";

const COLORS = {
  primary: '#FF5A5F',
  secondary: '#FFB74D',
  tertiary: '#4CAF50',
  accent1: '#8E24AA',
  accent2: '#1E88E5',
  dark: '#263238',
  light: '#FFFFFF',
  background: '#F9F9F9',
  card: '#FFFFFF',
  text: '#263238',
  textLight: '#78909C',
  success: '#66BB6A',
  error: '#EF5350',
  gradient1: ['#FF5A5F', '#FF8A65'],
  gradient2: ['#FFB74D', '#FFA000'],
  gradient3: ['#4CAF50', '#2E7D32'],
  gradient4: ['#8E24AA', '#6A1B9A'],
  gradient5: ['#1E88E5', '#1565C0'],
  statusBarGradient: ['#FF5A5F', '#FF8A65', '#FF5A5F'],
};

export default function DishCard({ name, image, restaurant, price, rating, delay = 0, onPress }:any){
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
      tension: 40,
    }).start();
  };

  return (
    <Animated.View className='my-1'
      style={{
        opacity: 1,
        transform: [{ scale: scaleAnim }]
      }}
    >
      <TouchableOpacity
        className="mr-2 bg-white rounded-2xl overflow-hidden"
        style={[styles.dishCard, { width: 140 }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View className="relative">
          <Image
            source={{ uri: image }}
            className="w-full h-28"
            resizeMode="cover"
          />

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            className="absolute bottom-0 left-0 right-0 h-24"
          />

          <View className="absolute bottom-3 left-3 right-3">
            <Text className="text-white text-xs font-medium opacity-90" numberOfLines={1}>{restaurant}</Text>
          </View>

          <View className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full shadow-md flex-row items-center">
            <Ionicons name="star" size={12} color="#FFB74D" />
            <Text className="text-xs font-bold text-gray-800 ml-1">{rating}</Text>
          </View>

          {Math.random() > 0.5 && (
            <View className="absolute top-3 left-3 bg-red-500 px-2 py-1 rounded-lg">
              <Text className="text-white text-xs font-bold">20% OFF</Text>
            </View>
          )}
        </View>

        <View className="p-3 py-1">
          <Text className="text-base font-bold text-gray-800" numberOfLines={1}>{name}</Text>

          <View className="flex-row justify-between items-center mt-1">
            <View className="bg-red-50 px-2 py-1 rounded-lg">
              <Text className="text-sm font-bold text-red-500">{price}</Text>
            </View>

            <TouchableOpacity
              className="w-8 h-8 rounded-full items-center justify-center shadow-sm"
              style={{
                backgroundColor: COLORS.primary,
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
                elevation: 4
              }}
              onPress={(e) => {
                e.stopPropagation();
                onPress();
              }}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  headerShadow: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  filterPill: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  categoryImage: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderWidth: 2,
    borderColor: '#fff',
  },
  offerCard: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  dishCard: {
    width: 160,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  restaurantCard: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  }
});