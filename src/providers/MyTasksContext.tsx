import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthProvider'; // Importez votre AuthProvider pour récupérer le token

interface MyTask {
    user: {
        username: string;
        email: string;
        id: number;
    };
    tasks: {
        id: number;
        name: string;
        instruction_text: string;
        description: string;
        stage_id: string | number;
        stage_name?: string; // Ajoutez cette propriété pour stocker le nom du stage
    }[];
}

interface Stage {
    id: number;
    name: string;
}

interface MyTasksContextType {
    myTasks: MyTask[];
    setMyTasks: (myTasks: MyTask[]) => void;
    fetchAndStoreMyTasks: (token: string, username: string) => Promise<void>;
}

interface MyTasksProviderProps {
    children: ReactNode;
}

const MyTasksContext = createContext<MyTasksContextType | undefined>(undefined);

export const MyTasksProvider: React.FC<MyTasksProviderProps> = ({ children }) => {
    const [myTasks, setMyTasks] = useState<MyTask[]>([]);
    const [stages, setStages] = useState<Stage[]>([]); // Stockez les étapes localement
    const { token, username } = useAuth(); // Récupérer le token depuis votre AuthProvider

    // Fonction pour récupérer toutes les étapes
    const fetchStages = async () => {
        try {
            const response = await fetch(`https://18ca-2001-818-dbbb-a100-99c3-6c94-ff89-470d.ngrok-free.app/api/stages/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });
            const data: Stage[] = await response.json();
            setStages(data);
        } catch (error) {
            console.error('Erreur lors de la récupération des étapes: ', error);
        }
    };

    const storeMyTasks = async (myTasks: MyTask[]) => {
        try {
            const jsonValue = JSON.stringify(myTasks);
            await AsyncStorage.setItem('@myTasks', jsonValue);
            setMyTasks(myTasks);
        } catch (e) {
            console.error('Erreur lors du stockage des tâches :', e);
        }
    };

    const fetchAndStoreMyTasks = async (token: string, username: string) => {
        try {
            const response = await fetch(`https://18ca-2001-818-dbbb-a100-99c3-6c94-ff89-470d.ngrok-free.app/api/mytasks/search-by-username/?username=${username}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });

            const jsonData: MyTask[] = await response.json();

            // Attendre que les étapes soient récupérées avant de procéder
            await fetchStages();

            const updatedMyTasks = jsonData.map(myTask => ({
                ...myTask,
                tasks: myTask.tasks.map(task => {
                    // Vérifier si task.stage_id est une chaîne de caractères
                    if (typeof task.stage_id === 'string') {
                        // Convertir stage_id en nombre
                        const stageId = parseInt(task.stage_id);

                        // Assurez-vous que stageId est un nombre valide
                        if (isNaN(stageId)) {
                            console.error(`Invalid stage_id for task: ${task.id}`);
                            return task; // Retournez la tâche inchangée en cas d'erreur
                        }

                        // Trouver le nom du stage associé à chaque tâche
                        const stage = stages.find(stage => stage.id === stageId);
                        return {
                            ...task,
                            stage_name: stage ? stage.name : 'Stage non trouvé',
                        };
                    } else {
                        // Si task.stage_id est déjà un nombre, pas besoin de conversion
                        // Trouver le nom du stage associé à chaque tâche
                        const stage = stages.find(stage => stage.id === task.stage_id);
                        return {
                            ...task,
                            stage_name: stage ? stage.name : 'Stage non trouvé',
                        };
                    }
                }),
            }));

            await storeMyTasks(updatedMyTasks);
        } catch (error) {
            console.error('Erreur lors de la récupération des données: ', error);
        }
    };

    useEffect(() => {
        if (token && username) {
            fetchAndStoreMyTasks(token, username); // Récupérer les tâches une fois lorsque le token et le nom d'utilisateur sont disponibles
        }
    }, [token, username]);

    return (
        <MyTasksContext.Provider value={{ myTasks, setMyTasks, fetchAndStoreMyTasks }}>
            {children}
        </MyTasksContext.Provider>
    );
};

export const useMyTasks = () => {
    const context = useContext(MyTasksContext);
    if (!context) {
        throw new Error('useMyTasks must be used within a MyTasksProvider');
    }
    return context;
};
