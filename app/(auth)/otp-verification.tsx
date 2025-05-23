import React, { useState, useRef, useEffect, useContext } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, Image,
    KeyboardAvoidingView, Platform, ScrollView, Dimensions,
    Animated, ActivityIndicator, StatusBar
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import axiosInstance from '@/utils/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '@/hooks/userInfo';

const { width, height } = Dimensions.get('window');

const COLORS = {
    primary: '#E23744', // Zomato red
    secondary: '#FC8019', // Swiggy orange
    accent: '#60B246', // Swiggy green
    dark: '#282C3F', // Swiggy dark
    light: '#FFFFFF',
    lightGray: '#F8F8F8',
    gray: '#EEEEEE',
    textDark: '#3D4152',
    textLight: '#686B78',
};

export default function OtpVerificationScreen() {
    const params = useLocalSearchParams();
    const mobile = params.mobile as string;
    const isNewUser = params.isNewUser;
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(30);
    const [apiError, setError] = useState(null)
    const [canResend, setCanResend] = useState(false);
    const [currentFocusedInput, setCurrentFocusedInput] = useState<number | null>(null);

    const { token, setToken } = useContext(UserContext) as any;


    const inputRefs = useRef<Array<TextInput | null>>([]);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const buttonScaleAnim = useRef(new Animated.Value(1)).current;
    const otpShakeAnim = useRef(new Animated.Value(0)).current;
    const foodRotateAnim = useRef(new Animated.Value(0)).current;
    const foodScaleAnim = useRef(new Animated.Value(1)).current;
    const timerProgressAnim = useRef(new Animated.Value(1)).current;
    const foodItem1Anim = useRef(new Animated.ValueXY({ x: width * 0.1, y: height * 0.1 })).current;
    const foodItem2Anim = useRef(new Animated.ValueXY({ x: width * 0.8, y: height * 0.15 })).current;
    const foodItem3Anim = useRef(new Animated.ValueXY({ x: width * 0.2, y: height * 0.3 })).current;

    useEffect(() => {
        Animated.stagger(200, [
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
        startFoodAnimations();
        startTimer();
        setTimeout(() => {
            inputRefs.current[0]?.focus();
        }, 500);
    }, []);

    const startTimer = () => {
        Animated.timing(timerProgressAnim, {
            toValue: 0,
            duration: 30000, // 30 seconds
            useNativeDriver: false,
        }).start();

        const interval = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer <= 1) {
                    clearInterval(interval);
                    setCanResend(true);
                    return 0;
                }
                return prevTimer - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    };

    const startFoodAnimations = () => {
        Animated.loop(
            Animated.timing(foodRotateAnim, {
                toValue: 1,
                duration: 15000,
                useNativeDriver: true,
            })
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(foodScaleAnim, {
                    toValue: 1.1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(foodScaleAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();

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

        Animated.parallel([
            createFloatingAnimation(foodItem1Anim, 20, 15, 3000),
            createFloatingAnimation(foodItem2Anim, -15, 20, 4000),
            createFloatingAnimation(foodItem3Anim, 10, 25, 3500),
        ]).start();
    };

    const handleOtpChange = (text: string, index: number) => {
        if (text && !/^\d+$/.test(text)) return;
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        if (text && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const shakeOtpInputs = () => {
        Animated.sequence([
            Animated.timing(otpShakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(otpShakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(otpShakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(otpShakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(otpShakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    };

    const handleVerifyOtp = async () => {
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

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            shakeOtpInputs();
            return;
        }
        setLoading(true);
        try {
            const response = await axiosInstance.post('/api/users/verify-otp', {
                mobileNumber: mobile,
                otp: otpCode
            });
            await AsyncStorage.setItem('userData', JSON.stringify(response.data?.data?.token));
            setToken(response.data?.data?.token);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (isNewUser == "true") {
                router.push({
                    pathname: '/user-details',
                    params: { mobile }
                });
            } else {
                router.replace('/(app)/(tabs)');
            }
        } catch (error) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            shakeOtpInputs();
            setError(error?.response?.data?.message || "Network Error")
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!canResend) return;

        setCanResend(false);
        setTimer(30);

        timerProgressAnim.setValue(1);
        Animated.timing(timerProgressAnim, {
            toValue: 0,
            duration: 30000,
            useNativeDriver: false,
        }).start();

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            await axiosInstance.post('/api/users/send-otp', {
                mobileNumber: mobile
            });

            const interval = setInterval(() => {
                setTimer((prevTimer) => {
                    if (prevTimer <= 1) {
                        clearInterval(interval);
                        setCanResend(true);
                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000);
        } catch (error) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setCanResend(true);
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
                    <LinearGradient
                        colors={['#E23744', '#1e3a8a',"#ffffff"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        className="pt-16 pb-20 px-6"
                    >
                        <TouchableOpacity
                            className="absolute top-10 left-4 z-20 bg-white/20 p-2 rounded-full"
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                router.back();
                            }}
                        >
                            <Ionicons name="chevron-back" size={24} color="white" />
                        </TouchableOpacity>

                        <View className="mt-8">
                            <Text className="text-white text-2xl font-bold">Verify Your Number</Text>
                            <Text className="text-white/90 text-base mt-2">
                                We've sent a verification code to
                            </Text>
                            <Text className="text-white font-bold text-lg mt-1">
                                +91 {mobile}
                            </Text>
                        </View>
                    </LinearGradient>

                    {/* Floating food items */}
                    <View className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
                        <Animated.View style={[
                            { position: 'absolute', zIndex: 5 },
                            { transform: [...foodItem1Anim.getTranslateTransform()] }
                        ]}>
                            <Image
                                source={require('@/assets/img/food.png')}
                                style={{ width: 50, height: 50 }}
                                resizeMode="contain"
                            />
                        </Animated.View>

                        <Animated.View style={[
                            { position: 'absolute', zIndex: 5 },
                            { transform: [...foodItem2Anim.getTranslateTransform()] }
                        ]}>
                            <Image
                                source={require('@/assets/img/food.png')}
                                style={{ width: 40, height: 40 }}
                                resizeMode="contain"
                            />
                        </Animated.View>

                        <Animated.View style={[
                            { position: 'absolute', zIndex: 5 },
                            { transform: [...foodItem3Anim.getTranslateTransform()] }
                        ]}>
                            <Image
                                source={require('@/assets/img/food.png')}
                                style={{ width: 45, height: 45 }}
                                resizeMode="contain"
                            />
                        </Animated.View>
                    </View>

                    <View className="flex-1 px-6">
                        <View className="items-center justify-center mb-8">
                            <Animated.View
                                style={{
                                    transform: [
                                        { scale: foodScaleAnim }
                                    ]
                                }}
                            >
                                <View className="w-24 h-24 bg-white rounded-full items-center justify-center shadow-md">
                                    <Image
                                        source={require('@/assets/img/food.png')}
                                        style={{ width: 70, height: 70 }}
                                        resizeMode="contain"
                                    />
                                </View>
                            </Animated.View>
                        </View>

                        {/* OTP Input */}
                        <Animated.View
                            style={{
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }]
                            }}
                        >
                            <Text className="text-center text-[#3D4152] text-base font-medium mb-6">
                                Enter the 6-digit verification code
                            </Text>

                            <Animated.View
                                className="flex-row justify-between mb-8"
                                style={{ transform: [{ translateX: otpShakeAnim }] }}
                            >
                                {[0, 1, 2, 3, 4, 5].map((index) => (
                                    <View key={index} className="w-[45] h-[55]">
                                        <TextInput
                                            ref={(ref) => (inputRefs.current[index] = ref)}
                                            className={`w-full h-full bg-[${COLORS.lightGray}] border-b-2 ${currentFocusedInput === index
                                                ? `border-[${COLORS.primary}]`
                                                : otp[index]
                                                    ? `border-[${COLORS.secondary}]`
                                                    : 'border-gray-300'
                                                } rounded-lg text-center text-xl font-bold text-[${COLORS.dark}]`}
                                            maxLength={1}
                                            keyboardType="number-pad"
                                            value={otp[index]}
                                            onChangeText={(text) => handleOtpChange(text, index)}
                                            onKeyPress={(e) => handleKeyPress(e, index)}
                                            onFocus={() => setCurrentFocusedInput(index)}
                                            onBlur={() => setCurrentFocusedInput(null)}
                                        />
                                    </View>
                                ))}
                            </Animated.View>

                            {apiError && <View className="mb-3">
                                <View className="flex-row">
                                    <Text className="text-[red] ml-2">
                                        {apiError}
                                    </Text>
                                </View>
                            </View>
                            }

                            <View className="items-center mb-8">
                                <View className="flex-row items-center justify-center mt-4">
                                    <FontAwesome5 name="clock" size={16} color={COLORS.textLight} />
                                    <Text className="text-[#686B78] ml-2">
                                        {canResend ? 'Ready to resend' : `Resend code in ${timer}s`}
                                    </Text>
                                </View>
                            </View>

                            <Animated.View className='rounded-xl overflow-hidden' style={{ transform: [{ scale: buttonScaleAnim }] }}>
                                <TouchableOpacity
                                    onPress={handleVerifyOtp}
                                    activeOpacity={0.9}
                                    disabled={loading}
                                    className="w-full rounded-lg"
                                >
                                    <LinearGradient
                                        colors={[COLORS.primary, COLORS.secondary]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        className="h-[52] rounded-lg flex-row items-center justify-center shadow-md"
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="white" size="small" />
                                        ) : (
                                            <>
                                                <Text className="text-white text-lg font-semibold mr-2">Verify & Proceed</Text>
                                                <Ionicons name="shield-checkmark" size={20} color="white" />
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </Animated.View>

                            {/* Resend OTP */}
                            <View className="mt-8 items-center">
                                <Text className="text-[#686B78] text-base mb-2">
                                    Didn't receive the code?
                                </Text>

                                <TouchableOpacity
                                    onPress={handleResendOtp}
                                    disabled={!canResend}
                                    className={`py-2 px-6 rounded-full ${canResend ? 'bg-[#F0F0F0]' : 'opacity-50'}`}
                                >
                                    <Text className={`font-bold text-base ${canResend ? `text-[${COLORS.primary}]` : 'text-gray-400'}`}>
                                        Resend Code
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}