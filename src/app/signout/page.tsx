import PageLayout from '@/components/layout/PageLayout';
import SignOut from '@/app/signout/SignOut';

export default async function Page() {
    return (
        <PageLayout page="/signup">
            <SignOut />
        </PageLayout>
    );
}

export const revalidate = 3600;
