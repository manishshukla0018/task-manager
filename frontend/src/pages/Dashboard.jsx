import { useEffect, useState } from 'react';
import api from '../api/axios';
import { CheckCircle2, Clock, AlertCircle, ListTodo } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, done: 0, inProgress: 0, overdue: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await api.get('/tasks');
        
        let done = 0;
        let inProgress = 0;
        let overdue = 0;
        const now = new Date();

        data.forEach(task => {
          if (task.status === 'Done') done++;
          if (task.status === 'In Progress') inProgress++;
          if (task.dueDate && new Date(task.dueDate) < now && task.status !== 'Done') overdue++;
        });

        setStats({ total: data.length, done, inProgress, overdue });
        setRecentTasks(data.slice(0, 5)); // Get 5 most recent
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

  const statCards = [
    { title: 'Total Tasks', value: stats.total, icon: ListTodo, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { title: 'Completed', value: stats.done, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5 flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${card.bg}`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">{card.title}</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{card.value}</dd>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white shadow rounded-lg mt-8">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Tasks</h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {recentTasks.length === 0 ? (
            <li className="px-4 py-8 text-center text-gray-500">No tasks found. Create a project and add some tasks!</li>
          ) : (
            recentTasks.map((task) => (
              <li key={task._id} className="px-4 py-4 flex items-center justify-between sm:px-6">
                <div>
                  <p className="text-sm font-medium text-brand-600 truncate">{task.title}</p>
                  <p className="text-sm text-gray-500">{task.projectId?.name || 'Unknown Project'}</p>
                </div>
                <div className="flex flex-col items-end">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                     ${task.status === 'Done' ? 'bg-green-100 text-green-800' : 
                       task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                     {task.status}
                   </span>
                   {task.dueDate && (
                     <span className={`text-xs mt-1 ${new Date(task.dueDate) < new Date() && task.status !== 'Done' ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                       Due: {new Date(task.dueDate).toLocaleDateString()}
                     </span>
                   )}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
