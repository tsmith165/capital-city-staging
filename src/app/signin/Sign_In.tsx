'use client';

import { SignIn } from '@clerk/nextjs';

const Sign_In = () => {
    return (
        <div className={'flex h-full w-full items-center justify-center bg-stone-950'}>
            <div className={'m-auto h-fit w-fit'}>
                <SignIn path="/signin" routing="path" signUpUrl="/signup" redirectUrl="/" />
            </div>
        </div>
    );
};

export default Sign_In;
