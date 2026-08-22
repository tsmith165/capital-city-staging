import { adminMetadata } from '@/app/admin/admin.metadata';
import AdminShell from '@/components/admin/AdminShell';
import ManageConvexTabs from '@/app/admin/manage/ManageConvexTabs';

export const metadata = adminMetadata('Manage', 'Manage Capital City Staging site content.');

export default function ManagePage() {
    return (
        <AdminShell title="Manage">
            <ManageConvexTabs />
        </AdminShell>
    );
}
