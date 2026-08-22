import type { Metadata } from 'next';

import AdminInboxClient from './AdminInboxClient';

export const metadata: Metadata = {
    title: 'Inbox',
    description: 'Quote requests and messages from the Capital City Staging contact form.',
    robots: { index: false, follow: false },
};

export default function AdminInboxPage() {
    return <AdminInboxClient />;
}
