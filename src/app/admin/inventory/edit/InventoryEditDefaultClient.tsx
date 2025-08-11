'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function InventoryEditDefaultClient() {
    const router = useRouter();
    const inventory = useQuery(api.inventory.getInventory, {});
    
    useEffect(() => {
        if (inventory && inventory.length > 0) {
            // Get the newest inventory item (highest pId)
            const newestItem = inventory.reduce((latest, current) => 
                current.pId > latest.pId ? current : latest
            );
            
            // Redirect to the old edit page with the newest item ID for now
            // TODO: Create new Convex-based inventory edit page
            router.replace(`/admin/edit?id=${newestItem.pId}`);
        } else if (inventory && inventory.length === 0) {
            // No inventory exists, redirect to create new inventory
            router.replace('/admin/inventory/new');
        }
    }, [inventory, router]);

    if (inventory === undefined) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-stone-300">Loading inventory...</div>
            </div>
        );
    }

    if (inventory.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-stone-300">No inventory found. Redirecting to create new inventory...</div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-stone-300">Redirecting to newest inventory item...</div>
        </div>
    );
}