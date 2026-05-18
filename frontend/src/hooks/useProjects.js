import { useState, useEffect, useCallback } from 'react';
import { projectService } from '../services/projectService';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    try {
      setError(null);
      const { data } = await projectService.getAll();
      setProjects(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (form) => {
    await projectService.create(form);
    await fetchProjects();
  };

  return { projects, loading, error, refetch: fetchProjects, createProject };
}
