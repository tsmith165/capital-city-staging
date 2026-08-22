import { adminMetadata } from '@/app/admin/admin.metadata';
import AdminShell from '@/components/admin/AdminShell';

import InventoryEditDefaultClient from './InventoryEditDefaultClient';

export const metadata = adminMetadata('Edit inventory', 'Choose an inventory item to edit.');

export default function InventoryEditDefaultPage() {
    return (
        <AdminShell title="Edit inventory">
            <InventoryEditDefaultClient />
        </AdminShell>
    );
}
