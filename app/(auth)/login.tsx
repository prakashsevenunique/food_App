import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, 
  KeyboardAvoidingView, Platform, ScrollView, Dimensions,
  Animated, ActivityIndicator, StatusBar
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import axiosInstance from '@/utils/axiosInstance';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const inputShakeAnim = useRef(new Animated.Value(0)).current;
  const headerHeightAnim = useRef(new Animated.Value(280)).current;
  
  // Food animation values
  const foodItem1Anim = useRef(new Animated.ValueXY({ x: -20, y: 50 })).current;
  const foodItem2Anim = useRef(new Animated.ValueXY({ x: width - 80, y: 120 })).current;
  const foodItem3Anim = useRef(new Animated.ValueXY({ x: width - 100, y: 200 })).current;
  const foodItem4Anim = useRef(new Animated.ValueXY({ x: 40, y: 180 })).current;
  const foodItem5Anim = useRef(new Animated.ValueXY({ x: width - 150, y: 80 })).current;
  
  // Rotation and scale animations
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const mainImageScaleAnim = useRef(new Animated.Value(1)).current;
  
  // Derived animated values
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  useEffect(() => {
    // Initial animations with sequence for better visual flow
    Animated.stagger(200, [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(mainImageScaleAnim, {
        toValue: 1.05,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Start floating animations for food items
    startFloatingAnimations();
    
    // Start slow rotation animation for main image
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Adjust header height when input is focused
  useEffect(() => {
    Animated.timing(headerHeightAnim, {
      toValue: inputFocused ? 280 : 320,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [inputFocused]);

  const startFloatingAnimations = () => {
    // Create floating effect for each food item with more natural movement
    const createFloatingAnimation = (animValue, rangeX, rangeY, duration) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: { 
              x: animValue.x._value + rangeX, 
              y: animValue.y._value - rangeY 
            },
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: { 
              x: animValue.x._value, 
              y: animValue.y._value 
            },
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      );
    };
    
    // Start all floating animations with different parameters for more natural movement
    Animated.parallel([
      createFloatingAnimation(foodItem1Anim, 15, 10, 3000),
      createFloatingAnimation(foodItem2Anim, -10, 15, 4000),
      createFloatingAnimation(foodItem3Anim, 20, 10, 3500),
      createFloatingAnimation(foodItem4Anim, -15, 20, 4500),
      createFloatingAnimation(foodItem5Anim, 10, 15, 5000),
    ]).start();
  };

  const shakeInput = () => {
    // Enhanced shake animation for better feedback
    Animated.sequence([
      Animated.timing(inputShakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(inputShakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(inputShakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(inputShakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(inputShakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleSendOtp = async () => {
    // Enhanced button press animation
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
    
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!mobile || mobile.length !== 10) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      shakeInput();
      return;
    }
    
    setLoading(true);
    try {
      const response = await axiosInstance.post('/api/users/send-otp', {
        mobileNumber: mobile
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push({
        pathname: '/otp-verification',
        params: { 
          mobile, 
          isNewUser: response.data?.existing ? "false" : "true" 
        }
      });
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="relative">
            <Animated.View 
              style={{ height: headerHeightAnim }}
              className="w-full overflow-hidden"
            >
              <LinearGradient
                colors={['#E23744', '#1e3a8a',"#ffffff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                className="w-full h-full rounded-b-[40]"
              >
                <Animated.View 
                  className="absolute top-[60] left-[50%] z-100" 
                  style={{ 
                    transform: [
                      { translateX: -100 },
                      { rotate },
                      { scale: mainImageScaleAnim }
                    ] 
                  }}
                >
                  <Image 
                    source={require('@/assets/img/food.png')}
                    style={{ width: 200, height: 200 }}
                    resizeMode="contain"
                  />
                </Animated.View>
              </LinearGradient>
            </Animated.View>
            
            {/* Floating food items */}
            <Animated.View style={[
              { position: 'absolute' },
              { transform: [...foodItem1Anim.getTranslateTransform()] }
            ]}>
              <Image 
                source={require('@/assets/img/food.png')} 
                style={{ width: 60, height: 60 }}
                resizeMode="contain"
              />
            </Animated.View>
            
            <Animated.View style={[
              { position: 'absolute', zIndex: 100 },
              { transform: [...foodItem2Anim.getTranslateTransform()] }
            ]}>
              <Image 
                source={require('@/assets/img/food.png')} 
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
            </Animated.View>
            
            <Animated.View style={[
              { position: 'absolute', zIndex: 100 },
              { transform: [...foodItem3Anim.getTranslateTransform()] }
            ]}>
              <Image 
                source={require('@/assets/img/food.png')} 
                style={{ width: 50, height: 50 }}
                resizeMode="contain"
              />
            </Animated.View>
            
            <Animated.View style={[
              { position: 'absolute', zIndex: 100 },
              { transform: [...foodItem4Anim.getTranslateTransform()] }
            ]}>
              <Image 
                source={require('@/assets/img/food.png')} 
                style={{ width: 45, height: 45 }}
                resizeMode="contain"
              />
            </Animated.View>
            
            <Animated.View style={[
              { position: 'absolute', zIndex: 100 },
              { transform: [...foodItem5Anim.getTranslateTransform()] }
            ]}>
              <Image 
                source={require('@/assets/img/food.png')} 
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
            </Animated.View>
          </View>
          
          {/* Login Form with enhanced animations */}
          <Animated.View 
            className="flex-1 px-6 pt-8 pb-8"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <View className="items-center mb-6">
              <Animated.View 
                style={{ 
                  transform: [{ scale: Animated.add(0.95, Animated.multiply(fadeAnim, 0.1)) }],
                  opacity: fadeAnim
                }}
              >
                <MaterialCommunityIcons name="food-fork-drink" size={40} color="#0a2463" />
              </Animated.View>
              <Animated.Text 
                className="text-[#0a2463] text-3xl font-bold text-center mt-2"
                style={{ 
                  opacity: fadeAnim,
                  transform: [{ translateY: Animated.multiply(slideAnim, 0.5) }]
                }}
              >
                FoodExpress
              </Animated.Text>
              
              <Animated.Text 
                className="text-gray-600 text-center mt-1 text-base"
                style={{ 
                  opacity: fadeAnim,
                  transform: [{ translateY: Animated.multiply(slideAnim, 0.7) }]
                }}
              >
                Delicious food at your doorstep
              </Animated.Text>
            </View>
            
            {/* Mobile Input with enhanced styling */}
            <Animated.View 
              className="mb-8"
              style={{ transform: [{ translateX: inputShakeAnim }] }}
            >
              <Text className="text-[#333] text-base font-medium mb-2">
                Mobile Number
              </Text>
              <View className="flex-row items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <View className="bg-gray-50 py-4 px-3 border-r border-gray-200">
                  <Text className="text-gray-700 font-medium">+91</Text>
                </View>
                <TextInput
                  className="flex-1 h-[52] px-4 text-[#333] text-lg"
                  placeholder="Enter 10-digit number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={mobile}
                  onChangeText={setMobile}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                />
                {mobile.length > 0 && (
                  <TouchableOpacity 
                    onPress={() => {
                      setMobile('');
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    className="pr-4"
                  >
                    <Ionicons name="close-circle" size={22} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
              <Text className="text-gray-500 text-xs mt-2 ml-1">
                We'll send you a verification code
              </Text>
            </Animated.View>
            
            {/* Login Button with enhanced styling and animations */}
            <Animated.View 
              style={{ 
                transform: [{ scale: buttonScaleAnim }],
                shadowColor: "#0a2463",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 6
              }}
            >
              <TouchableOpacity
                className="w-full h-[56] rounded-xl overflow-hidden"
                onPress={handleSendOtp}
                activeOpacity={0.9}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#E23744', '#1e3a8a']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="w-full h-full flex-row items-center justify-center"
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Text className="text-white text-lg font-semibold mr-2">Continue</Text>
                      <Ionicons name="arrow-forward-circle" size={22} color="white" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
            
            {/* Terms and conditions with enhanced styling */}
            <View className="mt-8 px-4">
              <Text className="text-gray-500 text-sm text-center leading-5">
                By continuing, you agree to our{' '}
                <Text 
                  className="text-[#0a2463] font-semibold"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/terms');
                  }}
                >
                  Terms of Service
                </Text>
                ,{' '}
                <Text 
                  className="text-[#0a2463] font-semibold"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/privacy');
                  }}
                >
                  Privacy Policy
                </Text>
                {' '}and{' '}
                <Text 
                  className="text-[#0a2463] font-semibold"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push('/content-policy');
                  }}
                >
                  Content Policy
                </Text>
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}