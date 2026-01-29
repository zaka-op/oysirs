import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export type UserRole = 'admin' | 'staff';

export interface User {
    id: string;
    username: string;
    fullName: string;
    email: string;
    role: UserRole;
}

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => void;
    logout: () => void;
    isAdmin: () => boolean;
    isStaff: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Check if user data exists in cookies on initial load
        const userCookie = Cookies.get('user');
        if (userCookie && !user) {
            try {
                const userData = JSON.parse(userCookie);
                setUser(userData);
            } catch (error) {
                console.error('Error parsing user cookie:', error);
            }
        }
    }, [user]);

    const login = (username: string, password: string) => {
        // For demo purposes, set role based on username
        // In a real app, this would come from your API
        const role: UserRole = username.toLowerCase().includes('admin') ? 'admin' : 'staff';
        
        const dummyUser: User = {
            id: `user-${Math.floor(Math.random() * 1000)}`,
            username,
            fullName: username.includes('admin') ? 'Admin User' : 'Staff User',
            email: `${username}@example.com`,
            role
        };
        
        setUser(dummyUser);
        // Store auth token and user data in cookies
        Cookies.set('authToken', 'dummy-token', { expires: 7 });
        Cookies.set('user', JSON.stringify(dummyUser), { expires: 7 });
    };

    const logout = () => {
        setUser(null);
        Cookies.remove('authToken');
        Cookies.remove('user');
    };
    
    const isAdmin = () => user?.role === 'admin';
    
    const isStaff = () => user?.role === 'staff';

    return (
        <AuthContext.Provider value={{ user, login, logout, isAdmin, isStaff }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const useAuthGuard = () => {
    const router = useRouter();
    const { user } = useAuth();
    useEffect(() => {
        const token = Cookies.get('authToken');
        if (!token) {
            router.push('/login');
        }
    }, [router, user]);
};

export const useAdminGuard = () => {
    const router = useRouter();
    const { isAdmin } = useAuth();
    useEffect(() => {
        if (!isAdmin()) {
            router.push('/');
        }
    }, [router, isAdmin]);
}