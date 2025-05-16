import { UserContext } from "@/hooks/userInfo";
import axiosInstance from "@/utils/axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Animated, Image, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { CodeField, useBlurOnFulfill, useClearByFocusCell } from "react-native-confirmation-code-field";

const CELL_COUNT = 4;

export default function OTPInputScreen({ mobile, userExists }) {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(30);
    const [showReferral, setShowReferral] = useState(false);
    const [referralCode, setReferralCode] = useState("");
    const ref = useBlurOnFulfill({ value: otp, cellCount: CELL_COUNT });
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({ value: otp, setValue: setOtp });
    const { token, setToken } = useContext(UserContext);

    const animatedValues = [...new Array(CELL_COUNT)].map(() => new Animated.Value(1));

    // Countdown timer for OTP resend
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const animateCell = (index, toValue) => {
        setTimeout(() => {
            Animated.timing(animatedValues[index], {
                toValue,
                duration: 300,
                useNativeDriver: false,
            }).start();
        }, 0); // Let React release the event before running animation
    };
    const resendOtp = async () => {
        if (countdown > 0) return;
        setLoading(true);
        try {
            await axiosInstance.post('/api/user/send-otp', {
                mobileNumber: mobile
            });
            setCountdown(30);
            Alert.alert("Success", "OTP has been resent");
        } catch (error) {
            Alert.alert("Error", error?.response?.data?.message || "Failed to resend OTP");
        } finally {
            setLoading(false);
        }
    };

    async function verifyOtp() {
        if (otp.length !== CELL_COUNT) {
            Alert.alert("Error", "Please enter the full OTP");
            return;
        }

        setLoading(true);
        try {
            const response = await axiosInstance.post('/api/user/verify-otp', {
                mobileNumber: mobile,
                otp: otp,
                ...(showReferral && referralCode && { referralCode })
            });
            await AsyncStorage.setItem('userData', JSON.stringify(response.data?.token));
            setToken(response.data?.token);
            router.replace("/");
        } catch (error) {
            if (error?.response?.data?.requiresReferral) {
                setShowReferral(true);
            } else {
                Alert.alert(error?.response?.data?.message || "Network error");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            <View className="flex-1 items-center justify-start mt-6 px-2">
                <Text className="text-[#ab3207] text-2xl font-bold mb-2">OTP Verification</Text>
                <Text className="text-[#ab3207] text-center mb-2">Enter the 4-digit OTP sent to</Text>
                <Text className="text-[#ab3207] font-semibold mb-6">+91 {mobile}</Text>
                <CodeField
                    ref={ref}
                    {...props}
                    value={otp}
                    onChangeText={setOtp}
                    cellCount={CELL_COUNT}
                    rootStyle={{ display:"flex",alignItems:"center",justifyContent:"center", marginTop: 10, width: "100%" , alignSelf: "center" }}
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    renderCell={({ index, symbol, isFocused }) => {
                        if (isFocused) animateCell(index, 1.1);
                        else animateCell(index, 1);
                        return (
                            <Animated.View
                                key={index}
                                style={{
                                    borderWidth: 1,
                                    borderColor: isFocused ? "#FF1493" : "#ddd",
                                    width: 48,
                                    height: 50,
                                    borderRadius: 10,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    margin: 5,
                                }}
                                onLayout={getCellOnLayoutHandler(index)}
                            >
                                <Text className="text-black text-2xl">{symbol || " "}</Text>
                            </Animated.View>
                        );
                    }}
                />

                {/* Resend OTP */}
                <View className="flex-row justify-center mt-4">
                    <Text className="text-gray-600 text-sm">Didn't receive OTP? </Text>
                    <TouchableOpacity onPress={resendOtp} disabled={countdown > 0}>
                        <Text className={`text-sm font-semibold ${countdown > 0 ? 'text-gray-400' : 'text-pink-500'}`}>
                            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend now'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Referral Code Input (conditionally shown) */}
                {(showReferral && !userExists) && (
                    <View className="w-full mt-6 mb-6">
                        <Text className="text-gray-600 mb-2">Referral Code (Optional)</Text>
                        <TextInput
                            className="w-full text-gray-900 rounded-md px-4 py-3 text-lg border border-gray-300"
                            placeholder="Enter referral code"
                            placeholderTextColor="#a1a1aa"
                            value={referralCode}
                            onChangeText={setReferralCode}
                        />
                    </View>
                )}

                {(!showReferral && !userExists) && (
                    <TouchableOpacity
                        className="mt-4"
                        onPress={() => setShowReferral(true)}
                    >
                        <Text className="text-pink-500 font-semibold text-sm">
                            Have a referral code?
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Verify Button */}
                <LinearGradient
                    colors={['#fa9421', '#c23d02']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="rounded w-full py-4 px-6 mt-4 items-center"
                >
                    <TouchableOpacity
                        className={`w-full ${loading ? "opacity-50" : ""}`}
                        onPress={verifyOtp}
                        disabled={loading}
                    >
                        <Text className="text-white text-lg font-semibold text-center">
                            {loading ? "loading..." : "Verify OTP"}
                        </Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        </KeyboardAvoidingView>
    );
}