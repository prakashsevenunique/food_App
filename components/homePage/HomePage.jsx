import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, Animated, TouchableOpacity, Dimensions,
  ScrollView, Image, TextInput, StatusBar, Modal, Platform,
  StyleSheet
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

// Food-friendly color palette
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

export default function Home() {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const lastScrollY = useRef(0);
  const headerHeight = Platform.OS === 'ios' ? 120 : 120;

  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  const imageTranslateY = scrollY.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [-100, 0, 0],
    extrapolate: 'clamp'
  });

  const gradientOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });


  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        if (currentScrollY <= 0) {
          showHeader();
        } else if (currentScrollY > lastScrollY.current) {
          hideHeader();
        } else if (currentScrollY < lastScrollY.current) {
          showHeader();
        }
        lastScrollY.current = currentScrollY;
      }
    }
  );

  const showHeader = () => {
    if (!isHeaderVisible) {
      setIsHeaderVisible(true);
      Animated.spring(headerTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10
      }).start();
    }
  };

  const hideHeader = () => {
    if (isHeaderVisible && lastScrollY.current > headerHeight) {
      setIsHeaderVisible(false);
      Animated.spring(headerTranslateY, {
        toValue: -headerHeight,
        useNativeDriver: true,
        tension: 100,
        friction: 12
      }).start();
    }
  };

  const triggerHaptic = (type = 'light') => {
    switch (type) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <View className="flex-1 bg-white">
      <StatusBar
        style={'auto'}
        backgroundColor={'#FF5A5F'}
        translucent={false}
      />
      <Animated.View
        style={[{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          transform: [{ translateY: headerTranslateY }],
        }, styles.headerShadow]}
      >
        <LinearGradient
          colors={['#FF5A5F', '#FF5A5F', 'rgba(167, 78, 78, 0.08)']}
          className="absolute top-0 left-0 right-0 h-32"
        />
        <View className="px-4 py-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => triggerHaptic('light')}>
              <Ionicons name="location" size={20} color="#fff" />
            </TouchableOpacity>
            <View className="ml-2">
              <Text className="text-white font-bold">Home</Text>
              <Text className="text-white text-xs opacity-80">123 Main Street</Text>
            </View>
          </View>
          <View className="flex-row">
            <TouchableOpacity className="mr-3" onPress={() => triggerHaptic('medium')}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-4 pt-2 pb-3">
          <TouchableOpacity
            className="bg-white rounded-full flex-row items-center px-4 py-3.5 shadow-lg"
            activeOpacity={0.9}
            onPress={() => {
              triggerHaptic('light');
            }}
          >
            <Ionicons name="search" size={20} color={COLORS.primary} />
            <Text className="ml-2 text-gray-500">Search for restaurants, cuisines...</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Main Scrollable Content */}
      <Animated.ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View className="relative h-[320px]">
          <Animated.Image
            source={{ uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80' }}
            className="absolute w-full h-full"
            style={{ transform: [{ translateY: imageTranslateY }] }}
          />
          <Animated.View
            style={{ opacity: gradientOpacity }}
            className="absolute inset-0"
          >
            <LinearGradient
              colors={['rgba(192, 57, 57, 0.97)', 'rgba(0,0,0,0.3)', 'rgba(145, 41, 41, 0.76)']}
              className="absolute inset-0"
            />
          </Animated.View>

          {/* Content on top of hero image */}
          <View className="absolute inset-0 justify-end px-4 pb-4 pt-16">
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }}
            >
              <Text className="text-white text-3xl font-bold mb-2">Hungry?</Text>
            </Animated.View>

            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }}
            >
              <Text className="text-white text-lg mb-4">Order food from favorite restaurants near you</Text>
            </Animated.View>
          </View>
        </View>

        {/* Popular Dishes */}
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          className="py-5 bg-white"
        >
          <View className="flex-row justify-between items-center px-4 mb-3">
            <Text className="text-lg font-bold text-gray-800">Popular Dishes Near You</Text>
            <TouchableOpacity onPress={() => triggerHaptic('light')}>
              <Text className="text-sm" style={{ color: COLORS.primary }}>See all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="pl-4"
          >
            <DishCard
              name="Butter Chicken"
              image="https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
              restaurant="Spice Paradise"
              price="$12.99"
              rating={4.8}
              delay={100}
              onPress={() => triggerHaptic('medium')}
            />
            <DishCard
              name="Margherita Pizza"
              image="https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
              restaurant="Pizza Heaven"
              price="$10.50"
              rating={4.5}
              delay={200}
              onPress={() => triggerHaptic('medium')}
            />
            <DishCard
              name="Beef Burger"
              image="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=999&q=80"
              restaurant="Burger Queen"
              price="$8.99"
              rating={4.3}
              delay={300}
              onPress={() => triggerHaptic('medium')}
            />
            <DishCard
              name="Sushi Platter"
              image="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
              restaurant="Sushi World"
              price="$22.99"
              rating={4.9}
              delay={400}
              onPress={() => triggerHaptic('medium')}
            />
          </ScrollView>
        </Animated.View>

        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          className="py-5 bg-white"
        >
          <View className="flex-row justify-between items-center px-4 mb-3">
            <Text className="text-lg font-bold text-gray-800">What's on your mind?</Text>
            <TouchableOpacity onPress={() => triggerHaptic('light')}>
              <Text className="text-sm" style={{ color: COLORS.primary }}>See all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="pl-4"
          >
            <FoodCategoryItem
              image="https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
              name="Pizza"
              delay={100}
              onPress={() => triggerHaptic('medium')}
            />
            <FoodCategoryItem
              image="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=999&q=80"
              name="Burger"
              delay={200}
              onPress={() => triggerHaptic('medium')}
            />
            <FoodCategoryItem
              image="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
              name="Sushi"
              delay={300}
              onPress={() => triggerHaptic('medium')}
            />
            <FoodCategoryItem
              image="https://images.unsplash.com/photo-1613844237701-8f3664fc2eff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1964&q=80"
              name="Biryani"
              delay={400}
              onPress={() => triggerHaptic('medium')}
            />
            <FoodCategoryItem
              image="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=781&q=80"
              name="Italian"
              delay={500}
              onPress={() => triggerHaptic('medium')}
            />
          </ScrollView>
        </Animated.View>

        {/* 
        <View className="px-4 py-5 bg-white">
          <View className="flex-row justify-between">
            <QuickActionButton 
              icon="fast-food-outline" 
              label="Order Food" 
              color={COLORS.primary} 
              bgColor="#FFF0F0" 
              delay={300}
              onPress={() => triggerHaptic('medium')}
            />
            <QuickActionButton 
              icon="restaurant-outline" 
              label="Dining" 
              color={COLORS.secondary} 
              bgColor="#FFF8E1" 
              delay={400}
              onPress={() => triggerHaptic('medium')}
            />
            <QuickActionButton 
              icon="bicycle-outline" 
              label="Delivery" 
              color={COLORS.tertiary} 
              bgColor="#E8F5E9" 
              delay={500}
              onPress={() => triggerHaptic('medium')}
            />
            <QuickActionButton 
              icon="gift-outline" 
              label="Offers" 
              color={COLORS.accent1} 
              bgColor="#F3E5F5" 
              delay={600}
              onPress={() => triggerHaptic('medium')}
            />
          </View>
        </View> */}

        {/* Filter Bar */}
        <View className="px-4 py-3 bg-white border-t border-b border-gray-100">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
          >
            <TouchableOpacity
              className="flex-row items-center bg-gray-100 px-3 py-2 mb-1 rounded-full mr-2"
              onPress={() => {
                triggerHaptic('light');
                setShowFilterModal(true);
              }}
            >
              <Ionicons name="options-outline" size={16} color="#333" />
              <Text className="ml-1 text-gray-800 font-medium">Filters</Text>
            </TouchableOpacity>

            <FilterPill label="Sort" icon="swap-vertical" onPress={() => triggerHaptic('light')} />
            <FilterPill label="Fast Delivery" onPress={() => triggerHaptic('light')} />
            <FilterPill label="Offers" onPress={() => triggerHaptic('light')} />
            <FilterPill label="Rating 4.0+" onPress={() => triggerHaptic('light')} />
            <FilterPill label="Pure Veg" onPress={() => triggerHaptic('light')} />
            <FilterPill label="Price" onPress={() => triggerHaptic('light')} />
          </ScrollView>
        </View>

        {/* Food Categories */}

        {/* Top Offers with Gradient Cards */}
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          className="py-5 bg-gray-50"
        >
          <View className="flex-row justify-between items-center px-4 mb-3">
            <Text className="text-lg font-bold text-gray-800">Best Offers For You</Text>
            <TouchableOpacity onPress={() => triggerHaptic('light')}>
              <Text className="text-sm" style={{ color: COLORS.primary }}>See all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="pl-4"
          >
            <GradientOfferCard
              image="https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80"
              title="50% OFF"
              description="On all beverages"
              colors={COLORS.gradient1}
              delay={100}
              onPress={() => triggerHaptic('success')}
            />
            <GradientOfferCard
              image="https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
              title="Free Delivery"
              description="On orders above $15"
              colors={COLORS.gradient2}
              delay={200}
              onPress={() => triggerHaptic('success')}
            />
            <GradientOfferCard
              image="https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80"
              title="Buy 1 Get 1"
              description="On selected items"
              colors={COLORS.gradient3}
              delay={300}
              onPress={() => triggerHaptic('success')}
            />
          </ScrollView>
        </Animated.View>



        {/* Popular Restaurants */}
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          className="py-5 bg-white"
        >
          <View className="px-4 mb-3">
            <Text className="text-lg font-bold text-gray-800">Popular Restaurants</Text>
            <Text className="text-xs text-gray-500 mt-1">Based on orders from people around you</Text>
          </View>

          <View className="px-4">
            <EnhancedRestaurantCard
              name="Spice Paradise"
              image="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
              rating={4.5}
              time="25-30 min"
              price="$$"
              cuisine="Indian, Chinese"
              distance="1.2 km"
              discount="50% OFF up to $10"
              promoted={true}
              delay={100}
              onPress={() => triggerHaptic('medium')}
            />

            <EnhancedRestaurantCard
              name="Burger Queen"
              image="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
              rating={4.2}
              time="15-20 min"
              price="$"
              cuisine="Fast Food, Burgers"
              distance="0.8 km"
              discount="Free delivery"
              delay={200}
              onPress={() => triggerHaptic('medium')}
            />

            <EnhancedRestaurantCard
              name="Pizza Heaven"
              image="https://images.unsplash.com/photo-1579027989536-b7b1f875659b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
              rating={4.7}
              time="30-35 min"
              price="$$$"
              cuisine="Italian, Pizza"
              distance="2.5 km"
              discount="20% OFF"
              promoted={true}
              delay={300}
              onPress={() => triggerHaptic('medium')}
            />

            <EnhancedRestaurantCard
              name="Sushi World"
              image="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
              rating={4.8}
              time="35-45 min"
              price="$$$"
              cuisine="Japanese, Sushi"
              distance="3.1 km"
              discount="Buy 1 Get 1"
              delay={400}
              onPress={() => triggerHaptic('medium')}
            />
          </View>
        </Animated.View>

        {/* Extra space at bottom for better scrolling */}
        <View className="h-20" />
      </Animated.ScrollView>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => {
          triggerHaptic('medium');
          setShowFilterModal(false);
        }}
        triggerHaptic={triggerHaptic}
      />
    </View>
  );
}

// Component for filter pills
const FilterPill = ({ label, icon, onPress }) => {
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
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }]
      }}
    >
      <TouchableOpacity
        className="flex-row items-center bg-gray-100 px-3 py-2 rounded-full mr-2"
        style={styles.filterPill}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
      >
        {icon && <Ionicons name={icon} size={16} color="#333" className="mr-1" />}
        <Text className="text-gray-800">{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Component for food category items
const FoodCategoryItem = ({ image, name, delay = 0, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
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
    <Animated.View
      style={{
        opacity: 1,
        transform: [{ scale: scaleAnim }]
      }}
    >
      <TouchableOpacity
        className="mr-5 items-center"
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
      >
        <View className="w-20 h-20 rounded-full overflow-hidden mb-1 shadow-lg" style={styles.categoryImage}>
          <Image
            source={{ uri: image }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        <Text className="text-xs text-gray-800 font-medium mt-1">{name}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Component for gradient offer cards
const GradientOfferCard = ({ image, title, description, colors, delay = 0, onPress }) => {
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
    <Animated.View
      style={{
        opacity: 1,
        transform: [{ scale: scaleAnim }]
      }}
    >
      <TouchableOpacity
        className="mr-4"
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View className="w-56 h-32 rounded-xl overflow-hidden shadow-lg" style={styles.offerCard}>
          <Image
            source={{ uri: image }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <LinearGradient
            colors={colors || ['#FF416C', '#FF4B2B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="absolute inset-0 opacity-80"
          />
          <View className="absolute inset-0 p-4 justify-end">
            <Text className="text-white font-bold text-xl">{title}</Text>
            <Text className="text-white text-sm">{description}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const DishCard = ({ name, image, restaurant, price, rating, delay = 0, onPress }) => {
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
        style={[styles.dishCard, { width: 120 }]}
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

const EnhancedRestaurantCard = ({ name, image, rating, time, price, cuisine, distance, discount, promoted, delay = 0, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isFavorite, setIsFavorite] = useState(false);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
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
    <Animated.View
      style={{
        opacity: 1,
        transform: [{ scale: scaleAnim }]
      }}
    >
      <TouchableOpacity
        className="mb-6 bg-white rounded-2xl overflow-hidden shadow-md"
        style={styles.restaurantCard}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View className="relative">
          {/* Image with gradient overlay for better text contrast */}
          <Image
            source={{ uri: image }}
            className="w-full h-52" // Slightly taller for better visual impact
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60 }}
          />

          {/* Top right badges - properly spaced */}
          <View className="absolute top-3 right-3 flex-row space-x-2">
            {/* Favorite Button */}
            <TouchableOpacity
              className="bg-white/90 w-8 h-8 rounded-full items-center justify-center"
              onPress={() => {
                setIsFavorite(!isFavorite);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={16} 
                color={isFavorite ? "#E23744" : "#666"} 
              />
            </TouchableOpacity>
            
            {/* Time Badge - Now properly positioned */}
            <View className="bg-white/90 px-3 py-1.5 rounded-full flex-row items-center">
              <Ionicons name="time-outline" size={12} color="#333" style={{ marginRight: 3 }} />
              <Text className="text-xs font-bold text-gray-800">{time}</Text>
            </View>
          </View>

          {/* Promoted Badge - Enhanced */}
          {promoted && (
            <View className="absolute top-3 left-3 bg-gray-800/90 px-3 py-1.5 rounded-full flex-row items-center">
              <Ionicons name="flash" size={12} color="#fff" style={{ marginRight: 3 }} />
              <Text className="text-xs font-bold text-white">PROMOTED</Text>
            </View>
          )}

          {/* Discount Banner - Enhanced */}
          {discount && (
            <LinearGradient
              colors={COLORS.gradient1}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="absolute bottom-0 left-0 right-0 px-4 py-2 flex-row items-center"
            >
              <Ionicons name="pricetag" size={14} color="#fff" style={{ marginRight: 4 }} />
              <Text className="text-white text-sm font-medium">{discount}</Text>
            </LinearGradient>
          )}
        </View>

        <View className="p-4">
          {/* Restaurant Name and Rating */}
          <View className="flex-row justify-between items-start">
            <Text className="text-lg font-bold text-gray-800" numberOfLines={1} style={{ maxWidth: '80%' }}>
              {name}
            </Text>
            <View className="flex-row items-center bg-green-600 px-2 py-1 rounded-full">
              <Text className="text-xs font-bold text-white mr-1">{rating}</Text>
              <Ionicons name="star" size={12} color="#fff" />
            </View>
          </View>

          {/* Cuisine and Price */}
          <View className="flex-row items-center mt-2">
            <Text className="text-sm text-gray-500">{cuisine}</Text>
            <View className="w-1.5 h-1.5 bg-gray-400 rounded-full mx-2" />
            <Text className="text-sm text-gray-500">{price}</Text>
          </View>

          {/* Distance and View Menu Button */}
          <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={14} color="#666" style={{ marginRight: 4 }} />
              <Text className="text-sm text-gray-600 font-medium">{distance}</Text>
            </View>
            
            <TouchableOpacity
              className="px-3 py-2 rounded-full flex-row items-center"
              style={{ backgroundColor: '#F5F5F5' }}
              onPress={(e) => {
                e.stopPropagation();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onPress();
              }}
            >
              <Text className="text-sm font-bold mr-1" style={{ color: COLORS.primary }}>VIEW MENU</Text>
              <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Filter Modal Component
const FilterModal = ({ visible, onClose, triggerHaptic }) => {
  const [selectedSortOption, setSelectedSortOption] = useState('relevance');
  const [selectedFilters, setSelectedFilters] = useState({
    offers: false,
    freeDelivery: false,
    veg: false,
    nonVeg: false,
  });

  const toggleFilter = (filter) => {
    triggerHaptic('light');
    setSelectedFilters({
      ...selectedFilters,
      [filter]: !selectedFilters[filter]
    });
  };

  const handleSortOptionChange = (option) => {
    triggerHaptic('light');
    setSelectedSortOption(option);
  };

  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 70,
        friction: 12
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        useNativeDriver: true,
        duration: 200
      }).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black bg-opacity-50 justify-end">
        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
        >
          <View className="px-5 pt-4 pb-2 border-b border-gray-200">
            <View className="flex-row justify-between items-center">
              <Text className="text-xl font-bold text-gray-800">Filter</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="max-h-[70%]">
            {/* Sort Section */}
            <View className="px-5 py-4 border-b border-gray-200">
              <Text className="text-lg font-bold text-gray-800 mb-3">Sort</Text>

              <TouchableOpacity
                className="flex-row items-center py-2"
                onPress={() => handleSortOptionChange('relevance')}
              >
                <View className={`w-5 h-5 rounded-full border ${selectedSortOption === 'relevance' ? 'border-[#FF5A5F] bg-[#FF5A5F]' : 'border-gray-400'} mr-3 items-center justify-center`}>
                  {selectedSortOption === 'relevance' && <View className="w-2 h-2 bg-white rounded-full" />}
                </View>
                <Text className="text-gray-800">Relevance (Default)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center py-2"
                onPress={() => handleSortOptionChange('rating')}
              >
                <View className={`w-5 h-5 rounded-full border ${selectedSortOption === 'rating' ? 'border-[#FF5A5F] bg-[#FF5A5F]' : 'border-gray-400'} mr-3 items-center justify-center`}>
                  {selectedSortOption === 'rating' && <View className="w-2 h-2 bg-white rounded-full" />}
                </View>
                <Text className="text-gray-800">Rating (High to Low)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center py-2"
                onPress={() => handleSortOptionChange('deliveryTime')}
              >
                <View className={`w-5 h-5 rounded-full border ${selectedSortOption === 'deliveryTime' ? 'border-[#FF5A5F] bg-[#FF5A5F]' : 'border-gray-400'} mr-3 items-center justify-center`}>
                  {selectedSortOption === 'deliveryTime' && <View className="w-2 h-2 bg-white rounded-full" />}
                </View>
                <Text className="text-gray-800">Delivery Time</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center py-2"
                onPress={() => handleSortOptionChange('costLow')}
              >
                <View className={`w-5 h-5 rounded-full border ${selectedSortOption === 'costLow' ? 'border-[#FF5A5F] bg-[#FF5A5F]' : 'border-gray-400'} mr-3 items-center justify-center`}>
                  {selectedSortOption === 'costLow' && <View className="w-2 h-2 bg-white rounded-full" />}
                </View>
                <Text className="text-gray-800">Cost (Low to High)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center py-2"
                onPress={() => handleSortOptionChange('costHigh')}
              >
                <View className={`w-5 h-5 rounded-full border ${selectedSortOption === 'costHigh' ? 'border-[#FF5A5F] bg-[#FF5A5F]' : 'border-gray-400'} mr-3 items-center justify-center`}>
                  {selectedSortOption === 'costHigh' && <View className="w-2 h-2 bg-white rounded-full" />}
                </View>
                <Text className="text-gray-800">Cost (High to Low)</Text>
              </TouchableOpacity>
            </View>

            {/* Filter Options */}
            <View className="px-5 py-4">
              <Text className="text-lg font-bold text-gray-800 mb-3">Filter</Text>

              <TouchableOpacity
                className="flex-row items-center justify-between py-3 border-b border-gray-100"
                onPress={() => toggleFilter('offers')}
              >
                <View className="flex-row items-center">
                  <Ionicons name="pricetag-outline" size={20} color="#333" className="mr-3" />
                  <Text className="text-gray-800">Offers & Deals</Text>
                </View>
                <View className={`w-6 h-6 rounded ${selectedFilters.offers ? 'bg-[#FF5A5F]' : 'bg-gray-200'} items-center justify-center`}>
                  {selectedFilters.offers && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center justify-between py-3 border-b border-gray-100"
                onPress={() => toggleFilter('freeDelivery')}
              >
                <View className="flex-row items-center">
                  <Ionicons name="bicycle-outline" size={20} color="#333" className="mr-3" />
                  <Text className="text-gray-800">Free Delivery</Text>
                </View>
                <View className={`w-6 h-6 rounded ${selectedFilters.freeDelivery ? 'bg-[#FF5A5F]' : 'bg-gray-200'} items-center justify-center`}>
                  {selectedFilters.freeDelivery && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center justify-between py-3 border-b border-gray-100"
                onPress={() => toggleFilter('veg')}
              >
                <View className="flex-row items-center">
                  <View className="w-5 h-5 border-2 border-green-600 mr-3 items-center justify-center">
                    <View className="w-2 h-2 bg-green-600 rounded-full" />
                  </View>
                  <Text className="text-gray-800">Pure Veg</Text>
                </View>
                <View className={`w-6 h-6 rounded ${selectedFilters.veg ? 'bg-[#FF5A5F]' : 'bg-gray-200'} items-center justify-center`}>
                  {selectedFilters.veg && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center justify-between py-3 border-b border-gray-100"
                onPress={() => toggleFilter('nonVeg')}
              >
                <View className="flex-row items-center">
                  <View className="w-5 h-5 border-2 border-red-600 mr-3 items-center justify-center">
                    <View className="w-2 h-2 bg-red-600 rounded-full" />
                  </View>
                  <Text className="text-gray-800">Non-Veg</Text>
                </View>
                <View className={`w-6 h-6 rounded ${selectedFilters.nonVeg ? 'bg-[#FF5A5F]' : 'bg-gray-200'} items-center justify-center`}>
                  {selectedFilters.nonVeg && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
              </TouchableOpacity>
            </View>

            {/* Cuisines Section */}
            <View className="px-5 py-4 border-t border-gray-200">
              <Text className="text-lg font-bold text-gray-800 mb-3">Cuisines</Text>

              <View className="flex-row flex-wrap">
                <CuisineTag label="Italian" onPress={() => triggerHaptic('light')} />
                <CuisineTag label="Chinese" onPress={() => triggerHaptic('light')} />
                <CuisineTag label="Indian" onPress={() => triggerHaptic('light')} />
                <CuisineTag label="Mexican" onPress={() => triggerHaptic('light')} />
                <CuisineTag label="Thai" onPress={() => triggerHaptic('light')} />
                <CuisineTag label="Japanese" onPress={() => triggerHaptic('light')} />
                <CuisineTag label="American" onPress={() => triggerHaptic('light')} />
                <CuisineTag label="Desserts" onPress={() => triggerHaptic('light')} />
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View className="px-5 py-4 flex-row border-t border-gray-200">
            <TouchableOpacity
              className="flex-1 py-3 border border-gray-300 rounded-lg mr-2 items-center"
              onPress={() => {
                triggerHaptic('medium');
                onClose();
              }}
            >
              <Text className="font-semibold text-gray-800">CLEAR ALL</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 py-3 rounded-lg ml-2 items-center"
              style={{ backgroundColor: COLORS.primary }}
              onPress={() => {
                triggerHaptic('success');
                onClose();
              }}
            >
              <Text className="font-semibold text-white">APPLY</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Cuisine tag component
const CuisineTag = ({ label, onPress }) => {
  const [selected, setSelected] = useState(false);
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
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }]
      }}
    >
      <TouchableOpacity
        className={`m-1 px-3 py-1.5 rounded-full border ${selected ? 'border-[#FF5A5F]' : 'border-gray-300'}`}
        style={selected ? { backgroundColor: '#FF5A5F', borderColor: '#FF5A5F' } : {}}
        onPress={() => {
          setSelected(!selected);
          onPress();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
      >
        <Text className={`text-sm ${selected ? 'text-white' : 'text-gray-800'}`}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Styles
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