'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Link from 'next/link';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Tooltip } from 'react-tooltip';

export default function AdminProjectsClient() {
  const projects = useQuery(api.projects.getAllProjects);
  const toggleHighlight = useMutation(api.projects.toggleProjectHighlight);
  const deleteProject = useMutation(api.projects.deleteProject);
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

  if (projects === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-stone-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-stone-100">Manage Projects</h1>
        <Link
          href="/admin/projects/new"
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary_dark transition-colors"
        >
          Create New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-stone-400 text-lg">No projects yet.</p>
          <Link
            href="/admin/projects/new"
            className="inline-block mt-4 bg-primary text-white px-6 py-3 rounded hover:bg-primary_dark transition-colors"
          >
            Create Your First Project
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-stone-800 rounded-lg">
            <thead>
              <tr className="">
                <th className="px-4 py-3 text-left text-stone-200">Name</th>
                <th className="px-4 py-3 text-left text-stone-200">Status</th>
                <th className="px-4 py-3 text-left text-stone-200">Address</th>
                <th className="px-4 py-3 text-left text-stone-200">Created</th>
                <th className="px-4 py-3 text-center text-stone-200">Highlighted</th>
                <th className="px-4 py-3 text-center text-stone-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project._id} className="text-stone-300">
                  <td className="px-4 py-3 font-medium">{project.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
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
                    {new Date(project.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleHighlight(project._id)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        project.highlighted
                          ? 'bg-primary text-white hover:bg-primary_dark'
                          : 'bg-stone-600 text-stone-300 hover:bg-stone-500'
                      }`}
                    >
                      {project.highlighted ? 'Yes' : 'No'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center relative">
                    <div className="flex justify-center gap-2">
                      <Link
                        href={`/admin/projects/${project._id}/edit`}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-stone-700 rounded transition-colors"
                        data-tooltip-id="edit-tooltip"
                        data-tooltip-content="Edit Project"
                      >
                        <Edit3 size={18} />
                      </Link>
                      <Link
                        href={`/admin/projects/${project._id}/inventory`}
                        className="p-2 text-secondary_light hover:text-secondary hover:bg-stone-700 rounded transition-colors"
                        data-tooltip-id="inventory-tooltip"
                        data-tooltip-content="Manage Inventory"
                      >
                        <Plus size={18} />
                      </Link>
                      <button
                        onClick={() => setShowDeleteConfirm(project._id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-stone-700 rounded transition-colors"
                        data-tooltip-id="delete-tooltip"
                        data-tooltip-content="Delete Project"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    {showDeleteConfirm === project._id && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-stone-700 border border-stone-600 rounded-lg p-4 shadow-lg z-10 min-w-64">
                        <p className="text-stone-200 text-sm mb-3">Are you sure you want to delete this project?</p>
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="px-3 py-1 bg-stone-600 text-stone-300 rounded hover:bg-stone-500 transition-colors text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project._id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
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
    </div>
  );
}