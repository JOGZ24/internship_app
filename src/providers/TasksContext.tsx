import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthProvider'; // Importez votre AuthProvider pour récupérer le token

interface Task {
    tasks: any;
    id: number;
    name: string;
    instruction_text: string;
    user_id: Int16Array | null;
    stage_id: number;
    description: string;
    stage_name?: string; // Ajoutez cette propriété pour stocker le nom du stage
}

interface Stage {
    id: number;
    name: string;
}

interface TasksContextType {
    tasks: Task[];
    setTasks: (tasks: Task[]) => void;
    fetchAndStoreTasks: (token: string, teamId: number) => Promise<void>;
}

interface TasksProviderProps {
    children: ReactNode;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider: React.FC<TasksProviderProps> = ({ children }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [stages, setStages] = useState<Stage[]>([]); // Stockez les étapes localement
    const { token } = useAuth(); // Récupérer le token depuis votre AuthProvider

    // Fonction pour récupérer toutes les étapes
    const fetchStages = async () => {
        try {
            const response = await fetch(`https://1028-2001-818-dbbb-a100-64f3-8cfa-bcbb-4b7c.ngrok-free.app/api/stages/`, {
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

    const storeTasks = async (tasks: Task[]) => {
        try {
            const jsonValue = JSON.stringify(tasks);
            await AsyncStorage.setItem('@tasks', jsonValue);
            setTasks(tasks);
        } catch (e) {
            console.error('Erreur lors du stockage des tâches :', e);
        }
    };

    const fetchAndStoreTasks = async (token: string, teamId: number) => {
        try {
            const response = await fetch(`https://1028-2001-818-dbbb-a100-64f3-8cfa-bcbb-4b7c.ngrok-free.app/api/tasks/?search=${teamId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });

            const jsonData: Task[] = await response.json();
            const filteredData = jsonData.filter(task => task.user_id === null); // Filtrer les tâches avec user_id === null

            // Attendre que les étapes soient récupérées avant de procéder
            await fetchStages();

            console.log(stages);
            console.log(filteredData);

            const updatedTasks = filteredData.map(task => {
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
            });

            await storeTasks(updatedTasks);
        } catch (error) {
            console.error('Erreur lors de la récupération des données: ', error);
        }
    };


    useEffect(() => {
        if (token) {
            fetchStages(); // Récupérer les étapes une fois lorsque le token est disponible
        }
    }, [token]);

    return (
        <TasksContext.Provider value={{ tasks, setTasks, fetchAndStoreTasks }}>
            {children}
        </TasksContext.Provider>
    );
};

export const useTasks = () => {
    const context = useContext(TasksContext);
    if (context === undefined) {
        throw new Error('useTasks must be used within a TasksProvider');
    }
    return context;
};
