'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';

import { SkeletonBlock, SkeletonTable } from '@/components/admin/AdminSkeleton';

const USER_COLUMNS = ['Name', 'Email', 'Role', 'Clerk ID', 'Created', 'Actions'] as const;

export default function AdminUsersClient() {
    const users = useQuery(api.users.getAllUsers);
    const updateUserRole = useMutation(api.users.updateUserRole);
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

    const handleRoleUpdate = async (userId: string, newRole: 'admin' | 'customer') => {
        setUpdatingUserId(userId);
        try {
            await updateUserRole({ userId: userId as any, role: newRole });
        } catch (error) {
            console.error('Error updating user role:', error);
            alert('Error updating user role');
        } finally {
            setUpdatingUserId(null);
        }
    };

    if (users === undefined) {
        return (
            <div className="container mx-auto p-4">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-body text-3xl font-bold">Manage Users</h1>
                    <SkeletonBlock className="h-3.5 w-28" />
                </div>
                <SkeletonTable headers={USER_COLUMNS} rows={6} label="Loading users" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-body text-3xl font-bold">Manage Users</h1>
                <div className="text-body-subtle text-sm">Total users: {users.length}</div>
            </div>

            {users.length === 0 ? (
                <div className="py-12 text-center">
                    <p className="text-body-subtle text-lg">No users found in Convex database.</p>
                    <p className="text-body-subtle mt-2 text-sm">
                        Users will be automatically synced when they sign in, or you can run the sync script.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="bg-surface-raised min-w-full rounded-lg">
                        <thead>
                            <tr className="border-line border-b">
                                <th className="text-body px-4 py-3 text-left">Name</th>
                                <th className="text-body px-4 py-3 text-left">Email</th>
                                <th className="text-body px-4 py-3 text-left">Role</th>
                                <th className="text-body px-4 py-3 text-left">Clerk ID</th>
                                <th className="text-body px-4 py-3 text-left">Created</th>
                                <th className="text-body px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id} className="border-line text-body-muted border-b">
                                    <td className="px-4 py-3">{user.name || <span className="text-body-subtle italic">No name</span>}</td>
                                    <td className="px-4 py-3 font-mono text-sm">{user.email}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`rounded px-2 py-1 text-xs font-medium ${
                                                user.role === 'admin' ? 'bg-red-600 text-white' : 'bg-secondary text-white'
                                            }`}
                                        >
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="text-body-subtle px-4 py-3 font-mono text-xs">{user.clerkId.substring(0, 20)}...</td>
                                    <td className="px-4 py-3 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => handleRoleUpdate(user._id, user.role === 'admin' ? 'customer' : 'admin')}
                                                disabled={updatingUserId === user._id}
                                                className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                                                    user.role === 'admin'
                                                        ? 'bg-secondary_light hover:bg-secondary text-white'
                                                        : 'bg-red-600 text-white hover:bg-red-700'
                                                } disabled:opacity-50`}
                                            >
                                                {updatingUserId === user._id
                                                    ? 'Updating...'
                                                    : user.role === 'admin'
                                                      ? 'Make Customer'
                                                      : 'Make Admin'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Instructions */}
            <div className="bg-surface-raised mt-8 rounded-lg p-4">
                <h3 className="text-body mb-2 text-lg font-bold">User Management Instructions</h3>
                <div className="text-body-subtle space-y-2 text-sm">
                    <p>
                        <strong className="text-body-muted">Automatic Sync:</strong> New users are automatically created when they sign in
                        via Clerk (webhook).
                    </p>
                    <p>
                        <strong className="text-body-muted">Manual Sync:</strong> To sync existing Clerk users, run:{' '}
                        <code className="bg-surface-overlay rounded px-1">pnpm run sync-users</code>
                    </p>
                    <p>
                        <strong className="text-body-muted">Roles:</strong> Admin users can create/edit projects and manage inventory.
                        Customers can only view their own projects.
                    </p>
                </div>
            </div>
        </div>
    );
}
