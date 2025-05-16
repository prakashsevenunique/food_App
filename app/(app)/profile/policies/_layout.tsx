import { Stack } from 'expo-router';

export default function PolicyLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="about_app"
                options={{
                    headerShown: false
                }}
            />
             <Stack.Screen
                name="about_us"
                options={{
                    headerShown: false
                }}
            />
             <Stack.Screen
                name="term&condition"
                options={{
                    headerShown: false
                }}
            />
        </Stack>
    );
}