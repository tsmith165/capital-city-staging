import type { ComponentType } from 'react';
import Link from 'next/link';

import { AdminHeading, AdminPanel } from '@/components/admin/AdminPrimitives';

import DataBackup from './DataBackup';
import DataHealth from './DataHealth';
import ImageProcessing from './ImageProcessing';
import { TOOL_TABS } from './tools.constants';

const PANELS: Record<string, ComponentType> = {
    backup: DataBackup,
    health: DataHealth,
    images: ImageProcessing,
};

/**
 * The page used to be a fixed 80%-width box painted in the pre-overhaul palette, with the tab
 * strip nested two divs deep inside its own coloured header. It is an ordinary admin page now:
 * the standard heading, a tab row, and the selected tool in a panel.
 */
export default function Tools({ activeTab }: { activeTab: string }) {
    const tab = TOOL_TABS.find((candidate) => candidate.id === activeTab) ?? TOOL_TABS[0];
    const Panel = PANELS[tab.id];

    return (
        <div className="flex flex-col gap-8">
            <AdminHeading
                eyebrow="Maintenance"
                title="Tools"
                description="Exports and data-health utilities. Anything that runs automatically is listed here too, so you are not left wondering where it went."
            />

            <div className="flex flex-col gap-4">
                <nav className="flex flex-wrap gap-2" aria-label="Tools">
                    {TOOL_TABS.map((candidate) => {
                        const isActive = candidate.id === tab.id;

                        return (
                            <Link
                                key={candidate.id}
                                href={`/admin/tools?tab=${candidate.id}`}
                                aria-current={isActive ? 'page' : undefined}
                                className={`rounded-md border px-3.5 py-2 text-xs font-bold transition-colors ${
                                    isActive
                                        ? 'border-gold-400 bg-gold-400/10 text-gold-300'
                                        : 'border-line text-body-muted hover:bg-surface-raised hover:text-body'
                                }`}
                            >
                                {candidate.label}
                            </Link>
                        );
                    })}
                </nav>

                <AdminPanel eyebrow={tab.eyebrow} title={tab.title}>
                    <p className="border-line text-body-muted border-b px-5 py-3.5 text-sm">{tab.description}</p>
                    <Panel />
                </AdminPanel>
            </div>
        </div>
    );
}
