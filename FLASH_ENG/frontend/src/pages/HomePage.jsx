import { useAuthStore } from "../store/useAuthStore.js";
import { BookOpen, Plus, BarChart3, Brain } from "lucide-react";

const HomePage = () => {
    const { authUser } = useAuthStore();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Welcome Section */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Welcome, {authUser?.full_name}!
                    </h1>
                    <p className="text-xl text-gray-600">
                        Start learning English with flashcards
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                            <Plus className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Flashcard</h3>
                        <p className="text-gray-600 text-sm">Add new words to learn</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                            <Brain className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Practice</h3>
                        <p className="text-gray-600 text-sm">Start learning session</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                            <BarChart3 className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Progress</h3>
                        <p className="text-gray-600 text-sm">View your statistics</p>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Statistics</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-blue-600 mb-2">0</div>
                            <div className="text-gray-600">Total Flashcards</div>
                        </div>

                        <div className="text-center">
                            <div className="text-4xl font-bold text-purple-600 mb-2">0</div>
                            <div className="text-gray-600">Practice Sessions</div>
                        </div>

                        <div className="text-center">
                            <div className="text-4xl font-bold text-green-600 mb-2">0%</div>
                            <div className="text-gray-600">Progress</div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>

                    <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No activity yet. Start creating flashcards!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;