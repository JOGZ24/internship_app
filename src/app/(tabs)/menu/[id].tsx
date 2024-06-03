import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTasks } from '../../../providers/TasksContext';
import { useLocalSearchParams } from 'expo-router';

const ProductDetailsScreen = () => {
    const { tasks } = useTasks();
    const { id } = useLocalSearchParams();

    // Recherche de la tâche correspondant à l'ID dans la liste des tâches
    const taskId = typeof id === 'string' ? parseInt(id, 10) : id;
    const task = tasks.find(task => task.id === taskId);


    return (
        <View style={styles.container}>
            {task ? (
                <>
                    <Text style={styles.name}>{task.name}</Text>
                    <Text style={styles.instructions}>
                        {task.instruction_text ? (task.instruction_text === "False" ? "No instructions available" : task.instruction_text) : 'Instructions non disponibles'}
                    </Text>
                    {/* Afficher d'autres détails de la tâche ici */}
                </>
            ) : (
                <Text style={styles.error}>Tâche non trouvée</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: 'white',
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    instructions: {
        fontSize: 16,
        marginBottom: 10,
    },
    error: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
    },
});

export default ProductDetailsScreen;
