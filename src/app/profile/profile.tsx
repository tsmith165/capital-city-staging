import React from 'react';

import { UserProfile } from '@clerk/nextjs';

const Profile = () => {
    return (
        <div className="bg-surface h-full w-full overflow-y-scroll p-1">
            <UserProfile path="/profile" routing="path" />
        </div>
    );
};

export default Profile;
