import { AdminStatus } from '@/components/admin/AdminPrimitives';
import type { AdminStatusTone } from '@/components/admin/AdminShell.types';

import type { AvailabilitySummary } from './inventory.types';

/**
 * One-line answer to "can I use this, and if not, where is it?".
 *
 * Units on a finished job are called out separately from units on a live one. Both mean the chair is
 * in somebody's living room, but only one of them is a bookkeeping problem, and collapsing them is
 * how the catalog came to claim the whole warehouse was free.
 */

interface Descriptor {
    tone: AdminStatusTone;
    label: string;
}

export function describeAvailability(availability: AvailabilitySummary): Descriptor {
    const { owned, out, awaitingCheckIn, free, holderName, holderCount = 0 } = availability;

    if (owned === 0) return { tone: 'neutral', label: 'None owned' };

    if (awaitingCheckIn > 0) {
        /* The house is the useful part of this message — it is where she has to go looking. */
        const where = holderCount > 1 ? `${holderCount} finished jobs` : holderName;
        return { tone: 'warning', label: where ? `Not checked in · ${where}` : 'Not checked in' };
    }

    if (out > 0 && free === 0) {
        const where = holderCount > 1 ? `${holderCount} houses` : holderName;
        return { tone: 'info', label: where ? `Out · ${where}` : 'Out' };
    }

    if (out > 0) return { tone: 'info', label: `${free} free · ${out} out` };

    return { tone: 'good', label: owned === 1 ? 'Free' : `${free} free` };
}

export default function AvailabilityBadge({ availability }: { availability: AvailabilitySummary }) {
    const { tone, label } = describeAvailability(availability);
    return <AdminStatus tone={tone}>{label}</AdminStatus>;
}
