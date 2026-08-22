'use client';

import { useState } from 'react';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import { Download, Loader2 } from 'lucide-react';
import { useQuery } from 'convex/react';

import { api } from '@/convex/_generated/api';
import { SkeletonBlock } from '@/components/admin/AdminSkeleton';

const number = new Intl.NumberFormat('en-US');

type ExportState = { status: 'idle' | 'working' } | { status: 'done'; rows: number } | { status: 'error'; message: string };

export default function DataBackup() {
    const inventory = useQuery(api.inventory.getAllInventory);
    const [state, setState] = useState<ExportState>({ status: 'idle' });

    const isWorking = state.status === 'working';

    /*
     * Failures used to go to console.error only, so a broken export looked identical to a
     * successful one from the operator's side.
     */
    const exportInventory = async () => {
        if (!inventory?.length) return;
        setState({ status: 'working' });

        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Inventory');

            worksheet.columns = Object.keys(inventory[0]).map((key) => ({ header: key, key }));
            inventory.forEach((item) => worksheet.addRow(item));

            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(
                new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
                `capital-city-staging-inventory-${new Date().toISOString().slice(0, 10)}.xlsx`,
            );
            setState({ status: 'done', rows: inventory.length });
        } catch (error) {
            setState({ status: 'error', message: error instanceof Error ? error.message : 'The export could not be created.' });
        }
    };

    return (
        <div className="flex flex-col gap-4 p-5">
            <dl className="flex flex-wrap gap-x-8 gap-y-3">
                <div className="flex flex-col gap-1">
                    <dt className="text-body-subtle text-[10px] font-extrabold tracking-[0.14em] uppercase">Records</dt>
                    <dd className="font-display text-body text-2xl leading-none font-normal">
                        {inventory ? number.format(inventory.length) : <SkeletonBlock className="h-6 w-14" />}
                    </dd>
                </div>
                <div className="flex flex-col gap-1">
                    <dt className="text-body-subtle text-[10px] font-extrabold tracking-[0.14em] uppercase">Format</dt>
                    <dd className="font-display text-body text-2xl leading-none font-normal">XLSX</dd>
                </div>
            </dl>

            <p className="text-body-muted max-w-prose text-sm">
                One row per inventory item with every stored field, including items hidden from the public catalog. The file is built in
                your browser and never leaves this machine.
            </p>

            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={exportInventory}
                    disabled={isWorking || !inventory?.length}
                    className="bg-gold-400 text-body-inverse hover:bg-gold-300 disabled:bg-surface-hover disabled:text-body-subtle inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed"
                >
                    {isWorking ? (
                        <Loader2 size={16} aria-hidden="true" className="animate-spin" />
                    ) : (
                        <Download size={16} aria-hidden="true" />
                    )}
                    {isWorking ? 'Building the file…' : 'Export inventory'}
                </button>

                {inventory?.length === 0 && <span className="text-body-subtle text-sm">There is nothing in the catalog yet.</span>}
            </div>

            <p aria-live="polite" className="min-h-5 text-sm">
                {state.status === 'done' && <span className="text-success">Exported {number.format(state.rows)} records.</span>}
                {state.status === 'error' && <span className="text-danger">{state.message}</span>}
            </p>
        </div>
    );
}
