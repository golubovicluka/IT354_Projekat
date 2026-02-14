import { useCallback, useEffect, useMemo, useState } from 'react';
import AuthContext from './auth-context';
import api, { setUnauthorizedHandler } from '@/lib/api';
import {
    clearStoredAuth,
    getStoredToken,
    getStoredUser,
    setStoredAuth,
} from '@/lib/authStorage';

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
        const response = await api.post('/auth/login', { email, password });
        const { token: newToken, user: userData } = response.data || {};
        if (!newToken || !userData) {
            throw new Error('Invalid authentication response.');
        }

        setStoredAuth({ token: newToken, user: userData });
        setAuthState({ token: newToken, user: userData });

        return userData;
    }, []);

    const register = useCallback(async (username, email, password) => {
        const response = await api.post('/auth/register', { username, email, password });
        return response.data;
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
