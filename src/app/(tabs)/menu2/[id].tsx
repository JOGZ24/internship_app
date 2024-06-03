import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useMyTasks } from '../../../providers/MyTasksContext'; // Importez le contexte
import { useLocalSearchParams } from 'expo-router';

const sizes = ['S', 'M', 'L', 'XL'];

const ProductDetailsScreen = () => {
    const { id } = useLocalSearchParams();
    const { myTasks } = useMyTasks(); // Utilisez le contexte pour obtenir les tâches
    console.log(myTasks);
    const task = myTasks.find(task => task.tasks.some(taskItem => taskItem.id === Number(id))); // Recherchez la tâche correspondante

    return (
        <View style={styles.container}>
            {task ? (
                <>
                    <Text style={styles.name}>{task.tasks[0]?.name}</Text>
                    <Text style={styles.instructions}>
                        {task.tasks[0]?.instruction_text ? (task.tasks[0]?.instruction_text === "False" ? "Aucune instruction disponible" : task.tasks[0]?.instruction_text) : 'Instructions non disponibles'}
                    </Text>
                    {/* Ajoutez ici d'autres détails sur la tâche si nécessaire */}
                </>
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
    image: {
        width: '100%',
        aspectRatio: 1,
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    sizes: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10
    },
    size: {
        backgroundColor: 'gainsboro',
        width: 50,
        aspectRatio: 1,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sizeText: {
        fontSize: 20,
        fontWeight: '500',
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
