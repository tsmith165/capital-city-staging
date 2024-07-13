import { fetchInventory } from '@/app/actions';
import React from 'react';
import InventoryViewer from './InventoryViewer';

export default async function InventoryPage() {
    const inventoryData = await fetchInventory();

    return <InventoryViewer items={inventoryData} />;
}

export const revalidate = 60; // Revalidate this page every 60 seconds