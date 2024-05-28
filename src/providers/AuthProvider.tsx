import React, { createContext, useState, useContext, ReactNode } from 'react';

// Définir le type pour le contexte
interface AuthContextType {
    token: string | null;
    setToken: (token: string | null) => void;
    username: string | null;
    setUser: (username: string | null) => void;
}

// Créez le contexte avec un type par défaut
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Créez un fournisseur de contexte
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [token, setTokenState] = useState<string | null>(null);
    const [username, setUsernameState] = useState<string | null>(null);

    const setToken = (token: string | null) => {
        setTokenState(token);
    };

    return (
        <AuthContext.Provider value={{ token, setToken, username, setUser: setUsernameState }}>
            {children}
        </AuthContext.Provider>
    );
};

// Créez un hook personnalisé pour utiliser le contexte
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
