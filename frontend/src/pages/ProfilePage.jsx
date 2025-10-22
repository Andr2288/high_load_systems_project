import { useAuthStore } from "../store/useAuthStore.js";
import { User, Mail, Shield, Calendar } from "lucide-react";

const ProfilePage = () => {
    const { authUser } = useAuthStore();

    if (!authUser) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">My Profile</h1>

                {/* Profile Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>

                    {/* Content */}
                    <div className="px-8 py-6">
                        {/* Avatar */}
                        <div className="flex items-center mb-8 -mt-16">
                            <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                                <User className="w-12 h-12 text-gray-400" />
                            </div>
                            <div className="ml-6 mt-12">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {authUser.full_name}
                                </h2>
                                <p className="text-gray-600">{authUser.email}</p>
                            </div>
                        </div>

                        {/* Information Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div className="flex items-start space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Full Name</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {authUser.full_name}
                                    </p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-start space-x-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {authUser.email}
                                    </p>
                                </div>
                            </div>

                            {/* Role */}
                            <div className="flex items-start space-x-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Role</p>
                                    <p className="text-lg font-semibold text-gray-900 capitalize">
                                        {authUser.role}
                                    </p>
                                </div>
                            </div>

                            {/* Member Since */}
                            <div className="flex items-start space-x-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Calendar className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Member Since</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {new Date().toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Card */}
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Learning Statistics</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-blue-50 rounded-xl">
                            <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
                            <div className="text-gray-600">Total Flashcards</div>
                        </div>

                        <div className="text-center p-6 bg-purple-50 rounded-xl">
                            <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
                            <div className="text-gray-600">Sessions Completed</div>
                        </div>

                        <div className="text-center p-6 bg-green-50 rounded-xl">
                            <div className="text-3xl font-bold text-green-600 mb-2">0</div>
                            <div className="text-gray-600">Words Learned</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;