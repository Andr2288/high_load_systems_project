import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useFlashcardStore = create((set, get) => ({
    flashcards: [],
    currentFlashcard: null,
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,

    fetchFlashcards: async () => {
        set({ isLoading: true });
        try {
            const token = localStorage.getItem('token');
            const res = await axiosInstance.get("/flashcards", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            set({ flashcards: res.data.flashcards });
        } catch (error) {
            console.error("Error fetching flashcards:", error);
            const errorMessage = error.response?.data?.error || "Failed to load flashcards";
            toast.error(errorMessage);
        } finally {
            set({ isLoading: false });
        }
    },

    fetchFlashcardsByCategory: async (categoryId) => {
        set({ isLoading: true });
        try {
            const token = localStorage.getItem('token');
            const res = await axiosInstance.get(`/categories/${categoryId}/flashcards`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            set({ flashcards: res.data.flashcards });
            return res.data.flashcards; // Return flashcards for use in components
        } catch (error) {
            console.error("Error fetching flashcards:", error);
            const errorMessage = error.response?.data?.error || "Failed to load flashcards";
            toast.error(errorMessage);
            return []; // Return empty array on error
        } finally {
            set({ isLoading: false });
        }
    },

    fetchFlashcard: async (flashcardId) => {
        set({ isLoading: true });
        try {
            const token = localStorage.getItem('token');
            const res = await axiosInstance.get(`/flashcards/${flashcardId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            set({ currentFlashcard: res.data });
        } catch (error) {
            console.error("Error fetching flashcard:", error);
            const errorMessage = error.response?.data?.error || "Failed to load flashcard";
            toast.error(errorMessage);
        } finally {
            set({ isLoading: false });
        }
    },

    generateFlashcard: async (data) => {
        set({ isCreating: true });
        try {
            const token = localStorage.getItem('token');

            const loadingToast = toast.loading('🤖 AI is generating your flashcard...');

            const res = await axiosInstance.post("/flashcards/generate", data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Add new flashcard to list
            set((state) => ({
                flashcards: [...state.flashcards, res.data.flashcard]
            }));

            toast.dismiss(loadingToast);
            toast.success("✨ Flashcard generated successfully!");
            return res.data.flashcard;
        } catch (error) {
            console.error("Error generating flashcard:", error);
            const errorMessage = error.response?.data?.error || "Failed to generate flashcard";
            toast.error(errorMessage);
            throw error;
        } finally {
            set({ isCreating: false });
        }
    },

    createFlashcard: async (data) => {
        set({ isCreating: true });
        try {
            const token = localStorage.getItem('token');
            const res = await axiosInstance.post("/flashcards", data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Add new flashcard to list
            set((state) => ({
                flashcards: [...state.flashcards, res.data.flashcard]
            }));

            toast.success("Flashcard created successfully!");
            return res.data.flashcard;
        } catch (error) {
            console.error("Error creating flashcard:", error);
            const errorMessage = error.response?.data?.error || "Failed to create flashcard";
            toast.error(errorMessage);
            throw error;
        } finally {
            set({ isCreating: false });
        }
    },

    updateFlashcard: async (flashcardId, data) => {
        set({ isUpdating: true });
        try {
            const token = localStorage.getItem('token');
            const res = await axiosInstance.put(`/flashcards/${flashcardId}`, data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Update flashcard in list
            set((state) => ({
                flashcards: state.flashcards.map((card) =>
                    card._id === flashcardId ? { ...card, ...res.data.flashcard } : card
                )
            }));

            toast.success("Flashcard updated successfully!");
            return res.data.flashcard;
        } catch (error) {
            console.error("Error updating flashcard:", error);
            const errorMessage = error.response?.data?.error || "Failed to update flashcard";
            toast.error(errorMessage);
            throw error;
        } finally {
            set({ isUpdating: false });
        }
    },

    deleteFlashcard: async (flashcardId) => {
        set({ isDeleting: true });
        try {
            const token = localStorage.getItem('token');
            await axiosInstance.delete(`/flashcards/${flashcardId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Remove flashcard from list
            set((state) => ({
                flashcards: state.flashcards.filter((card) => card._id !== flashcardId)
            }));

            toast.success("Flashcard deleted successfully!");
        } catch (error) {
            console.error("Error deleting flashcard:", error);
            const errorMessage = error.response?.data?.error || "Failed to delete flashcard";
            toast.error(errorMessage);
            throw error;
        } finally {
            set({ isDeleting: false });
        }
    },

    clearCurrentFlashcard: () => {
        set({ currentFlashcard: null });
    }
}));