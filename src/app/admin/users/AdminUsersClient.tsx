'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-stone-300">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-stone-100">Manage Users</h1>
        <div className="text-sm text-stone-400">
          Total users: {users.length}
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-stone-400 text-lg">No users found in Convex database.</p>
          <p className="text-stone-500 text-sm mt-2">
            Users will be automatically synced when they sign in, or you can run the sync script.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-stone-800 rounded-lg">
            <thead>
              <tr className="border-b border-stone-700">
                <th className="px-4 py-3 text-left text-stone-200">Name</th>
                <th className="px-4 py-3 text-left text-stone-200">Email</th>
                <th className="px-4 py-3 text-left text-stone-200">Role</th>
                <th className="px-4 py-3 text-left text-stone-200">Clerk ID</th>
                <th className="px-4 py-3 text-left text-stone-200">Created</th>
                <th className="px-4 py-3 text-center text-stone-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-stone-700 text-stone-300">
                  <td className="px-4 py-3">
                    {user.name || (
                      <span className="text-stone-500 italic">No name</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-red-600 text-white'
                          : 'bg-secondary text-white'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-stone-400">
                    {user.clerkId.substring(0, 20)}...
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleRoleUpdate(user._id, user.role === 'admin' ? 'customer' : 'admin')}
                        disabled={updatingUserId === user._id}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          user.role === 'admin'
                            ? 'bg-secondary_light hover:bg-secondary text-white'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                        } disabled:opacity-50`}
                      >
                        {updatingUserId === user._id 
                          ? 'Updating...' 
                          : user.role === 'admin' 
                            ? 'Make Customer' 
                            : 'Make Admin'
                        }
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
      <div className="mt-8 p-4 bg-stone-800 rounded-lg">
        <h3 className="text-lg font-bold text-stone-200 mb-2">User Management Instructions</h3>
        <div className="space-y-2 text-sm text-stone-400">
          <p>
            <strong className="text-stone-300">Automatic Sync:</strong> New users are automatically 
            created when they sign in via Clerk (webhook).
          </p>
          <p>
            <strong className="text-stone-300">Manual Sync:</strong> To sync existing Clerk users, 
            run: <code className="bg-stone-700 px-1 rounded">pnpm run sync-users</code>
          </p>
          <p>
            <strong className="text-stone-300">Roles:</strong> Admin users can create/edit projects 
            and manage inventory. Customers can only view their own projects.
          </p>
        </div>
      </div>
    </div>
  );
}