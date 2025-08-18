import { useState } from 'react';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

const DataBackup: React.FC = () => {
    const [isExporting, setIsExporting] = useState(false);
    const inventory = useQuery(api.inventory.getAllInventory);

    const exportPiecesAsXLSX = async () => {
        setIsExporting(true);
        try {
            if (!inventory) {
                console.log('Inventory data not loaded yet');
                setIsExporting(false);
                return;
            }

            if (inventory.length > 0) {
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Pieces');

                worksheet.columns = Object.keys(inventory[0]).map((key) => ({ header: key, key }));
                inventory.forEach((item) => worksheet.addRow(item));

                const buffer = await workbook.xlsx.writeBuffer();
                const data = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                saveAs(data, 'pieces.xlsx');
                console.log('Successfully exported pieces as XLSX');
            } else {
                console.log('No pieces found to export');
            }
        } catch (error) {
            console.error('Failed to export pieces:', error);
        }
        setIsExporting(false);
    };

    return (
        <div className="flex items-center justify-center">
            <button
                className="text-dark font-lato cursor-pointer rounded-md border-none bg-secondary_dark px-4 py-2 uppercase text-white hover:bg-primary_dark disabled:cursor-not-allowed disabled:opacity-50"
                onClick={exportPiecesAsXLSX}
                disabled={isExporting}
            >
                {isExporting ? 'Exporting...' : 'Export Pieces as XLSX'}
            </button>
        </div>
    );
};

export default DataBackup;
