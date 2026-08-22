import { adminMetadata } from '@/app/admin/admin.metadata';
import AdminShell from '@/components/admin/AdminShell';
import Tools from '@/app/admin/tools/tools';
import { DEFAULT_TOOL_TAB } from '@/app/admin/tools/tools.constants';

export const metadata = adminMetadata('Tools', 'Backups and data health tools for Capital City Staging.');

interface PageProps {
    searchParams?: Promise<{
        tab?: string;
    }>;
}

export default async function AdminToolsPage(props: PageProps) {
    const searchParams = await props.searchParams;
    const activeTab = searchParams?.tab || DEFAULT_TOOL_TAB;

    return (
        <AdminShell title="Tools">
            <div className="flex w-full flex-col p-5 sm:p-8">
                <Tools activeTab={activeTab} />
            </div>
        </AdminShell>
    );
}
