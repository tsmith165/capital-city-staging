'use client';

import { useClerk } from '@clerk/nextjs';

const SignOutPage = () => {
    const { signOut } = useClerk();

    const handleSignOut = async () => {
        await signOut();
    };
    return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-neutral-900">
            <div className="m-auto h-fit w-fit">
                <button
                    className="rounded-md border-2 border-primary_dark bg-primary px-4 py-2 font-bold text-neutral-950 hover:border-primary hover:bg-secondary_dark hover:text-primary"
                    onClick={handleSignOut}
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default SignOutPage;