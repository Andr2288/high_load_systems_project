import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useCategoryStore = create((set, get) => ({
    categories: [],
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,

    fetchCategories: async () => {
        set({ isLoading: true });
        try {
            const token = localStorage.getItem('token');
            const res = await axiosInstance.get("/categories", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            set({ categories: res.data.categories });
        } catch (error) {
            console.error("Error fetching categories:", error);
            const errorMessage = error.response?.data?.error || "Failed to load categories";
            toast.error(errorMessage);
        } finally {
            set({ isLoading: false });
        }
    },

    createCategory: async (data) => {
        set({ isCreating: true });
        try {
            const token = localStorage.getItem('token');
            const res = await axiosInstance.post("/categories", data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Add new category to list
            set((state) => ({
                categories: [...state.categories, res.data.category]
            }));

            toast.success("Category created successfully!");
            return res.data.category;
        } catch (error) {
            console.error("Error creating category:", error);
            const errorMessage = error.response?.data?.error || "Failed to create category";
            toast.error(errorMessage);
            throw error;
        } finally {
            set({ isCreating: false });
        }
    },

    updateCategory: async (categoryId, data) => {
        set({ isUpdating: true });
        try {
            const token = localStorage.getItem('token');
            const res = await axiosInstance.put(`/categories/${categoryId}`, data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Update category in list
            set((state) => ({
                categories: state.categories.map((cat) =>
                    cat._id === categoryId ? { ...cat, ...res.data.category } : cat
                )
            }));

            toast.success("Category updated successfully!");
            return res.data.category;
        } catch (error) {
            console.error("Error updating category:", error);
            const errorMessage = error.response?.data?.error || "Failed to update category";
            toast.error(errorMessage);
            throw error;
        } finally {
            set({ isUpdating: false });
        }
    },

    deleteCategory: async (categoryId) => {
        set({ isDeleting: true });
        try {
            const token = localStorage.getItem('token');
            await axiosInstance.delete(`/categories/${categoryId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Remove category from list
            set((state) => ({
                categories: state.categories.filter((cat) => cat._id !== categoryId)
            }));

            toast.success("Category deleted successfully!");
        } catch (error) {
            console.error("Error deleting category:", error);
            const errorMessage = error.response?.data?.error || "Failed to delete category";
            toast.error(errorMessage);
            throw error;
        } finally {
            set({ isDeleting: false });
        }
    }
}));
