import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore.js";
import { BookOpen, LogOut, User, Settings } from "lucide-react";

const Navbar = () => {
    const { authUser, logout } = useAuthStore();

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/home" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">FlashEng</span>
                    </Link>

                    {/* User Menu */}
                    {authUser && (
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                {authUser.full_name}
                            </span>

                            {/* Role Badge */}
                            {authUser.role === 'admin' && (
                                <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full">
                                    Admin
                                </span>
                            )}

                            {/* Navigation Links */}
                            <Link
                                to="/profile"
                                className="text-gray-600 hover:text-blue-600 transition-colors"
                                title="Profile"
                            >
                                <User className="w-5 h-5" />
                            </Link>

                            <Link
                                to="/settings"
                                className="text-gray-600 hover:text-blue-600 transition-colors"
                                title="Settings"
                            >
                                <Settings className="w-5 h-5" />
                            </Link>

                            {/* Logout Button */}
                            <button
                                onClick={logout}
                                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;