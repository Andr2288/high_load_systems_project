import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useFlashcardStore } from "../store/useFlashcardStore.js";
import { useAuthStore } from "../store/useAuthStore.js";
import { 
    ArrowLeft, 
    Volume2, 
    Edit, 
    Trash2, 
    RefreshCw, 
    Copy, 
    CheckCircle, 
    BookOpen, 
    MessageSquare, 
    Lightbulb,
    Loader
} from "lucide-react";
import toast from "react-hot-toast";

const FlashcardDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { authUser } = useAuthStore();
    const { 
        currentFlashcard, 
        isLoading, 
        isDeleting,
        fetchFlashcard, 
        deleteFlashcard, 
        clearCurrentFlashcard 
    } = useFlashcardStore();
    
    const [showTranslation, setShowTranslation] = useState(false);
    const [copiedField, setCopiedField] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        if (id) {
            fetchFlashcard(id);
        }
        
        return () => {
            clearCurrentFlashcard();
        };
    }, [id, fetchFlashcard, clearCurrentFlashcard]);

    const handleCopy = async (text, fieldName) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(fieldName);
            toast.success(`${fieldName} copied!`);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (error) {
            toast.error("Failed to copy to clipboard");
        }
    };

    const handleSpeak = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
        } else {
            toast.error("Speech synthesis not supported in this browser");
        }
    };

    const handleDelete = async () => {
        try {
            await deleteFlashcard(id);
            setShowDeleteModal(false);
            navigate(-1);
        } catch (error) {
            // Error handled in store
        }
    };

    const handleEdit = () => {
        // Navigate to edit mode (можна додати пізніше)
        toast.info("Edit functionality coming soon!");
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader className="w-12 h-12 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!currentFlashcard) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Flashcard not found</h2>
                    <p className="text-gray-600 mb-6">The flashcard you're looking for doesn't exist.</p>
                    <Link 
                        to="/home"
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Home</span>
                    </Link>
                </div>
            </div>
        );
    }

    const canEdit = !currentFlashcard.is_default;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back</span>
                    </button>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Flashcard Details
                            </h1>
                            <p className="text-gray-600">
                                Study this flashcard in detail
                            </p>
                        </div>
                        
                        {canEdit && (
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleEdit}
                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                    <span>Edit</span>
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    disabled={isDeleting}
                                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    {/* Word Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
                        <div className="text-center">
                            <div className="flex items-center justify-center space-x-4 mb-4">
                                <h2 className="text-5xl font-bold">
                                    {currentFlashcard.word}
                                </h2>
                                <button
                                    onClick={() => handleSpeak(currentFlashcard.word)}
                                    className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                                >
                                    <Volume2 className="w-6 h-6" />
                                </button>
                            </div>
                            
                            {currentFlashcard.transcription && (
                                <div className="flex items-center justify-center space-x-3">
                                    <p className="text-lg opacity-90 font-mono">
                                        {currentFlashcard.transcription}
                                    </p>
                                    <button
                                        onClick={() => handleCopy(currentFlashcard.transcription, "Transcription")}
                                        className="text-white/70 hover:text-white transition-colors"
                                    >
                                        {copiedField === "Transcription" ? (
                                            <CheckCircle className="w-5 h-5" />
                                        ) : (
                                            <Copy className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        {/* Translation Section */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                                    <MessageSquare className="w-5 h-5 text-blue-500" />
                                    <span>Translation</span>
                                </h3>
                                <button
                                    onClick={() => setShowTranslation(!showTranslation)}
                                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                                >
                                    {showTranslation ? "Hide" : "Show"} Translation
                                </button>
                            </div>
                            
                            {showTranslation && (
                                <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
                                    <div className="flex items-center justify-between">
                                        <p className="text-lg font-medium text-gray-900">
                                            {currentFlashcard.translation}
                                        </p>
                                        <button
                                            onClick={() => handleCopy(currentFlashcard.translation, "Translation")}
                                            className="text-blue-600 hover:text-blue-700 transition-colors"
                                        >
                                            {copiedField === "Translation" ? (
                                                <CheckCircle className="w-5 h-5" />
                                            ) : (
                                                <Copy className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Short Description */}
                        {currentFlashcard.short_description && (
                            <div className="mb-8">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                                    <span>Quick Description</span>
                                </h3>
                                <div className="bg-yellow-50 rounded-xl p-6 border-l-4 border-yellow-500">
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-700 italic">
                                            {currentFlashcard.short_description}
                                        </p>
                                        <button
                                            onClick={() => handleCopy(currentFlashcard.short_description, "Description")}
                                            className="text-yellow-600 hover:text-yellow-700 transition-colors"
                                        >
                                            {copiedField === "Description" ? (
                                                <CheckCircle className="w-5 h-5" />
                                            ) : (
                                                <Copy className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Explanation */}
                        {currentFlashcard.explanation && (
                            <div className="mb-8">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                    <BookOpen className="w-5 h-5 text-green-500" />
                                    <span>Detailed Explanation</span>
                                </h3>
                                <div className="bg-green-50 rounded-xl p-6 border-l-4 border-green-500">
                                    <div className="flex justify-end mb-3">
                                        <button
                                            onClick={() => handleCopy(currentFlashcard.explanation, "Explanation")}
                                            className="text-green-600 hover:text-green-700 transition-colors"
                                        >
                                            {copiedField === "Explanation" ? (
                                                <CheckCircle className="w-5 h-5" />
                                            ) : (
                                                <Copy className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                    <div className="prose prose-gray max-w-none">
                                        {currentFlashcard.explanation.split('\n\n').map((paragraph, index) => (
                                            <p key={index} className="text-gray-700 mb-4 leading-relaxed">
                                                {paragraph}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Examples */}
                        {currentFlashcard.examples && currentFlashcard.examples.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                    <MessageSquare className="w-5 h-5 text-purple-500" />
                                    <span>Example Sentences</span>
                                </h3>
                                <div className="space-y-4">
                                    {currentFlashcard.examples.map((example, index) => (
                                        <div key={index} className="bg-purple-50 rounded-xl p-6 border-l-4 border-purple-500">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <span className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                                            {index + 1}
                                                        </span>
                                                        <button
                                                            onClick={() => handleSpeak(example)}
                                                            className="text-purple-600 hover:text-purple-700 transition-colors"
                                                        >
                                                            <Volume2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                    <p className="text-gray-700 ml-11 leading-relaxed">
                                                        {example}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleCopy(example, `Example ${index + 1}`)}
                                                    className="text-purple-600 hover:text-purple-700 transition-colors ml-4"
                                                >
                                                    {copiedField === `Example ${index + 1}` ? (
                                                        <CheckCircle className="w-5 h-5" />
                                                    ) : (
                                                        <Copy className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gray-50 rounded-xl p-6 text-center">
                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                    {currentFlashcard.difficulty}
                                </div>
                                <div className="text-sm text-gray-600">Difficulty</div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-6 text-center">
                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                    {currentFlashcard.times_practiced || 0}
                                </div>
                                <div className="text-sm text-gray-600">Times Practiced</div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-6 text-center">
                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                    {currentFlashcard.times_correct || 0}
                                </div>
                                <div className="text-sm text-gray-600">Times Correct</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !isDeleting) {
                            setShowDeleteModal(false);
                        }
                    }}
                >
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                        <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
                            <Trash2 className="w-8 h-8 text-red-600" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Delete Flashcard</h2>

                        <p className="text-gray-600 mb-6 text-center">
                            Are you sure you want to delete this flashcard? This action cannot be undone.
                        </p>

                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <p className="font-semibold text-gray-900 text-center text-lg">
                                "{currentFlashcard.word}"
                            </p>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors flex items-center justify-center disabled:cursor-not-allowed"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin mr-2" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FlashcardDetailPage;