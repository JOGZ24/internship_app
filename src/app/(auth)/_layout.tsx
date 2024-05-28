import { Stack } from "expo-router";

export default function MenuStack() {
    return (<Stack>
        <Stack.Screen name="index" options={{ title: 'Login Page', headerShown: false }} />
    </Stack >
    );
}

