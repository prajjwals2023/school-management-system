import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, GraduationCap, ShieldCheck, UserCheck, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
              Smart School System
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">Role-Based Access Control</p>
          </div>
        </div>

        {/* User Info & Actions */}
        {user && (
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Role Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold">
              {user.role === 'admin' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 shadow-sm font-bold">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  Super Admin
                </span>
              ) : user.role === 'principal' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 shadow-sm font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  Principal
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm font-bold">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Teacher {user.assignedClass ? `(${user.assignedClass.className}-${user.assignedClass.section})` : ''}
                </span>
              )}
            </div>

            {/* Profile Info */}
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;