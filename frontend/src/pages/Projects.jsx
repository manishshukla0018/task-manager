import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { useProjects } from '../hooks/useProjects';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

export default function Projects() {
  const { isAdmin } = useAuth();
  const { projects, loading, createProject } = useProjects();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createProject(form);
      toast.success('Project created');
      setModalOpen(false);
      setForm({ name: '', description: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">Manage your team projects</p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
          >
            + New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description={isAdmin ? 'Create your first project to get started.' : 'You have not been added to any projects yet.'}
          action={
            isAdmin && (
              <button type="button" onClick={() => setModalOpen(true)} className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg">
                Create Project
              </button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project._id}
              to={`/projects/${project._id}`}
              className="block bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-primary-300 transition-all"
            >
              <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">{project.description || 'No description'}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                <span>{project.members?.length || 0} members</span>
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-60">
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
