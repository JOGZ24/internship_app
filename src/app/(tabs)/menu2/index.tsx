import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { Text, View } from '../../../components/Themed';
import { useAuth } from '@/src/providers/AuthProvider';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

interface MyTask {
    user: {
        username: string;
    };
    tasks: {
        id: number;
        name: string;
        instruction_text: string;
    }
}

export default function TabTwoScreen() {
    const [searchResults, setSearchResults] = useState<MyTask[]>([]);
    const [loading, setLoading] = useState(true);
    const { token, username } = useAuth();
    const router = useRouter();

    useFocusEffect(
        React.useCallback(() => {
            const fetchSearchResults = async () => {
                try {
                    const response = await fetch(`https://1028-2001-818-dbbb-a100-64f3-8cfa-bcbb-4b7c.ngrok-free.app/api/mytasks/search-by-username/?username=${username}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Token ${token}`,
                        },
                    });
                    if (!response.ok) {
                        throw new Error('Erreur lors de la récupération des données');
                    }
                    const data: MyTask[] = await response.json();
                    setSearchResults(data);
                    setLoading(false);
                } catch (error) {
                    console.error(error);
                    setLoading(false);
                }
            };

            fetchSearchResults();

            return () => { };
        }, [token, username])
    );

    const handlePress = (id: number) => {
        router.push(`/menu2/${id}`);
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#5C59F4" />
            ) : (
                <FlatList
                    data={searchResults.flatMap(result => result.tasks)}
                    renderItem={({ item }) => (
                        <Pressable style={styles.itemContainer} onPress={() => handlePress(item.id)}>
                            <Text style={{ color: 'black', fontSize: 22 }}>{item.name || 'Nom non disponible'}</Text>
                            <Text style={styles.instructions}>
                                {item.instruction_text ? (item.instruction_text === "False" ? "Aucune instruction disponible" : item.instruction_text) : 'Instructions non disponibles'}
                            </Text>
                        </Pressable>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{ paddingVertical: 10 }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        backgroundColor: '#ffffff',
    },
    itemContainer: {
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        backgroundColor: '#F9F9F9',
    },
    username: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333333',
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
        color: 'black',
    },
    instructions: {
        fontSize: 16,
        color: '#666666',
    },
});
