'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';

import { SkeletonBlock, SkeletonTable } from '@/components/admin/AdminSkeleton';
import { AdminHeading, AdminStatus } from '@/components/admin/AdminPrimitives';
import type { Id } from '@/convex/_generated/dataModel';

const USER_COLUMNS = ['Name', 'Email', 'Role', 'Created', 'Actions'] as const;

export default function AdminUsersClient() {
    const users = useQuery(api.users.getAllUsers);
    const me = useQuery(api.users.getCurrentUser);
    const updateUserRole = useMutation(api.users.updateUserRole);
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const adminCount = (users ?? []).filter((user) => user.role === 'admin').length;

    const handleRoleUpdate = async (userId: Id<'users'>, newRole: 'admin' | 'customer') => {
        setUpdatingUserId(userId);
        setError(null);
        try {
            await updateUserRole({ userId, role: newRole });
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'That role change did not go through.');
        } finally {
            setUpdatingUserId(null);
        }
    };

    if (users === undefined) {
        return (
            <div className="flex flex-col gap-5 p-5 sm:p-8">
                <AdminHeading title="Users" />
                <SkeletonBlock className="h-3.5 w-28" />
                <SkeletonTable headers={USER_COLUMNS} rows={6} label="Loading users" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5 p-5 sm:p-8">
            <AdminHeading title="Users" description={`${users.length} ${users.length === 1 ? 'account' : 'accounts'}.`} />

            {error && (
                <p role="alert" className="border-danger bg-danger-soft text-danger rounded-lg border px-4 py-3 text-sm">
                    {error}
                </p>
            )}

            {users.length === 0 ? (
                <p className="text-body-subtle py-12 text-center text-sm">No users yet.</p>
            ) : (
                <div className="border-line bg-surface-raised overflow-x-auto rounded-lg border">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-line border-b">
                                {USER_COLUMNS.map((column) => (
                                    <th
                                        key={column}
                                        className={`text-body-subtle px-4 py-3 text-[10px] font-extrabold tracking-[0.14em] uppercase ${
                                            column === 'Actions' ? 'text-right' : 'text-left'
                                        }`}
                                    >
                                        {column}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => {
                                const isMe = me?._id === user._id;
                                const isLastAdmin = user.role === 'admin' && adminCount <= 1;
                                /* Mirrors the server guard so the control that would lock Mia out is never live. */
                                const lockedReason = isMe
                                    ? 'You cannot remove your own admin access.'
                                    : isLastAdmin
                                      ? 'The only admin account. Promote someone else first.'
                                      : null;
                                const demoting = user.role === 'admin';

                                return (
                                    <tr key={user._id} className="border-line text-body-muted border-b last:border-b-0">
                                        <td className="px-4 py-3 text-sm">
                                            {user.name || <span className="text-body-subtle italic">No name</span>}
                                            {isMe && <span className="text-body-subtle ml-2 text-xs">(you)</span>}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-sm">{user.email}</td>
                                        <td className="px-4 py-3">
                                            <AdminStatus tone={user.role === 'admin' ? 'good' : 'neutral'}>{user.role}</AdminStatus>
                                        </td>
                                        <td className="px-4 py-3 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => handleRoleUpdate(user._id, demoting ? 'customer' : 'admin')}
                                                disabled={updatingUserId === user._id || (demoting && lockedReason !== null)}
                                                title={demoting ? (lockedReason ?? undefined) : undefined}
                                                className="border-line bg-surface text-body hover:border-line-strong hover:bg-surface-hover rounded border px-3 py-1.5 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                {updatingUserId === user._id ? 'Saving' : demoting ? 'Make customer' : 'Make admin'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
