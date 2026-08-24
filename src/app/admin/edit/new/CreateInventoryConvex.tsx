'use client';

import { useRouter } from 'next/navigation';

import { AdminHeading, AdminPanel } from '@/components/admin/AdminPrimitives';
import CreateInventoryFields from '@/components/admin/inventory/CreateInventoryFields';

export default function CreateInventoryConvex() {
    const router = useRouter();

    return (
        <div className="flex flex-col gap-5 p-5 sm:p-8">
            <AdminHeading eyebrow="Catalog" title="New item" />

            <AdminPanel eyebrow="Photo and name" title="Add a piece">
                <div className="p-4">
                    <CreateInventoryFields
                        actions={['edit', 'view']}
                        onCreated={(inventoryId, action) =>
                            router.push(action === 'edit' ? `/admin/edit?item=${inventoryId}` : `/admin/inventory?item=${inventoryId}`)
                        }
                    />
                </div>
            </AdminPanel>
        </div>
    );
}
