import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/src/providers/AuthProvider';

// Déclarer le type pour les étapes
interface Stage {
    id: number;
    name: string;
}

// Déclarer le type pour le contexte des étapes
interface StageContextType {
    stages: Stage[];
    setStages: React.Dispatch<React.SetStateAction<Stage[]>>;
}

// Créer le contexte des étapes
const StageContext = createContext<StageContextType | undefined>(undefined);

// Créer le fournisseur de contexte des étapes
export const StageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [stages, setStages] = useState<Stage[]>([]);
    const { token } = useAuth();

    useEffect(() => {
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

        fetchStages();
    }, [token]);

    return (
        <StageContext.Provider value={{ stages, setStages }}>
            {children}
        </StageContext.Provider>
    );
};

// Utiliser le contexte des étapes
export const useStageContext = () => {
    const context = useContext(StageContext);
    if (!context) {
        throw new Error('useStageContext must be used within a StageProvider');
    }
    return context;
};
