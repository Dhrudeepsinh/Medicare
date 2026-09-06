import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, FileText, BarChart3,
  UserCircle, Settings, LogOut, Stethoscope, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/formatters';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/patients', label: 'Patients', icon: Users },
  { to: '/appointments', label: 'Appointments', icon: Calendar },
  { to: '/medical-records', label: 'Medical Records', icon: FileText },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
];

const bottomItems = [
  { to: '/profile', label: 'Profile', icon: UserCircle },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 h-full flex-shrink-0">
        <SidebarContent user={user} onLogout={handleLogout} />
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <Logo />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>
        <SidebarContent user={user} onLogout={handleLogout} showLogo={false} />
      </aside>
    </>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
        <Stethoscope size={18} className="text-white" />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-900 leading-none">MediCare</p>
        <p className="text-xs text-gray-400 leading-none mt-0.5">Doctor Portal</p>
      </div>
    </div>
  );
}

function SidebarContent({ user, onLogout, showLogo = true }) {
  return (
    <div className="flex flex-col h-full">
      {showLogo && (
        <div className="px-5 py-5 border-b border-gray-100">
          <Logo />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Main Menu</p>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}

        <div className="pt-4">
          <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</p>
          {bottomItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Doctor info + Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-blue-700">
                {getInitials(user.name)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.specialization}</p>
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          className="sidebar-link sidebar-link-inactive w-full text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}
