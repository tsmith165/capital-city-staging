import type { Metadata } from 'next';

import InventoryAttentionClient from './InventoryAttentionClient';

export const metadata: Metadata = {
    title: 'Inventory needs attention',
    description: 'Active inventory with missing photos, dimensions, or pricing.',
    robots: { index: false, follow: false },
};

export default function InventoryAttentionPage() {
    return <InventoryAttentionClient />;
}
