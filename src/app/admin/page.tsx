import type { Metadata } from 'next';

import AdminDashboardClient from './AdminDashboardClient';

export const metadata: Metadata = {
    title: 'Today',
    description: 'Capital City Staging admin dashboard.',
    robots: { index: false, follow: false },
};

export default function AdminDashboardPage() {
    return <AdminDashboardClient />;
}
