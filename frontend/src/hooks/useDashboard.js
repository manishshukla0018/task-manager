import { useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';

export function useDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setError(null);
      const { data } = await taskService.getDashboardStats();
      setStats(data.data);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const updateTaskStatus = async (taskId, status) => {
    await taskService.update(taskId, { status });
    await fetchStats();
  };

  return { stats, loading, error, refetch: fetchStats, updateTaskStatus };
}
