import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { Text, View } from '../../../components/Themed';
import { useAuth } from '@/src/providers/AuthProvider';
import { useRouter } from 'expo-router';
import { StageProvider, useStageContext } from '../../../providers/StageContext'; // Assurez-vous d'importer correctement le fournisseur de contexte et le hook

interface MyTask {
    user: {
        username: string;
    };
    tasks: {
        id: number;
        name: string;
        instruction_text: string;
        description: string;
        stage_id: string | number;
        stage_name?: string;
    }[];
}

export default function TabTwoScreen() {
    const [searchResults, setSearchResults] = useState<MyTask[]>([]);
    const [loading, setLoading] = useState(true);
    const { token, username } = useAuth();
    const router = useRouter();
    const { stages } = useStageContext(); // Utilisez le hook useStageContext pour obtenir les étapes

    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                const response = await fetch(`https://18ca-2001-818-dbbb-a100-99c3-6c94-ff89-470d.ngrok-free.app/api/mytasks/search-by-username/?username=${username}`, {
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
    }, [token, username]);

    const handlePress = (id: number) => {
        router.push(`/menu2/${id}`);
    };
    console.log(stages);
    // Fonction pour obtenir le nom du stage à partir de son ID
    const getStageName = (stageId: string | number) => {
        const stage = stages.find(stage => {
            if (typeof stageId === 'string') {
                return stage.id.toString() === stageId;
            } else {
                return stage.id === stageId;
            }
        });
        return stage ? stage.name : 'Stage non trouvé';
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
                            <Text style={styles.name}>{item.name || 'Nom non disponible'}</Text>
                            <Text style={styles.stageName}>{getStageName(item.stage_id) || 'Stage non disponible'}</Text>
                            <Text style={styles.description}>
                                {item.description ? (item.description === "<p><br></p>" ? "No description available" : item.description) : 'No description available'}
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
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
        color: 'black',
    },
    stageName: {
        fontSize: 18,
        color: '#333333',
        marginBottom: 5,
    },
    description: {
        fontSize: 16,
        color: '#666666',
    },
});

// Envelopper le composant TabTwoScreen avec le fournisseur de contexte des étapes

