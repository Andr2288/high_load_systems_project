import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { useCategoryStore } from "../store/useCategoryStore.js";
import { useFlashcardStore } from "../store/useFlashcardStore.js";
import {
    BookOpen,
    Languages,
    Shuffle,
    FileText,
    MessageSquare,
    Target,
    ArrowLeft,
    Check,
    X,
    Loader,
    Trophy,
    Clock,
    Sparkles
} from "lucide-react";
import toast from "react-hot-toast";

const EXERCISE_TYPES = [
    {
        id: "translation",
        name: "Translation Practice",
        description: "Choose the correct English translation",
        icon: Languages,
        color: "blue",
        available: true
    },
    {
        id: "matching",
        name: "Word Matching",
        description: "Match words with their definitions",
        icon: Shuffle,
        color: "purple",
        available: false
    },
    {
        id: "reading",
        name: "Reading Comprehension",
        description: "Read texts and answer questions",
        icon: FileText,
        color: "green",
        available: false
    },
    {
        id: "sentence",
        name: "Sentence Completion",
        description: "Fill in the missing words",
        icon: MessageSquare,
        color: "orange",
        available: false
    },
    {
        id: "listening",
        name: "Listening Practice",
        description: "Listen and type what you hear",
        icon: Target,
        color: "pink",
        available: false
    }
];

const ExercisesPage = () => {
    const { authUser } = useAuthStore();
    const { categories, fetchCategories } = useCategoryStore();
    const { fetchFlashcardsByCategory } = useFlashcardStore();

    const [selectedExercise, setSelectedExercise] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isStarting, setIsStarting] = useState(false);
    const [inSession, setInSession] = useState(false);

    // Session state
    const [sessionFlashcards, setSessionFlashcards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState("");
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [startTime, setStartTime] = useState(null);
    const [options, setOptions] = useState([]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Generate options when flashcard changes
    useEffect(() => {
        if (inSession && sessionFlashcards.length > 0 && selectedExercise?.id === "translation") {
            const currentFlashcard = sessionFlashcards[currentIndex];
            const correctAnswer = currentFlashcard.word;
            const wrongAnswers = sessionFlashcards
                .filter(card => card._id !== currentFlashcard._id)
                .map(card => card.word)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3);

            const allOptions = [correctAnswer, ...wrongAnswers];
            setOptions(allOptions.sort(() => Math.random() - 0.5));
        }
    }, [currentIndex, inSession, sessionFlashcards, selectedExercise]);

    const handleStartExercise = async () => {
        if (!selectedCategory) {
            toast.error("Please select a category first!");
            return;
        }

        setIsStarting(true);

        try {
            // Fetch flashcards from selected category
            const response = await fetchFlashcardsByCategory(selectedCategory._id);

            // Get flashcards from store
            const flashcards = response || [];

            if (flashcards.length === 0) {
                toast.error("This category has no flashcards yet!");
                setIsStarting(false);
                return;
            }

            // Shuffle flashcards
            const shuffled = [...flashcards].sort(() => Math.random() - 0.5);

            setSessionFlashcards(shuffled);
            setCurrentIndex(0);
            setScore({ correct: 0, total: 0 });
            setStartTime(Date.now());
            setInSession(true);

        } catch (error) {
            toast.error("Failed to start exercise");
        } finally {
            setIsStarting(false);
        }
    };

    const handleSubmitAnswer = (selectedAnswer) => {
        if (!selectedAnswer || !selectedAnswer.trim()) {
            return;
        }

        const currentFlashcard = sessionFlashcards[currentIndex];
        const correctAnswer = currentFlashcard.word.toLowerCase().trim();
        const answerLower = selectedAnswer.toLowerCase().trim();

        const correct = correctAnswer === answerLower;

        setUserAnswer(selectedAnswer);
        setIsCorrect(correct);
        setShowResult(true);

        if (correct) {
            setScore(prev => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }));
        } else {
            setScore(prev => ({ ...prev, total: prev.total + 1 }));
        }
    };

    const handleNextQuestion = () => {
        if (currentIndex < sessionFlashcards.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setUserAnswer("");
            setShowResult(false);
            setIsCorrect(false);
        } else {
            handleFinishSession();
        }
    };

    const handleFinishSession = () => {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        const percentage = Math.round((score.correct / score.total) * 100);

        toast.success(
            `Session completed! Score: ${score.correct}/${score.total} (${percentage}%)`,
            { duration: 5000 }
        );

        setInSession(false);
        setSelectedExercise(null);
        setSelectedCategory(null);
        setSessionFlashcards([]);
        setCurrentIndex(0);
        setUserAnswer("");
        setShowResult(false);
        setScore({ correct: 0, total: 0 });
        setOptions([]);
    };

    const handleExitSession = () => {
        if (window.confirm("Are you sure you want to exit? Your progress will be lost.")) {
            setInSession(false);
            setSelectedExercise(null);
            setSelectedCategory(null);
            setSessionFlashcards([]);
            setCurrentIndex(0);
            setUserAnswer("");
            setShowResult(false);
            setScore({ correct: 0, total: 0 });
            setOptions([]);
        }
    };

    // Render exercise session (Translation)
    if (inSession && selectedExercise?.id === "translation") {
        const currentFlashcard = sessionFlashcards[currentIndex];
        const progress = ((currentIndex + 1) / sessionFlashcards.length) * 100;

        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Header */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={handleExitSession}
                                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span>Exit</span>
                            </button>

                            <div className="flex items-center space-x-6">
                                <div className="flex items-center space-x-2">
                                    <Trophy className="w-5 h-5 text-yellow-500" />
                                    <span className="font-semibold text-gray-900">
                                        {score.correct}/{score.total}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Clock className="w-5 h-5 text-blue-500" />
                                    <span className="font-semibold text-gray-900">
                                        {currentIndex + 1}/{sessionFlashcards.length}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Question Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-6">
                        <div className="text-center mb-8">
                            <p className="text-sm text-gray-600 mb-2">Choose the correct translation:</p>
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                {currentFlashcard.translation.split(";")[0].trim()}
                            </h2>
                            <p className="text-sm text-gray-500">
                                (Ukrainian → English)
                            </p>
                        </div>

                        {!showResult ? (
                            <div className="max-w-2xl mx-auto space-y-4">
                                {options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSubmitAnswer(option)}
                                        className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left font-medium text-gray-900"
                                    >
                                        {String.fromCharCode(65 + index)}. {option}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="max-w-2xl mx-auto">
                                {/* Result */}
                                <div
                                    className={`p-6 rounded-xl mb-6 ${
                                        isCorrect
                                            ? "bg-green-50 border-2 border-green-500"
                                            : "bg-red-50 border-2 border-red-500"
                                    }`}
                                >
                                    <div className="flex items-center justify-center mb-4">
                                        {isCorrect ? (
                                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                                                <Check className="w-10 h-10 text-white" />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                                                <X className="w-10 h-10 text-white" />
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-center text-lg font-semibold mb-2">
                                        {isCorrect ? "Correct! 🎉" : "Not quite right"}
                                    </p>

                                    {!isCorrect && (
                                        <div className="text-center">
                                            <p className="text-sm text-gray-600 mb-1">You selected:</p>
                                            <p className="text-red-600 font-medium mb-3">{userAnswer}</p>
                                            <p className="text-sm text-gray-600 mb-1">Correct answer:</p>
                                            <p className="text-green-600 font-medium">
                                                {currentFlashcard.word}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Next Button */}
                                <button
                                    onClick={handleNextQuestion}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105"
                                >
                                    {currentIndex < sessionFlashcards.length - 1
                                        ? "Next Question →"
                                        : "Finish Session 🎉"}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Hint Card */}
                    {!showResult && currentFlashcard.short_description && (
                        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                            <p className="text-sm text-blue-600 font-semibold mb-2">💡 Hint:</p>
                            <p className="text-gray-700">{currentFlashcard.short_description}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Main exercises selection view
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Practice Exercises
                    </h1>
                    <p className="text-xl text-gray-600">
                        Choose an exercise type and start practicing!
                    </p>
                </div>

                {!selectedExercise ? (
                    // Exercise Types Grid
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {EXERCISE_TYPES.map((exercise) => {
                            const Icon = exercise.icon;
                            const colorClasses = {
                                blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
                                purple: "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
                                green: "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
                                orange: "from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
                                pink: "from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700"
                            };

                            return (
                                <div
                                    key={exercise.id}
                                    onClick={() => exercise.available && setSelectedExercise(exercise)}
                                    className={`relative bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-8 transition-all ${
                                        exercise.available
                                            ? "hover:border-gray-300 hover:shadow-lg cursor-pointer transform hover:scale-105"
                                            : "opacity-50 cursor-not-allowed"
                                    }`}
                                >
                                    {!exercise.available && (
                                        <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                                            Coming Soon
                                        </div>
                                    )}

                                    <div
                                        className={`w-16 h-16 bg-gradient-to-br ${colorClasses[exercise.color]} rounded-2xl flex items-center justify-center mb-4`}
                                    >
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {exercise.name}
                                    </h3>
                                    <p className="text-gray-600">
                                        {exercise.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    // Category Selection
                    <div>
                        <button
                            onClick={() => setSelectedExercise(null)}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Back to exercises</span>
                        </button>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
                            <div className="flex items-center space-x-4 mb-6">
                                <div
                                    className={`w-16 h-16 bg-gradient-to-br ${
                                        selectedExercise.color === "blue"
                                            ? "from-blue-500 to-blue-600"
                                            : "from-purple-500 to-purple-600"
                                    } rounded-2xl flex items-center justify-center`}
                                >
                                    {selectedExercise.icon && <selectedExercise.icon className="w-8 h-8 text-white" />}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {selectedExercise.name}
                                    </h2>
                                    <p className="text-gray-600">{selectedExercise.description}</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-6">
                                <label className="block text-lg font-semibold text-gray-900 mb-4">
                                    Select a category to practice:
                                </label>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {categories.map((category) => (
                                        <div
                                            key={category._id}
                                            onClick={() => setSelectedCategory(category)}
                                            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                                                selectedCategory?._id === category._id
                                                    ? "border-blue-500 bg-blue-50 shadow-md"
                                                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                                    style={{ backgroundColor: category.color + "20" }}
                                                >
                                                    <BookOpen
                                                        className="w-5 h-5"
                                                        style={{ color: category.color }}
                                                    />
                                                </div>
                                                {selectedCategory?._id === category._id && (
                                                    <Check className="w-6 h-6 text-blue-500" />
                                                )}
                                            </div>
                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                {category.name}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {category.flashcard_count} flashcards
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedCategory && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <button
                                        onClick={handleStartExercise}
                                        disabled={isStarting}
                                        className="w-full flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all transform hover:scale-105 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {isStarting ? (
                                            <>
                                                <Loader className="w-6 h-6 animate-spin" />
                                                <span>Starting...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-6 h-6" />
                                                <span>Start Practice</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExercisesPage;