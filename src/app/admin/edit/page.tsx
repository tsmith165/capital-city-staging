import { adminMetadata } from '@/app/admin/admin.metadata';
import AdminShell from '@/components/admin/AdminShell';

import EditInventoryEntry from './EditInventoryEntry';

export const metadata = adminMetadata('Edit item', 'Edit a piece of Capital City Staging inventory.');

export default function EditInventoryPage() {
    return (
        <AdminShell title="Edit item">
            <EditInventoryEntry />
        </AdminShell>
    );
}
