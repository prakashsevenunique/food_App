// SplashManager.js
import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export function SplashManager({ children, onReady }) {
    const [appIsReady, setAppIsReady] = useState(false);
    const [splashAnimationComplete, setSplashAnimationComplete] = useState(false);

    const fadeAnim = new Animated.Value(1);

    useEffect(() => {
        async function prepare() {
            try {
                await onReady();
            } catch (e) {
                console.warn('Error preparing app:', e);
            } finally {
                setAppIsReady(true);
            }
        }
        prepare();
    }, [onReady]);

    useEffect(() => {
        if (appIsReady) {
            SplashScreen.hideAsync();

            setTimeout(() => {
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }).start(() => {
                    setSplashAnimationComplete(true); 
                });
            }, 500); // Short delay to ensure smooth transition
        }
    }, [appIsReady]);

    if (!appIsReady || !splashAnimationComplete) {
        return (
            <>
                {children}
                <Animated.View
                    style={[
                        styles.container,
                        { opacity: fadeAnim }
                    ]}
                >
                    <Image
                        source={require('@/assets/img/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </Animated.View>
            </>
        );
    }

    return children;
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    logo: {
        width: 200,
        height: 200,
    },
});