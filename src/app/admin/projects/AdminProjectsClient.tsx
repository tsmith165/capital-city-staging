'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Link from 'next/link';
import { Edit3, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Tooltip } from 'react-tooltip';

import { SkeletonBlock, SkeletonTable } from '@/components/admin/AdminSkeleton';

const PROJECT_COLUMNS = ['Order', 'Name', 'Status', 'Address', 'Started', 'Highlighted', 'Actions'] as const;

export default function AdminProjectsClient() {
    const projects = useQuery(api.projects.getAllProjects);
    const toggleHighlight = useMutation(api.projects.toggleProjectHighlight);
    const deleteProject = useMutation(api.projects.deleteProject);
    const moveProjectUp = useMutation(api.projects.moveProjectUp);
    const moveProjectDown = useMutation(api.projects.moveProjectDown);
    const moveProjectToFirst = useMutation(api.projects.moveProjectToFirst);
    const moveProjectToLast = useMutation(api.projects.moveProjectToLast);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    const handleToggleHighlight = async (projectId: string) => {
        try {
            await toggleHighlight({ projectId: projectId as any });
        } catch (error) {
            console.error('Error toggling highlight:', error);
        }
    };

    const handleDeleteProject = async (projectId: string) => {
        try {
            await deleteProject({ id: projectId as any });
            setShowDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    };

    const handleMoveUp = async (projectId: string, isFirst: boolean) => {
        console.log('Moving up:', { projectId, isFirst });
        try {
            if (isFirst) {
                console.log('Moving to last position');
                await moveProjectToLast({ projectId: projectId as any });
            } else {
                console.log('Moving up normally');
                await moveProjectUp({ projectId: projectId as any });
            }
            console.log('Move up completed');
        } catch (error) {
            console.error('Error moving project up:', error);
        }
    };

    const handleMoveDown = async (projectId: string, isLast: boolean) => {
        console.log('Moving down:', { projectId, isLast });
        try {
            if (isLast) {
                console.log('Moving to first position');
                await moveProjectToFirst({ projectId: projectId as any });
            } else {
                console.log('Moving down normally');
                await moveProjectDown({ projectId: projectId as any });
            }
            console.log('Move down completed');
        } catch (error) {
            console.error('Error moving project down:', error);
        }
    };

    if (projects === undefined) {
        return (
            <div className="container mx-auto p-4">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-body text-3xl font-bold">Manage Projects</h1>
                    <SkeletonBlock className="h-10 w-40 rounded" />
                </div>
                <SkeletonTable headers={PROJECT_COLUMNS} rows={6} label="Loading projects" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-body text-3xl font-bold">Manage Projects</h1>
                <Link
                    href="/admin/projects/new"
                    className="bg-primary hover:bg-primary_dark rounded px-4 py-2 text-white transition-colors"
                >
                    Create New Project
                </Link>
            </div>

            {projects.length === 0 ? (
                <div className="py-12 text-center">
                    <p className="text-body-subtle text-lg">No projects yet.</p>
                    <Link
                        href="/admin/projects/new"
                        className="bg-primary hover:bg-primary_dark mt-4 inline-block rounded px-6 py-3 text-white transition-colors"
                    >
                        Create Your First Project
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="bg-surface-raised min-w-full rounded-lg">
                        <thead>
                            <tr className="">
                                <th className="text-body px-4 py-3 text-center">Order</th>
                                <th className="text-body px-4 py-3 text-left">Name</th>
                                <th className="text-body px-4 py-3 text-left">Status</th>
                                <th className="text-body px-4 py-3 text-left">Address</th>
                                <th className="text-body px-4 py-3 text-left">Started</th>
                                <th className="text-body px-4 py-3 text-center">Highlighted</th>
                                <th className="text-body px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="">
                            {projects.map((project, index) => (
                                <tr key={project._id} className="border-line text-body-muted border-t">
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center">
                                            <button
                                                onClick={() => handleMoveUp(project._id, index === 0)}
                                                className="text-body-subtle hover:text-body hover:bg-surface-overlay rounded p-1 transition-colors"
                                                data-tooltip-id="move-up-tooltip"
                                                data-tooltip-content={index === 0 ? 'Move to Last' : 'Move Up'}
                                            >
                                                <ChevronUp size={16} />
                                            </button>
                                            <span className="w-8 text-center text-sm font-medium">{index + 1}</span>
                                            <button
                                                onClick={() => handleMoveDown(project._id, index === projects.length - 1)}
                                                className="text-body-subtle hover:text-body hover:bg-surface-overlay rounded p-1 transition-colors"
                                                data-tooltip-id="move-down-tooltip"
                                                data-tooltip-content={index === projects.length - 1 ? 'Move to First' : 'Move Down'}
                                            >
                                                <ChevronDown size={16} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-medium">{project.name}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`rounded px-2 py-1 text-xs font-medium ${
                                                project.status === 'active'
                                                    ? 'bg-secondary text-white'
                                                    : project.status === 'completed'
                                                      ? 'bg-blue-600 text-white'
                                                      : project.status === 'draft'
                                                        ? 'bg-gray-600 text-white'
                                                        : 'bg-red-600 text-white'
                                            }`}
                                        >
                                            {project.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{project.address || '-'}</td>
                                    <td className="px-4 py-3">
                                        {project.startDate ? new Date(project.startDate).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => handleToggleHighlight(project._id)}
                                            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                                                project.highlighted
                                                    ? 'bg-primary hover:bg-primary_dark text-white'
                                                    : 'bg-surface-hover text-body-muted hover:bg-stone-500'
                                            }`}
                                        >
                                            {project.highlighted ? 'Yes' : 'No'}
                                        </button>
                                    </td>
                                    <td className="relative px-4 py-3 text-center">
                                        <div className="flex justify-center gap-2">
                                            <Link
                                                href={`/admin/projects/${project._id}/edit`}
                                                className="hover:bg-surface-overlay rounded p-2 text-blue-400 transition-colors hover:text-blue-300"
                                                data-tooltip-id="edit-tooltip"
                                                data-tooltip-content="Edit Project"
                                            >
                                                <Edit3 size={18} />
                                            </Link>
                                            <Link
                                                href={`/admin/projects/${project._id}/inventory`}
                                                className="text-secondary_light hover:bg-surface-overlay hover:text-secondary rounded p-2 transition-colors"
                                                data-tooltip-id="inventory-tooltip"
                                                data-tooltip-content="Manage Inventory"
                                            >
                                                <Plus size={18} />
                                            </Link>
                                            <button
                                                onClick={() => setShowDeleteConfirm(project._id)}
                                                className="hover:bg-surface-overlay rounded p-2 text-red-400 transition-colors hover:text-red-300"
                                                data-tooltip-id="delete-tooltip"
                                                data-tooltip-content="Delete Project"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        {showDeleteConfirm === project._id && (
                                            <div className="border-line-strong bg-surface-overlay absolute top-full left-1/2 z-10 mt-2 min-w-64 -translate-x-1/2 transform rounded-lg border p-4 shadow-lg">
                                                <p className="text-body mb-3 text-sm">Are you sure you want to delete this project?</p>
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => setShowDeleteConfirm(null)}
                                                        className="bg-surface-hover text-body-muted rounded px-3 py-1 text-sm transition-colors hover:bg-stone-500"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProject(project._id)}
                                                        className="rounded bg-red-600 px-3 py-1 text-sm text-white transition-colors hover:bg-red-700"
                                                    >
                                                        Confirm
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Tooltip id="edit-tooltip" place="top" />
            <Tooltip id="inventory-tooltip" place="top" />
            <Tooltip id="delete-tooltip" place="top" />
            <Tooltip id="move-up-tooltip" place="top" />
            <Tooltip id="move-down-tooltip" place="top" />
        </div>
    );
}
