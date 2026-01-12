import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../api/client';

interface User {
    sub: string;
    email: string;
    role: string;
    tenantId?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
    logout: () => Promise<void>;
    fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,

            login: async (email: string, password: string) => {
                set({ isLoading: true });
                try {
                    await api.login(email, password);
                    const user = await api.getMe();
                    set({ user, isAuthenticated: true, isLoading: false });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            register: async (email, password, firstName, lastName) => {
                set({ isLoading: true });
                try {
                    await api.register(email, password, firstName, lastName);
                    const user = await api.getMe();
                    set({ user, isAuthenticated: true, isLoading: false });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            logout: async () => {
                await api.logout();
                set({ user: null, isAuthenticated: false });
            },

            fetchUser: async () => {
                try {
                    const user = await api.getMe();
                    set({ user, isAuthenticated: true });
                } catch {
                    set({ user: null, isAuthenticated: false });
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
);
