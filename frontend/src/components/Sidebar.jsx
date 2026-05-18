import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/projects', label: 'Projects', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
  { to: '/my-tasks', label: 'My Tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Logout failed');
    }
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`;

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white hidden lg:flex lg:flex-col">
        <div className="px-6 py-5 border-b border-gray-800">
          <h1 className="text-xl font-bold tracking-tight">Team Task Manager</h1>
          <p className="text-xs text-gray-400 mt-1 truncate">{user?.email}</p>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="h-9 w-9 rounded-full bg-primary-600 flex items-center justify-center text-sm font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.role}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg"
          >
            Sign out
          </button>
        </div>
      </aside>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-gray-900 border-t border-gray-800 flex justify-around py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1 text-xs ${isActive ? 'text-primary-400' : 'text-gray-400'}`
            }
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
