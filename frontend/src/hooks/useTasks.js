import { useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';

export function useTasks(initialParams = {}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      const query = { ...params };
      if (query.myTasks) query.myTasks = 'true';
      Object.keys(query).forEach((k) => {
        if (query[k] === '' || query[k] == null) delete query[k];
      });
      const { data } = await taskService.getAll(query);
      setTasks(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const updateTaskStatus = async (taskId, status) => {
    await taskService.update(taskId, { status });
    await fetchTasks();
  };

  const createTask = async (form) => {
    await taskService.create(form);
    await fetchTasks();
  };

  const deleteTask = async (taskId) => {
    await taskService.delete(taskId);
    await fetchTasks();
  };

  return {
    tasks,
    loading,
    error,
    params,
    setParams,
    refetch: fetchTasks,
    updateTaskStatus,
    createTask,
    deleteTask,
  };
}
