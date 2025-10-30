import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore.js";
import { BookOpen, LogOut, User, Settings, Home, Shield, Users, Dumbbell } from "lucide-react";

const Navbar = () => {
    const { authUser, logout } = useAuthStore();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const menuItems = [
        {
            path: "/home",
            icon: Home,
            label: "Home",
            show: authUser?.role === 'user'
        },
        {
            path: "/home",
            icon: Users,
            label: "Users",
            show: authUser?.role === 'admin'
        },
        {
            path: "/exercises",
            icon: Dumbbell,
            label: "Exercises",
            show: authUser?.role === 'user'
        },
        {
            path: "/profile",
            icon: User,
            label: "Profile",
            show: true
        },
        {
            path: "/settings",
            icon: Settings,
            label: "Settings",
            show: true
        }
    ];

    return (
        <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200">
                <Link to="/home" className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-gray-900">FlashEng</span>
                </Link>
            </div>

            {/* User Info */}
            {authUser && (
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {authUser.full_name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {authUser.email}
                            </p>
                        </div>
                    </div>

                    {/* Role Badge */}
                    {authUser.role === 'admin' && (
                        <div className="mt-3 flex items-center space-x-2 px-3 py-1.5 bg-purple-50 rounded-lg">
                            <Shield className="w-4 h-4 text-purple-600" />
                            <span className="text-xs font-semibold text-purple-800">
                                Administrator
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Navigation Menu */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    if (!item.show) return null;

                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                                active
                                    ? 'bg-blue-50 text-blue-600 font-semibold'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors font-semibold cursor-pointer"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Navbar;