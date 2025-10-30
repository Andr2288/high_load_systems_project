import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { useCategoryStore } from "../store/useCategoryStore.js";
import { useFlashcardStore } from "../store/useFlashcardStore.js";
import {
    BookOpen,
    Plus,
    FolderOpen,
    Edit2,
    Trash2,
    X,
    Loader,
    Lock,
    Sparkles
} from "lucide-react";

const HomePage = () => {
    const { authUser } = useAuthStore();
    const {
        categories,
        isLoading: categoriesLoading,
        isCreating: categoryCreating,
        isDeleting: categoryDeleting,
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory
    } = useCategoryStore();

    const {
        flashcards,
        isLoading: flashcardsLoading,
        isCreating: flashcardCreating,
        isDeleting: flashcardDeleting,
        fetchFlashcardsByCategory,
        createFlashcard,
        generateFlashcard,
        updateFlashcard,
        deleteFlashcard
    } = useFlashcardStore();

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showFlashcardModal, setShowFlashcardModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingFlashcard, setEditingFlashcard] = useState(null);

    const [categoryForm, setCategoryForm] = useState({
        name: "",
        description: "",
        color: "#3B82F6"
    });

    const [flashcardForm, setFlashcardForm] = useState({
        word: "",
        useAI: true  // Default to AI generation
    });

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        if (selectedCategory) {
            fetchFlashcardsByCategory(selectedCategory._id);
        }
    }, [selectedCategory, fetchFlashcardsByCategory]);

    // Separate default and user categories
    const defaultCategories = categories.filter(cat => cat.is_default);
    const userCategories = categories.filter(cat => !cat.is_default);

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        try {
            await createCategory(categoryForm);
            setShowCategoryModal(false);
            setCategoryForm({ name: "", description: "", color: "#3B82F6" });
        } catch (error) {
            // Error handled in store
        }
    };

    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        try {
            await updateCategory(editingCategory._id, categoryForm);
            setShowCategoryModal(false);
            setEditingCategory(null);
            setCategoryForm({ name: "", description: "", color: "#3B82F6" });
        } catch (error) {
            // Error handled in store
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        if (window.confirm("Are you sure? This will delete all flashcards in this category.")) {
            try {
                await deleteCategory(categoryId);
                if (selectedCategory?._id === categoryId) {
                    setSelectedCategory(null);
                }
            } catch (error) {
                // Error handled in store
            }
        }
    };

    const openEditCategoryModal = (category) => {
        setEditingCategory(category);
        setCategoryForm({
            name: category.name,
            description: category.description,
            color: category.color
        });
        setShowCategoryModal(true);
    };

    const openCreateCategoryModal = () => {
        setEditingCategory(null);
        setCategoryForm({ name: "", description: "", color: "#3B82F6" });
        setShowCategoryModal(true);
    };

    const handleCreateFlashcard = async (e) => {
        e.preventDefault();
        try {
            if (flashcardForm.useAI) {
                // AI Generation
                await generateFlashcard({
                    word: flashcardForm.word,
                    category_id: selectedCategory._id
                });
            } else {
                // Manual creation (not used for now)
                await createFlashcard({
                    word: flashcardForm.word,
                    translation: "",
                    category_id: selectedCategory._id
                });
            }

            setShowFlashcardModal(false);
            setFlashcardForm({ word: "", useAI: true });
        } catch (error) {
            // Error handled in store
        }
    };

    const handleUpdateFlashcard = async (e) => {
        e.preventDefault();
        try {
            await updateFlashcard(editingFlashcard._id, flashcardForm);
            setShowFlashcardModal(false);
            setEditingFlashcard(null);
            setFlashcardForm({ word: "", useAI: true });
        } catch (error) {
            // Error handled in store
        }
    };

    const handleDeleteFlashcard = async (flashcardId) => {
        if (window.confirm("Are you sure you want to delete this flashcard?")) {
            try {
                await deleteFlashcard(flashcardId);
            } catch (error) {
                // Error handled in store
            }
        }
    };

    const openEditFlashcardModal = (flashcard) => {
        setEditingFlashcard(flashcard);
        setFlashcardForm({
            word: flashcard.word,
            useAI: false
        });
        setShowFlashcardModal(true);
    };

    const openCreateFlashcardModal = () => {
        setEditingFlashcard(null);
        setFlashcardForm({ word: "", useAI: true });
        setShowFlashcardModal(true);
    };

    const renderCategoryCard = (category, isDefault = false) => (
        <div
            key={category._id}
            onClick={() => setSelectedCategory(category)}
            className={`bg-white rounded-xl shadow-sm border-2 p-6 cursor-pointer transition-all ${
                selectedCategory?._id === category._id
                    ? 'border-blue-500 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
            }`}
        >
            <div className="flex items-start justify-between mb-4">
                <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: category.color + '20' }}
                >
                    {isDefault ? (
                        <Lock
                            className="w-6 h-6"
                            style={{ color: category.color }}
                        />
                    ) : (
                        <FolderOpen
                            className="w-6 h-6"
                            style={{ color: category.color }}
                        />
                    )}
                </div>
                {!isDefault && (
                    <div className="flex space-x-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                openEditCategoryModal(category);
                            }}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategory(category._id);
                            }}
                            disabled={categoryDeleting}
                            className="p-1 hover:bg-red-50 rounded disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                    </div>
                )}
            </div>

            <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                    {category.name}
                </h3>
                {isDefault && (
                    <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                        Default
                    </span>
                )}
            </div>

            {category.description && (
                <p className="text-sm text-gray-600 mb-4">
                    {category.description}
                </p>
            )}
            <div className="text-sm text-gray-500">
                {category.flashcard_count} flashcard{category.flashcard_count !== 1 ? 's' : ''}
            </div>
        </div>
    );

    if (categoriesLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader className="w-12 h-12 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Welcome, {authUser?.full_name}!
                    </h1>
                    <p className="text-xl text-gray-600">
                        Manage your flashcards and categories
                    </p>
                </div>

                {/* Default Categories Section */}
                {defaultCategories.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Default Categories</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Pre-made categories available for all users
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {defaultCategories.map((category) => renderCategoryCard(category, true))}
                        </div>
                    </div>
                )}

                {/* User Categories Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">My Categories</h2>
                        <button
                            onClick={openCreateCategoryModal}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            <span>New Category</span>
                        </button>
                    </div>

                    {userCategories.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">No personal categories yet</p>
                            <button
                                onClick={openCreateCategoryModal}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Create your first category
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {userCategories.map((category) => renderCategoryCard(category, false))}
                        </div>
                    )}
                </div>

                {/* Flashcards Section */}
                {selectedCategory && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Flashcards in "{selectedCategory.name}"
                                </h2>
                                {selectedCategory.is_default && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        ℹ️ This is a default category. Flashcards cannot be edited or deleted.
                                    </p>
                                )}
                            </div>
                            {!selectedCategory.is_default && (
                                <button
                                    onClick={openCreateFlashcardModal}
                                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-colors"
                                >
                                    <Sparkles className="w-5 h-5" />
                                    <span>Generate Flashcard</span>
                                </button>
                            )}
                        </div>

                        {flashcardsLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader className="w-12 h-12 animate-spin text-blue-600" />
                            </div>
                        ) : flashcards.length === 0 ? (
                            <div className="text-center py-12">
                                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 mb-4">No flashcards yet</p>
                                {!selectedCategory.is_default && (
                                    <button
                                        onClick={openCreateFlashcardModal}
                                        className="text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Create your first flashcard
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {flashcards.map((flashcard) => (
                                    <div
                                        key={flashcard._id}
                                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                    {flashcard.word}
                                                </h3>
                                                <p className="text-gray-600 mb-2">
                                                    {flashcard.translation}
                                                </p>
                                                {flashcard.short_description && (
                                                    <p className="text-sm text-gray-500 italic mb-2">
                                                        {flashcard.short_description}
                                                    </p>
                                                )}
                                            </div>
                                            {!selectedCategory.is_default && (
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => openEditFlashcardModal(flashcard)}
                                                        className="p-1 hover:bg-gray-100 rounded"
                                                    >
                                                        <Edit2 className="w-4 h-4 text-gray-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteFlashcard(flashcard._id)}
                                                        disabled={flashcardDeleting}
                                                        className="p-1 hover:bg-red-50 rounded disabled:opacity-50"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <span className="px-2 py-1 bg-gray-100 rounded">
                                                {flashcard.difficulty}
                                            </span>
                                            <span>
                                                {flashcard.times_practiced} practices
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Category Modal */}
            {showCategoryModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowCategoryModal(false);
                            setEditingCategory(null);
                        }
                    }}
                >
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editingCategory ? 'Edit Category' : 'New Category'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowCategoryModal(false);
                                    setEditingCategory(null);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    value={categoryForm.name}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={categoryForm.description}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows="3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Color
                                </label>
                                <input
                                    type="color"
                                    value={categoryForm.color}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                                    className="w-full h-12 px-2 border border-gray-300 rounded-lg cursor-pointer"
                                />
                            </div>

                            <div className="flex space-x-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCategoryModal(false);
                                        setEditingCategory(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={categoryCreating}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center justify-center"
                                >
                                    {categoryCreating ? (
                                        <Loader className="w-5 h-5 animate-spin" />
                                    ) : (
                                        editingCategory ? 'Update' : 'Create'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Flashcard Modal - Simple, just word input */}
            {showFlashcardModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !flashcardCreating) {
                            setShowFlashcardModal(false);
                            setEditingFlashcard(null);
                        }
                    }}
                >
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {editingFlashcard ? 'Edit Flashcard' : 'Generate Flashcard'}
                                    </h2>
                                    <p className="text-sm text-gray-600">AI will create everything for you</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    if (!flashcardCreating) {
                                        setShowFlashcardModal(false);
                                        setEditingFlashcard(null);
                                    }
                                }}
                                disabled={flashcardCreating}
                                className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateFlashcard} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter word or phrase *
                                </label>
                                <input
                                    type="text"
                                    value={flashcardForm.word}
                                    onChange={(e) => setFlashcardForm({ ...flashcardForm, word: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                                    placeholder="e.g., opportunity, to be, happy"
                                    required
                                    disabled={flashcardCreating}
                                    autoFocus
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    💡 AI will generate translation, transcription, explanation, and examples
                                </p>
                            </div>

                            <div className="flex space-x-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!flashcardCreating) {
                                            setShowFlashcardModal(false);
                                            setEditingFlashcard(null);
                                        }
                                    }}
                                    disabled={flashcardCreating}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={flashcardCreating || !flashcardForm.word.trim()}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg transition-colors flex items-center justify-center disabled:cursor-not-allowed font-semibold"
                                >
                                    {flashcardCreating ? (
                                        <>
                                            <Loader className="w-5 h-5 animate-spin mr-2" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5 mr-2" />
                                            Generate
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;