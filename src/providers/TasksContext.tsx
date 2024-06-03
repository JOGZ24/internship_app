import React, { createContext, useState, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Task {
    tasks: any;
    id: number;
    name: string;
    instruction_text: string;
    user_id: Int16Array | null;
    stage_id: string;
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
            const filteredData = jsonData.filter(task => task.user_id === null);
            await storeTasks(filteredData);
        } catch (error) {
            console.error('Erreur lors de la récupération des données: ', error);
        }
    };

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
