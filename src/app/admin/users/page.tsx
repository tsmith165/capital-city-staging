import { adminMetadata } from '@/app/admin/admin.metadata';
import AdminShell from '@/components/admin/AdminShell';

import AdminUsersClient from './AdminUsersClient';

export const metadata = adminMetadata('Users', 'Manage accounts and roles for Capital City Staging.');

export default function AdminUsersPage() {
    return (
        <AdminShell title="Users">
            <AdminUsersClient />
        </AdminShell>
    );
}
