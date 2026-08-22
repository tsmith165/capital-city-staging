import { adminMetadata } from '@/app/admin/admin.metadata';
import AdminShell from '@/components/admin/AdminShell';

import NewProjectClient from './NewProjectClient';

export const metadata = adminMetadata('New project', 'Create a staging project for Capital City Staging.');

export default function NewProjectPage() {
    return (
        <AdminShell title="New project">
            <NewProjectClient />
        </AdminShell>
    );
}
