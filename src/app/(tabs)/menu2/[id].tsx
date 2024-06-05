import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useMyTasks } from '../../../providers/MyTasksContext';
import { useLocalSearchParams } from 'expo-router';
import NetInfo from '@react-native-community/netinfo';
import { useAuth } from '@/src/providers/AuthProvider';
import { useStageContext } from '../../../providers/StageContext'; // Import du contexte des étapes

const ProductDetailsScreen = () => {
    const { id } = useLocalSearchParams();
    const { token, username } = useAuth();
    const { myTasks, setMyTasks } = useMyTasks();
    const [newStageId, setNewStageId] = useState<number | null>(null);
    const { stages } = useStageContext(); // Utilisation du contexte des étapes

    useEffect(() => {
        if (stages.length > 0) {
            // Si des étapes sont disponibles, définissez l'étape par défaut sur la première étape
            setNewStageId(stages[0].id);
        }
    }, [stages]);

    const task = myTasks.find(userTasks =>
        userTasks.tasks.some(taskItem => taskItem.id === Number(id))
    )?.tasks.find(taskItem => taskItem.id === Number(id));

    const updateTaskStageLocally = async () => {
        if (task && newStageId !== null) {
            const updatedTasks = myTasks.map(userTasks => ({
                ...userTasks,
                tasks: userTasks.tasks.map(taskItem =>
                    taskItem.id === task.id ? { ...taskItem, stage_id: newStageId } : taskItem
                )
            }));
            setMyTasks(updatedTasks);

            const { isConnected } = await NetInfo.fetch();
            if (isConnected) {
                try {
                    const userResponse = await fetch(`https://18ca-2001-818-dbbb-a100-99c3-6c94-ff89-470d.ngrok-free.app/api/users/?search=${username}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Token ${token}`,
                        },
                    });

                    if (!userResponse.ok) throw new Error('Erreur lors de la récupération de l\'ID de l\'utilisateur');

                    const userData = await userResponse.json();
                    if (userData.length === 0) throw new Error('Utilisateur non trouvé');

                    const userId = userData[0].id;

                    const response = await fetch(`https://18ca-2001-818-dbbb-a100-99c3-6c94-ff89-470d.ngrok-free.app/api/update_task/`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Token ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            taskId: task.id,
                            userId: userId,
                            stageId: newStageId,
                        }),
                    });

                    if (response.ok) {
                        Alert.alert('Update completed', 'The task stage has been updated successfully.');
                    } else {
                        Alert.alert('Erreur', 'Une erreur s\'est produite lors de la mise à jour du stage de la tâche.');
                    }
                } catch (error) {
                    console.error('Erreur lors de la mise à jour du stage de la tâche:', error);
                    Alert.alert('Erreur', 'Une erreur s\'est produite lors de la mise à jour du stage de la tâche.');
                }
            } else {
                Alert.alert('No internet connection', 'The update will be done as soon as you log in to internet .');
            }
        }
    };

    return (
        <View style={styles.container}>
            {task ? (
                <View style={styles.card}>
                    <Text style={styles.name}>{task.name}</Text>
                    <Text style={styles.instructions}>
                        {task.instruction_text ? (task.instruction_text === "False" ? "Aucune instruction disponible" : task.instruction_text) : 'Instructions non disponibles'}
                    </Text>
                    <Text style={styles.stage}>Stage: {task.stage_id}</Text>
                    <View style={styles.buttonContainer}>
                        {stages.map(stage => (
                            <TouchableOpacity
                                key={stage.id}
                                style={[styles.button, newStageId === stage.id && styles.buttonSelected]}
                                onPress={() => setNewStageId(stage.id)}
                            >
                                <Text style={styles.buttonText}>{stage.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity style={styles.saveButton} onPress={updateTaskStageLocally}>
                        <Text style={styles.saveButtonText}>Sauvegarder</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <Text style={styles.error}>Tâche non trouvée</Text>
            )}
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 10,
        elevation: 5,
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    instructions: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
    },
    stage: {
        fontSize: 18,
        color: '#444',
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        backgroundColor: 'white',
        borderColor: '#5C59F4',
        borderRadius: 5,
        padding: 10,
        marginVertical: 5,
        flex: 1,
        marginHorizontal: 5,
        borderWidth: 1,
        shadowColor: '#5C59F4',
        shadowOpacity: 0.3
    },
    buttonSelected: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#5C59F4',
        textAlign: 'center',
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: '#5C59F4',
        borderRadius: 5,
        padding: 15,
        marginTop: 20,
        shadowColor: '#5C59F4',
        shadowOpacity: 0.3,

    },
    saveButtonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
    },
    error: {
        fontSize: 18,
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default ProductDetailsScreen;
