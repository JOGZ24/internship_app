import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useAuth } from './AuthProvider';

interface MyTask {
    user: {
        username: string;
    };
    tasks: {
        id: number;
        name: string;
        instruction_text: string;
    }[];
}

interface MyTasksContextType {
    myTasks: MyTask[];
    setMyTasks: React.Dispatch<React.SetStateAction<MyTask[]>>;
}

const MyTasksContext = createContext<MyTasksContextType | undefined>(undefined);

export const MyTasksProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [myTasks, setMyTasks] = useState<MyTask[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { token, username } = useAuth();

    useEffect(() => {
        const fetchMyTasks = async () => {
            try {
                const response = await fetch(`https://1028-2001-818-dbbb-a100-64f3-8cfa-bcbb-4b7c.ngrok-free.app/api/mytasks/search-by-username/?username=${username}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des données');
                }
                const data: MyTask[] = await response.json();
                console.log(data);
                setMyTasks(data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };

        if (token && username) {
            fetchMyTasks(); // Exécuter la requête uniquement si token et username sont définis
        }
    }, [token, username]); /// Ajoutez token et username dans les dépendances

    return (
        <MyTasksContext.Provider value={{ myTasks, setMyTasks }}>
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
