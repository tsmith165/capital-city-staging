import { adminMetadata } from '@/app/admin/admin.metadata';
import AdminShell from '@/components/admin/AdminShell';

import EditProjectClient from './EditProjectClient';

export const metadata = adminMetadata('Edit project', 'Edit staging project details for Capital City Staging.');

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <AdminShell title="Edit project">
            <EditProjectClient projectId={id} />
        </AdminShell>
    );
}
