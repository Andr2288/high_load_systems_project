import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar.jsx";

import HomePage from "./pages/HomePage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import LandingPage from "./pages/LandingPage.jsx";

import { useAuthStore } from "./store/useAuthStore.js";
import { useEffect } from "react";

import { Loader } from "lucide-react";

const App = () => {
    const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
    const location = useLocation();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (isCheckingAuth && !authUser) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <Loader className="size-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-center" />

            {location.pathname !== "/" && authUser && <Navbar />}

            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route
                    path="/signup"
                    element={!authUser ? <SignUpPage /> : <Navigate to="/home" />}
                />
                <Route
                    path="/login"
                    element={!authUser ? <LoginPage /> : <Navigate to="/home" />}
                />

                {/* Protected Routes */}
                <Route
                    path="/home"
                    element={
                        authUser
                            ? (authUser.role === 'admin' ? <AdminPage /> : <HomePage />)
                            : <Navigate to="/login" />
                    }
                />
                <Route
                    path="/profile"
                    element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
                />
                <Route
                    path="/settings"
                    element={authUser ? <SettingsPage /> : <Navigate to="/login" />}
                />

                {/* Admin Only Routes */}
                <Route
                    path="/admin"
                    element={
                        authUser && authUser.role === 'admin'
                            ? <AdminPage />
                            : <Navigate to="/home" />
                    }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </div>
    );
};

export default App;