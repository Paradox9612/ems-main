import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  DollarSign,
  FileText,
  LayoutDashboard,
  Menu,
  X,
  User,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut, user, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, adminOnly: true },
    { name: 'Employees', href: '/employees', icon: Users, adminOnly: true },
    { name: 'Attendance', href: '/attendance', icon: Clock },
    { name: 'Salary', href: '/Salary', icon: DollarSign },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'LeaveApplication', href: '/LeaveApplication', icon: Calendar },
  ];

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  const filteredNavigation = navigation.filter(
    (item) => !item.adminOnly || (item.adminOnly && isAdmin)
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
      >
        <div
          className="fixed inset-0 bg-gray-900/50"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed top-0 left-0 w-64 h-full bg-gray-800 text-white shadow-xl flex flex-col">
          {/* Sidebar header */}
          <div className="bg-teal-600 h-16 flex items-center justify-center relative">
            <h2 className="text-lg font-pacifico">
              <span className="text-xl">Employee</span>{' '}
              <span className="text-2xl font-bold">MS</span>
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-3 p-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 mt-4 space-y-1">
            {filteredNavigation.map((item) => {
              const isActive =
                item.href === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`block w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-teal-700 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Profile at bottom */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-gray-300">{user?.email}</div>
              </div>
            </div>
            {isAdmin && (
              <span className="mt-2 inline-block px-2 py-0.5 text-xs font-medium bg-white/20 rounded">
                Admin
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:fixed lg:w-64 lg:left-0 lg:top-0 lg:bottom-0 z-30">
        <div className="flex flex-col w-64 bg-gray-800 text-white h-full">
          {/* Sidebar header */}
          <div className="bg-teal-600 h-16 flex items-center justify-center">
            <h2 className="text-lg font-pacifico">
              <span className="text-xl">Employee</span>{' '}
              <span className="text-2xl font-bold">MS</span>
            </h2>
          </div>

          {/* Nav links */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 py-4 space-y-9">
              {filteredNavigation.map((item) => {
                const isActive =
                  item.href === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-teal-700 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Profile at bottom */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-gray-300">{user?.email}</div>
              </div>
            </div>
            {isAdmin && (
              <span className="mt-2 inline-block px-2 py-0.5 text-xs font-medium bg-white/20 rounded">
                Admin
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 min-h-screen lg:ml-64">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-teal-600 z-20 shadow-sm">
          <div className="flex items-center justify-between h-full px-4 lg:px-6 lg:pl-64">
            {/* Mobile menu button */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md hover:bg-teal-700 lg:hidden transition-colors text-white"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-white font-pacifico text-lg ml-2 lg:hidden">
                <span className="text-2xl">Employee</span>{' '}
                <span className="text-3xl font-bold">MS</span>
              </h1>
            </div>

            {/* Right side: Welcome + Logout */}
            <div className="flex items-center space-x-4">
              <span className="text-white  iteam-center font-medium hidden sm:inline">
                Welcome {isAdmin ? 'Admin' : 'Employee'}
              </span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium rounded-md bg-teal-800 text-white hover:bg-teal-900 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="pt-16 p-4">{children}</main>
      </div>
    </div>
  );
};