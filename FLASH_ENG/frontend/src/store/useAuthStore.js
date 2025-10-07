import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,

    checkAuth: async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                set({ authUser: null, isCheckingAuth: false });
                return;
            }

            const res = await axiosInstance.get("/auth/check", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            set({ authUser: res.data });
        } catch (error) {
            console.log("Error in checkAuth", error);
            set({ authUser: null });
            localStorage.removeItem('token');
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);

            // Save token
            localStorage.setItem('token', res.data.token);

            set({ authUser: res.data.user });
            toast.success("Account created successfully!");

        } catch (error) {
            const errorMessage = error.response?.data?.error || "Signup failed";
            toast.error(errorMessage);
            console.log("Error in signup", error);
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);

            // Save token
            localStorage.setItem('token', res.data.token);

            set({ authUser: res.data.user });
            toast.success("Logged in successfully!");

        } catch (error) {
            const errorMessage = error.response?.data?.error || "Login failed";
            toast.error(errorMessage);
            console.log("Error in login", error);
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ authUser: null });
        toast.success("Logged out successfully!");
    }
}));