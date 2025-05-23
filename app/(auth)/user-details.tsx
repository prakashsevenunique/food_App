import React, { useState, useRef, useEffect, useContext } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, Image,
    KeyboardAvoidingView, Platform, ScrollView, Dimensions,
    Animated, ActivityIndicator, StatusBar, Switch
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import axiosInstance from '@/utils/axiosInstance';
import { UserContext } from '@/hooks/userInfo';
import { imageBaseUrl } from '@/utils/helpingData';

const { width, height } = Dimensions.get('window');

// Zomato and Swiggy inspired colors
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
    inputBg: '#F5F5F6',
    border: '#D4D5D9',
};

export default function UserDetailsScreen() {
    const params = useLocalSearchParams();
    const mobile = params.mobile as string;
    const isNewUser = params.isNewUser == 'true';
    const { token } = useContext(UserContext) as any;
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [focusedInput, setFocusedInput] = useState<string | null>(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const buttonScaleAnim = useRef(new Animated.Value(1)).current;
    const profileImageScaleAnim = useRef(new Animated.Value(1)).current;
    const successAnim = useRef(new Animated.Value(0)).current;

    const foodItem1Anim = useRef(new Animated.ValueXY({ x: width * 0.85, y: height * 0.2 })).current;
    const foodItem2Anim = useRef(new Animated.ValueXY({ x: width * 0.1, y: height * 0.5 })).current;

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

        if (!isNewUser) {
            loadUserData();
        }
    }, []);

    useEffect(() => {
        if (saveSuccess) {
            const timer = setTimeout(() => {
                setSaveSuccess(false);
                successAnim.setValue(0);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [saveSuccess]);

    const loadUserData = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/api/users/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            if (response.data) {
                setName(response.data?.user?.fullName || '');
                setEmail(response.data?.user?.email || '');
                setProfileImage(`${imageBaseUrl}/${response.data?.user?.profilePicture}` || null);
            }
        } catch (error) {
            console.log(error.message)
        } finally {
            setLoading(false);
        }
    };

    const startFoodAnimations = () => {
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
            createFloatingAnimation(foodItem1Anim, -15, 20, 4000),
            createFloatingAnimation(foodItem2Anim, 20, 15, 3500),
        ]).start();
    };

    const handlePickImage = async () => {
        Animated.sequence([
            Animated.timing(profileImageScaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(profileImageScaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            })
        ]).start();

        // Haptic feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
            await uploadProfileImage(result.assets[0].uri);
        }
    };

    const handleSaveProfile = async () => {
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

        if (!name) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        setLoading(true);
        try {

            let response = await axiosInstance.put('/api/users/profile/text', { name, email }, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            setSaveSuccess(true);
            Animated.timing(successAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();

            setTimeout(() => {
                router.replace('/(app)/(tabs)');
            }, 100);
        } catch (error) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setLoading(false);
        }
    };

    const uploadProfileImage = async (uri) => {
        const formData = new FormData();
        formData.append('profilePicture', {
            uri,
            name: 'profile.jpg',
            type: 'image/jpeg',
        });

        try {
            await axiosInstance.put('/api/users/profile/photo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                },
            });
        } catch (error) {
            console.error('Upload error:', error.response.data);
        }
    };

    const renderInputField = (
        label: string,
        value: string,
        onChangeText: (text: string) => void,
        placeholder: string,
        keyboardType: 'default' | 'email-address' | 'phone-pad' = 'default',
        icon: string,
        multiline: boolean = false
    ) => {
        const isFocused = focusedInput === label;

        return (
            <View className="mb-5">
                <Text className={`text-[${COLORS.textDark}] text-base font-medium mb-2`}>
                    {label}
                </Text>
                <View
                    className={`flex-row items-center shadow-xl bg-white bg-[${COLORS.inputBg}] border ${isFocused ? `border-[${COLORS.secondary}]` : 'border-[#D4D5D9]'
                        } rounded-xl overflow-hidden`}
                    style={{
                        minHeight: multiline ? 100 : 50,
                    }}
                >
                    <View className={`px-4 ${multiline ? 'self-start pt-4' : ''}`}>
                        <Feather name={icon} size={20} color={isFocused ? COLORS.secondary : COLORS.textLight} />
                    </View>
                    <TextInput
                        className={`flex-1 px-2 text-[${COLORS.textDark}] ${multiline ? 'pt-4 text-base' : 'text-base'}`}
                        placeholder={placeholder}
                        placeholderTextColor={COLORS.textLight}
                        keyboardType={keyboardType}
                        value={value}
                        onChangeText={onChangeText}
                        onFocus={() => setFocusedInput(label)}
                        onBlur={() => setFocusedInput(null)}
                        multiline={multiline}
                        textAlignVertical={multiline ? 'top' : 'center'}
                        style={{ height: multiline ? 100 : 50 }}
                    />
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-white">
            {saveSuccess && (
                <Animated.View
                    className={`absolute top-20 left-5 right-5 z-50 bg-white py-3 px-4 rounded-xl flex-row items-center justify-center`}
                    style={{
                        opacity: successAnim,
                        transform: [{
                            translateY: successAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-20, 0]
                            })
                        }],
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 5
                    }}
                >
                    <Ionicons name="checkmark-circle" size={20} color="black" />
                    <Text className="text-black font-medium ml-2">
                        Profile updated successfully!
                    </Text>
                </Animated.View>
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <LinearGradient
                        colors={[COLORS.primary, COLORS.secondary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
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
                            <Text className="text-white text-2xl font-bold">
                                {isNewUser ? 'Complete Your Profile' : 'Update Your Profile'}
                            </Text>
                            <Text className="text-white/90 text-base mt-2">
                                {isNewUser
                                    ? 'Tell us a bit about yourself'
                                    : 'Update your personal information'}
                            </Text>
                        </View>
                    </LinearGradient>

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

                    </View>

                    <View className="items-center mt-[-50]">
                        <Animated.View
                            style={{
                                transform: [{ scale: profileImageScaleAnim }],
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.2,
                                shadowRadius: 8,
                                elevation: 10
                            }}
                        >
                            <TouchableOpacity
                                onPress={handlePickImage}
                                className="relative"
                                activeOpacity={0.9}
                            >
                                <View className="w-[100] h-[100] bg-white rounded-full items-center justify-center overflow-hidden border-4 border-white">
                                    {profileImage ? (
                                        <Image
                                            source={{ uri: profileImage }}
                                            style={{ width: 100, height: 100 }}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <LinearGradient
                                            colors={[COLORS.primary, COLORS.secondary]}
                                            style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <FontAwesome5 name="user-alt" size={40} color="white" />
                                        </LinearGradient>
                                    )}
                                </View>
                                <View className="absolute bottom-0 right-0 bg-[#0a2463] p-2 rounded-full">
                                    <Ionicons name="camera" size={18} color="white" />
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                        <Text className="text-[#686B78] text-sm mt-2">
                            Tap to {profileImage ? 'change' : 'add'} profile picture
                        </Text>
                    </View>

                    {/* Form */}
                    <Animated.View
                        className="flex-1 px-6 pt-6"
                        style={{
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }}
                    >
                        {loading && !saveSuccess ? (
                            <View className="flex-1 items-center justify-center">
                                <ActivityIndicator size="large" color={COLORS.secondary} />
                                <Text className="text-[#686B78] mt-4">
                                    {isNewUser ? 'Setting up your profile...' : 'Updating your profile...'}
                                </Text>
                            </View>
                        ) : (
                            <>
                                {/* Personal Information Section */}
                                <View className="mb-6">
                                    <Text className={`text-[${COLORS.secondary}] text-lg font-bold mb-4`}>
                                        Personal Information
                                    </Text>

                                    {renderInputField(
                                        'Full Name',
                                        name,
                                        setName,
                                        'Enter your full name',
                                        'default',
                                        'user'
                                    )}

                                    {renderInputField(
                                        'Email Address',
                                        email,
                                        setEmail,
                                        'Enter your email address',
                                        'email-address',
                                        'mail'
                                    )}

                                    {renderInputField(
                                        'Mobile Number',
                                        mobile,
                                        () => { }, // Read-only
                                        'Your mobile number',
                                        'phone-pad',
                                        'phone',
                                    )}
                                </View>

                                {/* <View className="mb-8">
                  <Text className={`text-[${COLORS.secondary}] text-lg font-bold mb-4`}>
                    Notification Preferences
                  </Text>
                  
                  <View className="bg-[#F8F8F8] rounded-xl p-4 mb-4">
                    <View className="flex-row items-center justify-between mb-4">
                      <View className="flex-row items-center">
                        <Ionicons name="mail-outline" size={20} color={COLORS.textDark} />
                        <Text className={`text-[${COLORS.textDark}] ml-3`}>
                          Email Notifications
                        </Text>
                      </View>
                      <Switch
                        trackColor={{ false: "#D4D5D9", true: COLORS.accent }}
                        thumbColor={emailNotifications ? "#fff" : "#f4f3f4"}
                        ios_backgroundColor="#D4D5D9"
                        onValueChange={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setEmailNotifications(!emailNotifications);
                        }}
                        value={emailNotifications}
                      />
                    </View>
                    
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Ionicons name="chatbubble-outline" size={20} color={COLORS.textDark} />
                        <Text className={`text-[${COLORS.textDark}] ml-3`}>
                          SMS Notifications
                        </Text>
                      </View>
                      <Switch
                        trackColor={{ false: "#D4D5D9", true: COLORS.accent }}
                        thumbColor={smsNotifications ? "#fff" : "#f4f3f4"}
                        ios_backgroundColor="#D4D5D9"
                        onValueChange={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setSmsNotifications(!smsNotifications);
                        }}
                        value={smsNotifications}
                      />
                    </View>
                  </View>
                </View> */}

                                {/* Save Button */}
                                <Animated.View
                                    style={{
                                        transform: [{ scale: buttonScaleAnim }],
                                        shadowColor: "#000",
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 8,
                                        elevation: 6
                                    }}
                                    className="mb-6 rounded-xl overflow-hidden"
                                >
                                    <TouchableOpacity
                                        onPress={handleSaveProfile}
                                        activeOpacity={0.9}
                                        disabled={loading}
                                        className="w-full"
                                    >
                                        <LinearGradient
                                            colors={[COLORS.primary, COLORS.secondary]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            className="h-[56] rounded-xl flex-row items-center justify-center"
                                        >
                                            <Text className="text-white text-lg font-semibold mr-2">
                                                {isNewUser ? 'Complete Profile' : 'Save Changes'}
                                            </Text>
                                            <Ionicons name="checkmark-circle" size={20} color="white" />
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </Animated.View>

                                {/* Skip button for new users */}
                                {isNewUser && (
                                    <TouchableOpacity
                                        className="items-center mb-8"
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            router.replace('/home');
                                        }}
                                    >
                                        <Text className={`text-[${COLORS.secondary}] text-base font-medium`}>
                                            Skip for now
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </>
                        )}
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}