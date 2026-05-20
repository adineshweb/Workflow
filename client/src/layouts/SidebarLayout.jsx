import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import {
  LayoutDashboard,
  PlusCircle,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  User,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import clsx from 'clsx';

const SidebarLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Define navigation based on user roles
  const getNavLinks = (role) => {
    switch (role) {
      case 'Admin':
        return [
          {
            label: 'Admin Dashboard',
            path: '/dashboard/admin',
            icon: LayoutDashboard,
          },
        ];
      case 'Manager':
        return [
          {
            label: 'Manager Dashboard',
            path: '/dashboard/manager',
            icon: LayoutDashboard,
          },
        ];
      case 'User':
      default:
        return [
          {
            label: 'User Dashboard',
            path: '/dashboard/user',
            icon: LayoutDashboard,
          },
          {
            label: 'Create Request',
            path: '/request/create',
            icon: PlusCircle,
          },
        ];
    }
  };

  const navLinks = getNavLinks(user?.role);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Back Drop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar Container */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-brand-950 text-slate-200 transition-transform duration-300 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-brand-900 bg-brand-950">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-white shadow-md shadow-brand-500/20">
              <ShieldAlert size={20} />
            </span>
            <span className="font-sans text-lg font-bold tracking-tight text-white">
              WorkFlow <span className="text-brand-400">Hub</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-brand-300 hover:bg-brand-900 hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          <div className="text-xxs font-bold uppercase tracking-wider text-brand-500 px-3 mb-2">
            Workspace
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={clsx(
                  'flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition-all group',
                  isActive
                    ? 'bg-brand-800 text-white font-bold'
                    : 'text-brand-300 hover:bg-brand-900/60 hover:text-white'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={clsx(
                      'transition-colors',
                      isActive ? 'text-white' : 'text-brand-450 group-hover:text-brand-300'
                    )}
                  />
                  <span>{link.label}</span>
                </div>
                <ChevronRight
                  size={14}
                  className={clsx(
                    'opacity-0 transition-all duration-150',
                    isActive ? 'opacity-100 translate-x-0' : 'group-hover:opacity-60 group-hover:translate-x-0.5'
                  )}
                />
              </Link>
            );
          })}
        </nav>

        {/* Sidebar User Profile info & Footer */}
        <div className="border-t border-brand-900 p-4 bg-brand-950/80">
          <div className="flex items-center gap-3 rounded-lg bg-brand-900/40 p-3 border border-brand-900/25">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-white font-bold text-sm shadow">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">
                {user?.name || 'Loading user...'}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="inline-flex items-center rounded-full bg-brand-950 px-2 py-0.5 text-xxs font-bold text-brand-300 border border-brand-850">
                  {user?.role || 'Guest'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-900 hover:bg-rose-950/80 hover:text-rose-200 border border-brand-850 py-2 text-xs font-semibold text-brand-300 transition-all"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-50 focus:outline-none lg:hidden"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 font-sans">
              {location.pathname.startsWith('/request/create')
                ? 'Create Request'
                : location.pathname.startsWith('/request/details')
                ? 'Request Detail View'
                : 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-medium text-slate-500 md:inline">
              Logged in as <span className="font-semibold text-slate-700">{user?.email}</span>
            </span>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
