import { adminMetadata } from '@/app/admin/admin.metadata';
import AdminShell from '@/components/admin/AdminShell';

import ProjectInventoryClient from './ProjectInventoryClient';

export const metadata = adminMetadata('Project inventory', 'Assign inventory to a staging project.');

export default async function ProjectInventoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <AdminShell title="Project inventory">
            <ProjectInventoryClient projectId={id} />
        </AdminShell>
    );
}
