import React from 'react';
import InventoryViewer from './InventoryViewer';
import { InventoryWithImages } from '@/db/schema';
import { ParsedParams } from './parsers';

interface InventoryPageProps {
    initialData: InventoryWithImages[];
    initialParams: ParsedParams;
}

export default function InventoryPage({ initialData, initialParams }: InventoryPageProps) {
    return <InventoryViewer items={initialData} initialParams={initialParams} />;
}
