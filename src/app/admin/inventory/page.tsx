import { adminMetadata } from '@/app/admin/admin.metadata';
import AdminShell from '@/components/admin/AdminShell';

import InventoryConvexClient from './InventoryConvexClient';

export const metadata = adminMetadata('Inventory', 'Manage the Capital City Staging furniture and decor catalog.');

export default function InventoryPage() {
    return (
        <AdminShell title="Inventory">
            <InventoryConvexClient />
        </AdminShell>
    );
}
