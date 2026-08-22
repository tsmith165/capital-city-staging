import { adminMetadata } from '@/app/admin/admin.metadata';
import AdminShell from '@/components/admin/AdminShell';

import ProjectEditDefaultClient from './ProjectEditDefaultClient';

export const metadata = adminMetadata('Edit project', 'Choose a staging project to edit.');

export default function ProjectEditDefaultPage() {
    return (
        <AdminShell title="Edit project">
            <ProjectEditDefaultClient />
        </AdminShell>
    );
}
