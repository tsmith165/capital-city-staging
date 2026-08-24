import { Suspense } from 'react';

import { adminMetadata } from '@/app/admin/admin.metadata';
import AdminShell from '@/components/admin/AdminShell';

import AdminProjectsClient from './AdminProjectsClient';

export const metadata = adminMetadata('Projects', 'Manage staging projects for Capital City Staging.');

export default function AdminProjectsPage() {
    return (
        <AdminShell title="Projects">
            <Suspense>
                <AdminProjectsClient />
            </Suspense>
        </AdminShell>
    );
}
