import { Stack, router } from "expo-router";
import { Pressable, Text } from "react-native";

const handleLogout = () => {
    // Implémentez ici la logique de déconnexion, par exemple, effacer les informations d'identification, puis rediriger vers l'écran d'authentification
    router.push("(auth)")
};

export default function MenuStack() {
    return (<Stack screenOptions={{
        headerTitleAlign: 'center',
        headerRight: () => (
            <Pressable onPress={handleLogout}>
                <Text style={{ color: 'black', marginRight: 10 }}>Logout</Text>
            </Pressable>
        ),
    }}>
        <Stack.Screen name="index" options={{ title: 'My work orders' }} />
    </Stack >
    );
}

