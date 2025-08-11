'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Link from 'next/link';

export default function AdminProjectsClient() {
  const projects = useQuery(api.projects.getAllProjects);
  const toggleHighlight = useMutation(api.projects.toggleProjectHighlight);

  const handleToggleHighlight = async (projectId: string) => {
    try {
      await toggleHighlight({ projectId: projectId as any });
    } catch (error) {
      console.error('Error toggling highlight:', error);
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
              <tr className="border-b border-stone-700">
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
                <tr key={project._id} className="border-b border-stone-700 text-stone-300">
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
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-3">
                      <Link
                        href={`/admin/projects/${project._id}/edit`}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/admin/projects/${project._id}/inventory`}
                        className="text-secondary_light hover:text-secondary transition-colors"
                      >
                        Inventory
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}