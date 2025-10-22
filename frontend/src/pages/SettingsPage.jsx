import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { axiosInstance } from "../lib/axios.js";
import { Settings, User, Shield, Loader } from "lucide-react";
import toast from "react-hot-toast";

const SettingsPage = () => {
    const { authUser } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        language_level: "beginner",
        ai_model: "gpt-3.5",
        voice_enabled: true,
        notifications_enabled: true
    });

    // Load settings when page opens
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axiosInstance.get("/settings", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setSettings(response.data);
        } catch (error) {
            console.error("Error loading settings:", error);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        // Prevent double click
        if (saving) return;

        setSaving(true);

        try {
            const token = localStorage.getItem('token');
            await axiosInstance.put("/settings", settings, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            toast.success("Settings saved successfully!");
        } catch (error) {
            console.error("Error saving settings:", error);
            const errorMessage = error.response?.data?.error || "Failed to save settings";
            toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader className="w-12 h-12 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Settings</h1>

                {/* General Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Settings className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">General Settings</h2>
                    </div>

                    <div className="space-y-6">
                        {/* Language Level */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                English Level
                            </label>
                            <select
                                value={settings.language_level}
                                onChange={(e) => setSettings({ ...settings, language_level: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                                disabled={saving}
                            >
                                <option value="beginner">Beginner (A1-A2)</option>
                                <option value="intermediate">Intermediate (B1-B2)</option>
                                <option value="advanced">Advanced (C1-C2)</option>
                            </select>
                        </div>

                        {/* AI Model */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                AI Model
                            </label>
                            <select
                                value={settings.ai_model}
                                onChange={(e) => setSettings({ ...settings, ai_model: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                                disabled={saving}
                            >
                                <option value="gpt-3.5">GPT-3.5</option>
                                <option value="gpt-4">GPT-4</option>
                            </select>
                        </div>

                        {/* Voice Enabled */}
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Voice Pronunciation
                                </label>
                                <p className="text-sm text-gray-600">
                                    Enable audio for word pronunciation
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSettings({ ...settings, voice_enabled: !settings.voice_enabled })}
                                disabled={saving}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                    settings.voice_enabled ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        settings.voice_enabled ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Notifications */}
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Notifications
                                </label>
                                <p className="text-sm text-gray-600">
                                    Receive learning reminders
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSettings({ ...settings, notifications_enabled: !settings.notifications_enabled })}
                                disabled={saving}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                    settings.notifications_enabled ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        settings.notifications_enabled ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Account Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <User className="w-5 h-5 text-purple-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Account</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Email</p>
                            <p className="text-lg font-semibold text-gray-900">{authUser?.email}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <p className="text-sm text-gray-600">Role:</p>
                            <div className="flex items-center space-x-2">
                                {authUser?.role === 'admin' && (
                                    <Shield className="w-4 h-4 text-purple-600" />
                                )}
                                <p className="text-lg font-semibold text-gray-900 capitalize">{authUser?.role}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        {saving ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <span>Save Settings</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;