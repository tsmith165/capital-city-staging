import type { Metadata } from 'next';
import { authMetadata } from '@/components/auth/auth.metadata';
export const metadata: Metadata = authMetadata('Profile', 'Manage your Capital City Staging account.');

import PageLayout from '@/components/layout/PageLayout';
import Profile from '@/app/profile/profile';

export default async function Page() {
    return (
        <PageLayout page="/profile">
            <Profile />
        </PageLayout>
    );
}
