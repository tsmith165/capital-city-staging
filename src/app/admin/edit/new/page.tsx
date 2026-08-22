import { adminMetadata } from '@/app/admin/admin.metadata';
import AdminShell from '@/components/admin/AdminShell';
import CreateInventoryConvex from '@/app/admin/edit/new/CreateInventoryConvex';

export const metadata = adminMetadata('New inventory item', 'Add an item to the Capital City Staging catalog.');

export default function NewInventoryPage() {
    return (
        <AdminShell title="New inventory item">
            <CreateInventoryConvex />
        </AdminShell>
    );
}
