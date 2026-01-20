import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface User {
    id: string;
    username: string;
    name: string;
    profilePicture?: string;
    bio?: string;
    accessLevel: 'admin' | 'customer' | 'no_access';
    createdAt: string;
}

interface UserContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    refreshUser: () => Promise<void>;
    isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUser = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/auth/me', {
                credentials: 'include',
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Not authenticated - this is expected outside Whop iFrame
                    setUser(null);
                    return;
                }
                throw new Error(`Failed to fetch user: ${response.statusText}`);
            }

            const userData = await response.json();
            setUser(userData);
        } catch (err) {
            console.error('[UserContext] Failed to fetch user:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch user');
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const refreshUser = useCallback(async () => {
        await fetchUser();
    }, [fetchUser]);

    const value: UserContextType = {
        user,
        loading,
        error,
        refreshUser,
        isAuthenticated: !!user,
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser(): UserContextType {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}

// Helper hook to check if user has admin access
export function useIsAdmin(): boolean {
    const { user } = useUser();
    return user?.accessLevel === 'admin';
}
