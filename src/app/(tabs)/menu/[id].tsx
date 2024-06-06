import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTasks } from '../../../providers/TasksContext';
import { useLocalSearchParams } from 'expo-router';
import RenderHTML from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';

const ProductDetailsScreen = () => {
    const { tasks } = useTasks();
    const { id } = useLocalSearchParams();
    const { width } = useWindowDimensions();

    // Recherche de la tâche correspondant à l'ID dans la liste des tâches
    const taskId = typeof id === 'string' ? parseInt(id, 10) : id;
    const task = tasks.find(task => task.id === taskId);

    return (
        <ScrollView style={styles.container}>
            {task ? (
                <>
                    <Text style={styles.name}>{task.name}</Text>

                    <Text style={styles.descriptionTitle}>Description</Text>
                    {task.instruction_text && task.instruction_text !== "<p><br></p>" ? (
                        <RenderHTML
                            contentWidth={width}
                            source={{ html: task.instruction_text }}
                            baseStyle={styles.instructions}
                        />
                    ) : (
                        <Text style={styles.instructions}>No description available</Text>
                    )}
                    {/* Afficher d'autres détails de la tâche ici */}
                </>
            ) : (
                <Text style={styles.error}>Tâche non trouvée</Text>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f0f2f5',
    },
    name: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
        textAlign: 'center',
    },
    descriptionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    instructions: {
        fontSize: 16,
        color: '#444',
        lineHeight: 24,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        marginBottom: 20,
    },
    error: {
        fontSize: 18,
        color: 'red',
        textAlign: 'center',
        marginVertical: 20,
    },
});

export default ProductDetailsScreen;
