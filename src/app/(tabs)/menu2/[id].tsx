import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useMyTasks } from '../../../providers/MyTasksContext'; // Importez le contexte
import { useLocalSearchParams } from 'expo-router';

interface Task {
    id: number;
    name: string;
    instruction_text: string;
    stage_id: string;
    // Ajoutez d'autres propriétés au besoin
}

const ProductDetailsScreen = () => {
    const { id } = useLocalSearchParams();
    const { myTasks } = useMyTasks(); // Utilisez le contexte pour obtenir les tâches

    // Recherchez la tâche correspondant à l'ID spécifié dans les paramètres locaux
    let task: Task | undefined;
    myTasks.forEach(userTasks => {
        const foundTask = userTasks.tasks.find(taskItem => taskItem.id === Number(id));
        if (foundTask) {
            task = foundTask as unknown as Task;
            return;
        }
    });

    return (
        <View style={styles.container}>
            {task ? (
                <View>
                    <Text style={styles.name}>{task.name}</Text>
                    <Text style={styles.instructions}>
                        {task.instruction_text ? (task.instruction_text === "False" ? "Aucune instruction disponible" : task.instruction_text) : 'Instructions non disponibles'}
                    </Text>
                    <Text>{task.stage_id}</Text>
                </View>
            ) : (
                <Text style={styles.error}>Tâche non trouvée</Text>
            )}
        </View>
    );

}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1,
        padding: 10
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
    error: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
    },
});

export default ProductDetailsScreen;
