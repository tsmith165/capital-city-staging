import { adminMetadata } from '@/app/admin/admin.metadata';
import AdminShell from '@/components/admin/AdminShell';

import HomepageManageClient from './HomepageManageClient';

export const metadata = adminMetadata('Homepage', 'Manage the Capital City Staging homepage hero rotation.');

export default function ManageHomepagePage() {
    return (
        <AdminShell title="Homepage">
            <HomepageManageClient />
        </AdminShell>
    );
}
