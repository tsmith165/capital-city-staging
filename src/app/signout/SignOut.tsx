'use client';

import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const SignOutPage = () => {
    const { signOut } = useClerk();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push('/signin');
    };
    return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-stone-950">
            <div className="m-auto h-fit w-fit">
                <button
                    className="rounded-md border-2 border-primary_dark bg-primary px-4 py-2 font-bold text-stone-950 hover:border-primary hover:bg-secondary_dark hover:text-primary"
                    onClick={handleSignOut}
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default SignOutPage;