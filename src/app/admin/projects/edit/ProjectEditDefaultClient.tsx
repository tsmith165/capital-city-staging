'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProjectEditDefaultClient() {
    const router = useRouter();
    const projects = useQuery(api.projects.getProjects, {});
    
    useEffect(() => {
        if (projects && projects.length > 0) {
            // Get the newest project (highest ID)
            const newestProject = projects.reduce((latest, current) => 
                current._creationTime > latest._creationTime ? current : latest
            );
            
            // Redirect to the specific project edit page
            router.replace(`/admin/projects/${newestProject._id}/edit`);
        } else if (projects && projects.length === 0) {
            // No projects exist, redirect to create new project
            router.replace('/admin/projects/new');
        }
    }, [projects, router]);

    if (projects === undefined) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-stone-300">Loading projects...</div>
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-stone-300">No projects found. Redirecting to create new project...</div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-stone-300">Redirecting to newest project...</div>
        </div>
    );
}