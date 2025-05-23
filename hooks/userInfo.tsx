import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from "expo-location";
import axiosInstance from '@/utils/axiosInstance';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

export const UserContext = createContext({});

export const UserProvider = ({ children }: any) => {
    const [userInfo, setUserInfo] = useState<any>(null);
    const [location, setlocation] = useState<any>({
        latitude: 26.804199,
        longitude: 75.858655
    })
    const [token, setToken] = useState<string>('');
    const [city, setCity] = useState<string>('')
    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
    const notificationListener = useRef<Notifications.EventSubscription>();
    const responseListener = useRef<Notifications.EventSubscription>();

    const getAuthToken = async () => {
        const userData = await AsyncStorage.getItem('userData');
        const parsedData = userData ? JSON.parse(userData) : null;
        setToken(parsedData);
    };

    const getCurrentLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            alert("Permission to access location was denied.");
            return;
        }
        let userLocation = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = userLocation.coords;
        const locationData = {
            latitude: latitude,
            longitude: longitude
        }
        setlocation(locationData)
    };

    const fetchAddress = async () => {
        if (!location.latitude || !location.longitude) return;
        try {
            let result = await Location.reverseGeocodeAsync(location) as any;
            if (result.length > 0) {
                const address = `${result[0].name}, ${result[0].street}, ${result[0].city}, ${result[0].region}, ${result[0].country}`;
                setCity(`${result[0].city},${result[0].region}, ${result[0].country}`)
            }
        } catch (error) {
            setCity("Unknown Location");
        }
    };

    const updateLocation = async (mobileNumber: string, latitude: string, longitude: string) => {
        try {
            const response = await axiosInstance.post(
                '/api/user/update-location', {
                mobileNumber,
                latitude,
                longitude,
                notificationToken: expoPushToken || ''
            }
            );
        } catch (error: any) {
            console.log("location", error.response?.data?.message);
        }
    };

    const fetchUserInfo = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const response = await axiosInstance.get('/api/users/profile', config);

            console.log("userInfo", response.data);
            setUserInfo(response.data?.user);
        } catch (error: any) {
            Alert.alert(error.response?.data?.message || 'Something went wrong!');
            if (error.response) {
                if (error.response.status === 401 || error.response.status === 404) {
                    await AsyncStorage.removeItem('userData');
                    router.push('/welcome');
                    setToken('')
                }
            }
        }
    };

    useEffect(() => {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
            }),
        });

        async function registerForPushNotificationsAsync() {
            if (Device.isDevice) {
                const { status: existingStatus } = await Notifications.getPermissionsAsync();
                let finalStatus = existingStatus;
                if (existingStatus !== 'granted') {
                    const { status } = await Notifications.requestPermissionsAsync();
                    finalStatus = status;
                }
                if (finalStatus !== 'granted') {
                    alert('Permission not granted to get push token for push notification!');
                    return;
                }
                const projectId =
                    Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
                if (!projectId) {
                    alert('Project ID not found');
                    return;
                }
                try {
                    const pushToken = (
                        await Notifications.getExpoPushTokenAsync({ projectId })
                    ).data;
                    setExpoPushToken(pushToken);
                } catch (e) {
                    // alert(`Failed to get push token: ${e}`);
                }
            } else {
                alert('Must use physical device for push notifications');
            }
        }

        registerForPushNotificationsAsync();

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            const url = response?.notification?.request?.content?.data?.url;
            if (url) {
                Linking.openURL(url);
            }
        });

        return () => {
            notificationListener.current && Notifications.removeNotificationSubscription(notificationListener.current);
            responseListener.current && Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, [token]);


    useEffect(() => {
        getCurrentLocation()
    }, [])

    useEffect(() => {
        if (location) {
            fetchAddress()
        }
    }, [location])


    useEffect(() => {
        if (!token) {
            getAuthToken();
        }
        if (token) {
            fetchUserInfo();
        }
    }, [token]);

    useEffect(() => {
        if (userInfo && location) {
            // updateLocation(userInfo?.mobileNumber, location.latitude, location.longitude)
        }
    }, [userInfo, location, expoPushToken])

    return (
        <UserContext.Provider value={{ userInfo, notification, fetchUserInfo, token, city, setToken, setlocation, location, setUserInfo }}>
            {children}
        </UserContext.Provider>
    );
};
