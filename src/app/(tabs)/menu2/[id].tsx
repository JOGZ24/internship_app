import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { useMyTasks } from '../../../providers/MyTasksContext'; // Importez le contexte
import { useLocalSearchParams } from 'expo-router';
import NetInfo from '@react-native-community/netinfo';
import { useAuth } from '@/src/providers/AuthProvider';

interface Task {
    id: number;
    name: string;
    instruction_text: string;
    stage_id: number;
}

const ProductDetailsScreen = () => {
    const { id } = useLocalSearchParams();
    const { token, username } = useAuth();
    const { myTasks, setMyTasks } = useMyTasks(); // Utilisez le contexte pour obtenir les tâches

    // Recherchez la tâche correspondant à l'ID spécifié dans les paramètres locaux
    const task = myTasks.find(userTasks => userTasks.tasks.some(taskItem => taskItem.id === Number(id)))?.tasks.find(taskItem => taskItem.id === Number(id));

    // Définissez l'état local pour le nouveau stage de la tâche
    const [newStageId, setNewStageId] = useState<number | null>(null);

    // Fonction pour changer localement le stage de la tâche
    const updateTaskStageLocally = async () => {
        if (task && newStageId !== null) {
            const updatedTasks = myTasks.map(userTasks => ({
                ...userTasks,
                tasks: userTasks.tasks.map(taskItem => {
                    if (taskItem.id === task.id) {
                        return { ...taskItem, stage_id: newStageId };
                    }
                    return taskItem;
                })
            }));
            setMyTasks(updatedTasks);

            // Vérifier la connexion Internet avant d'envoyer l'appel API
            const isConnected = await NetInfo.fetch().then(state => state.isConnected);
            if (isConnected) {
                console.log('ouais ouais');
                // Envoyer l'appel API pour mettre à jour le stage de la tâche sur le serveur
                try {
                    console.log(username);

                    const userResponse = await fetch(`https://1028-2001-818-dbbb-a100-64f3-8cfa-bcbb-4b7c.ngrok-free.app/api/users/?search=${username}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Token ${token}`,
                        },
                    });
                    console.log('ouais');

                    if (!userResponse.ok) {
                        throw new Error('Erreur lors de la récupération de l\'ID de l\'utilisateur');
                    }

                    const userData = await userResponse.json();
                    if (userData.length === 0) {
                        throw new Error('Utilisateur non trouvé');
                    }

                    const userId = userData[0].id;

                    console.log('stage' + newStageId);
                    console.log('taskid' + task.id);
                    console.log('taskid' + userId);

                    const response = await fetch(`https://1028-2001-818-dbbb-a100-64f3-8cfa-bcbb-4b7c.ngrok-free.app/api/update_task/`, {
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

                    // Vérifiez si la réponse de l'API est OK
                    if (response.ok) {
                        Alert.alert('Mise à jour effectuée', 'Le stage de la tâche a été mis à jour avec succès.');
                    } else {
                        Alert.alert('Erreur', 'Une erreur s\'est produite lors de la mise à jour du stage de la tâche.');
                    }
                } catch (error) {
                    console.error('Erreur lors de la mise à jour du stage de la tâche:', error);
                    Alert.alert('Erreur', 'Une erreur s\'est produite lors de la mise à jour du stage de la tâche.');
                }
            } else {
                Alert.alert('Pas de connexion Internet', 'La mise à jour sera effectuée dès que vous serez connecté.');
            }
        }
    };

    return (
        <View style={styles.container}>
            {task ? (
                <View>
                    <Text style={styles.name}>{task.name}</Text>
                    <Text style={styles.instructions}>
                        {task.instruction_text ? (task.instruction_text === "False" ? "Aucune instruction disponible" : task.instruction_text) : 'Instructions non disponibles'}
                    </Text>
                    <Text>{task.stage_id}</Text>
                    <Button title="Stage 1" onPress={() => setNewStageId(1)} />
                    <Button title="Stage 2" onPress={() => setNewStageId(2)} />
                    {/* Ajoutez d'autres boutons pour d'autres stages si nécessaire */}
                    <Button title="Sauvegarder" onPress={updateTaskStageLocally} />
                </View>
            ) : (
                <Text style={styles.error}>Tâche non trouvée</Text>
            )}
        </View>
    );
};


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
