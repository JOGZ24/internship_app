import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useAuth } from './AuthProvider';

interface Stage {
    id: number;
    name: string;
    done: boolean;
}

interface StagesContextType {
    stages: Stage[];
    loading: boolean;
}


const StagesContext = createContext<StagesContextType | undefined>(undefined);
const { token } = useAuth();

export const StagesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [stages, setStages] = useState<Stage[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchStages = async () => {
            try {
                const response = await fetch(`https://1028-2001-818-dbbb-a100-64f3-8cfa-bcbb-4b7c.ngrok-free.app/api/stages`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des données');
                }
                const data: Stage[] = await response.json();
                setStages(data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };

        fetchStages();
    }, []); // Exécuter la requête une seule fois lors du montage du composant

    return (
        <StagesContext.Provider value={{ stages, loading }}>
            {children}
        </StagesContext.Provider>
    );
};

// Hook personnalisé pour utiliser le contexte des étapes de maintenance
export const useStages = () => {
    const context = useContext(StagesContext);
    if (!context) {
        throw new Error('useStages must be used within a StagesProvider');
    }
    return context;
};
