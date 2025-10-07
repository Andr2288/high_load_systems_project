import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { axiosInstance } from "../lib/axios.js";
import { Users, UserPlus, Shield, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const AdminPage = () => {
    const { authUser } = useAuthStore();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [togglingUserIds, setTogglingUserIds] = useState(new Set());
    const [isDeleting, setIsDeleting] = useState(false);
    const [newUser, setNewUser] = useState({
        fullName: "",
        email: "",
        password: "",
        role: "user"
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axiosInstance.get("/admin/users", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUsers(res.data.users);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();

        // Prevent double submission
        if (isCreating) return;

        setIsCreating(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axiosInstance.post("/admin/users", newUser, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Add new user to list immediately (optimistic update)
            const createdUser = response.data.user;
            setUsers(prevUsers => [...prevUsers, {
                ...createdUser,
                is_active: true,
                created_at: new Date().toISOString()
            }]);

            // Success - show toast and close modal
            toast.success("User created successfully!");

            setShowCreateModal(false);
            setNewUser({ fullName: "", email: "", password: "", role: "user" });

        } catch (error) {
            const errorMessage = error.response?.data?.error || "Failed to create user";
            toast.error(errorMessage);
        } finally {
            setIsCreating(false);
        }
    };

    const handleToggleUserStatus = async (userId, currentStatus) => {
        // Don't allow admin to deactivate themselves
        if (userId === authUser._id) {
            toast.error("You cannot deactivate your own account!");
            return;
        }

        // Add userId to set of toggling users
        setTogglingUserIds(prev => new Set(prev).add(userId));

        try {
            const token = localStorage.getItem('token');
            await axiosInstance.put(`/admin/users/${userId}/toggle-status`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Update user status in list
            setUsers(prevUsers => prevUsers.map(user =>
                user._id === userId
                    ? { ...user, is_active: !currentStatus }
                    : user
            ));

            toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);

        } catch (error) {
            const errorMessage = error.response?.data?.error || "Failed to update user status";
            toast.error(errorMessage);
        } finally {
            // Remove userId from set of toggling users
            setTogglingUserIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        setIsDeleting(true);

        try {
            const token = localStorage.getItem('token');
            await axiosInstance.delete(`/admin/users/${userToDelete._id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Remove user from list
            setUsers(prevUsers => prevUsers.filter(user => user._id !== userToDelete._id));

            toast.success("User deleted successfully!");
            setShowDeleteModal(false);
            setUserToDelete(null);

        } catch (error) {
            const errorMessage = error.response?.data?.error || "Failed to delete user";
            toast.error(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    const openDeleteModal = (user) => {
        // Don't allow admin to delete themselves
        if (user._id === authUser._id) {
            toast.error("You cannot delete your own account!");
            return;
        }

        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                Admin Dashboard
                            </h1>
                            <p className="text-xl text-gray-600">
                                Manage users and system
                            </p>
                        </div>

                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
                        >
                            <UserPlus className="w-5 h-5" />
                            <span>Create User</span>
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                                <p className="text-3xl font-bold text-gray-900">{users.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Admins</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {users.filter(u => u.role === 'admin').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Shield className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Regular Users</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {users.filter(u => u.role === 'user').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">All Users</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Actions
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {user.full_name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-600">
                                            {user.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                user.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {user.role}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                user.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleToggleUserStatus(user._id, user.is_active)}
                                                disabled={togglingUserIds.has(user._id) || user._id === authUser._id}
                                                className={`w-24 px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                                                    user.is_active
                                                        ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                                                } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
                                            >
                                                {togglingUserIds.has(user._id) ? (
                                                    <span className="flex items-center">
                                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                                                        </span>
                                                ) : (
                                                    user.is_active ? 'Deactivate' : 'Activate'
                                                )}
                                            </button>

                                            <button
                                                onClick={() => openDeleteModal(user)}
                                                disabled={user._id === authUser._id}
                                                className="w-20 px-3 py-1 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1 cursor-pointer"
                                                title="Delete user"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                <span>Delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create User Modal */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={(e) => {
                        // Close modal only if clicking on backdrop
                        if (e.target === e.currentTarget && !isCreating) {
                            setShowCreateModal(false);
                            setNewUser({ fullName: "", email: "", password: "", role: "user" });
                        }
                    }}
                >
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New User</h2>

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={newUser.fullName}
                                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                    disabled={isCreating}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                    disabled={isCreating}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                    minLength={6}
                                    disabled={isCreating}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Role
                                </label>
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    disabled={isCreating}
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="flex space-x-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setNewUser({ fullName: "", email: "", password: "", role: "user" });
                                    }}
                                    disabled={isCreating}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center justify-center disabled:cursor-not-allowed"
                                >
                                    {isCreating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        "Create User"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && userToDelete && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !isDeleting) {
                            setShowDeleteModal(false);
                            setUserToDelete(null);
                        }
                    }}
                >
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
                            <Trash2 className="w-8 h-8 text-red-600" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Delete User</h2>

                        <p className="text-gray-600 mb-2 text-center">
                            Are you sure you want to delete this user?
                        </p>

                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <p className="text-sm text-gray-600 mb-1">Name:</p>
                            <p className="font-semibold text-gray-900 mb-3">{userToDelete.full_name}</p>

                            <p className="text-sm text-gray-600 mb-1">Email:</p>
                            <p className="font-semibold text-gray-900">{userToDelete.email}</p>
                        </div>

                        <p className="text-red-600 text-sm text-center mb-6 font-medium">
                            ⚠️ This action cannot be undone!
                        </p>

                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setUserToDelete(null);
                                }}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors flex items-center justify-center disabled:cursor-not-allowed cursor-pointer"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
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

export default AdminPage;