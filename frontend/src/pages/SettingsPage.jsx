import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { Settings, User, Bell, Lock, Globe } from "lucide-react";

const SettingsPage = () => {
    const { authUser } = useAuthStore();
    const [settings, setSettings] = useState({
        languageLevel: "beginner",
        aiModel: "gpt-3.5",
        voiceEnabled: true,
        notificationsEnabled: true
    });

    const handleSave = () => {
        // Save settings logic here
        console.log("Settings saved:", settings);
    };

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
                                value={settings.languageLevel}
                                onChange={(e) => setSettings({ ...settings, languageLevel: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
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
                                value={settings.aiModel}
                                onChange={(e) => setSettings({ ...settings, aiModel: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
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
                                onClick={() => setSettings({ ...settings, voiceEnabled: !settings.voiceEnabled })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                                    settings.voiceEnabled ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        settings.voiceEnabled ? 'translate-x-6' : 'translate-x-1'
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
                                onClick={() => setSettings({ ...settings, notificationsEnabled: !settings.notificationsEnabled })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                                    settings.notificationsEnabled ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
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
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Role</p>
                            <p className="text-lg font-semibold text-gray-900 capitalize">{authUser?.role}</p>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors cursor-pointer"
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;