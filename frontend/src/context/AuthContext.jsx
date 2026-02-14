import { useCallback, useEffect, useMemo, useState } from 'react';
import AuthContext from './auth-context';
import { setUnauthorizedHandler } from '@/lib/api';
import {
    clearStoredAuth,
    getStoredToken,
    getStoredUser,
    setStoredAuth,
} from '@/lib/authStorage';
import { authService } from '@/services/authService';

const getInitialAuthState = () => {
    const token = getStoredToken();
    const user = token ? getStoredUser() : null;

    if (token && !user) {
        clearStoredAuth();
        return { token: null, user: null };
    }

    return { token, user };
};

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState(getInitialAuthState);



    const login = useCallback(async (email, password) => {
        const data = await authService.login(email, password);
        const { token: newToken, user: userData } = data;

        if (!newToken || !userData) {
            throw new Error('Invalid authentication response.');
        }

        setStoredAuth({ token: newToken, user: userData });
        setAuthState({ token: newToken, user: userData });

        return userData;
    }, []);

    const register = useCallback(async (username, email, password) => {
        return await authService.register(username, email, password);
    }, []);

    const logout = useCallback(() => {
        clearStoredAuth();
        setAuthState((current) => {
            if (!current.token && !current.user) {
                return current;
            }

            return { token: null, user: null };
        });
    }, []);

    useEffect(() => {
        setUnauthorizedHandler(() => {
            setAuthState((current) => {
                if (!current.token && !current.user) {
                    return current;
                }

                return { token: null, user: null };
            });
        });

        return () => {
            setUnauthorizedHandler(null);
        };
    }, []);

    const isAuthenticated = Boolean(authState.token && authState.user);
    const contextValue = useMemo(
        () => ({
            user: authState.user,
            token: authState.token,
            login,
            register,
            logout,
            isAuthenticated,
            loading: false,
        }),
        [authState.token, authState.user, isAuthenticated, login, logout, register]
    );

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
