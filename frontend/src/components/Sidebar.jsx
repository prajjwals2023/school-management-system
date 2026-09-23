import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  Award,
  Shield,
  Layers,
  ShieldAlert,
  UserCog,
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const isPrincipal = user.role === 'principal';

  const adminNav = [
    { name: 'Admin Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Manage Classes', path: '/admin/classes', icon: Layers },
    { name: 'User Management', path: '/admin/users', icon: UserCog },
  ];

  const principalNav = [
    { name: 'Principal Overview', path: '/principal', icon: LayoutDashboard },
    { name: 'Classes (1 – 10)', path: '/principal/classes', icon: Layers },
    { name: 'All Students Search', path: '/principal/students', icon: Users },
    { name: 'Faculty & Teachers', path: '/principal/teachers', icon: GraduationCap },
  ];

  const teacherNav = [
    { name: 'Class Dashboard', path: '/teacher', icon: LayoutDashboard },
    { name: 'My Class Students', path: '/teacher/students', icon: Users },
    { name: 'Mark Attendance', path: '/teacher/attendance', icon: CalendarCheck },
    { name: 'Student Marks', path: '/teacher/marks', icon: Award },
  ];

  const navLinks = isAdmin ? adminNav : isPrincipal ? principalNav : teacherNav;

  const sectionLabel = isAdmin
    ? 'System Governance'
    : isPrincipal
    ? 'School Management'
    : 'Class Portal';

  const rbacNotice = isAdmin
    ? 'Super Admin scope: Root management over all user accounts, classes, and system permissions.'
    : isPrincipal
    ? 'Principal scope: Unrestricted access to Class 1-10 data and school analytics.'
    : `Teacher scope: Strict backend isolation to ${user.assignedClass?.className || 'Assigned Class'}. Other classes forbidden.`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex shrink-0">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            {sectionLabel}
          </p>
          <nav className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/25'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Security Rule Card */}
        <div className="p-3.5 bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-1.5 text-blue-900 font-bold text-xs">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Strict RBAC Active</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {rbacNotice}
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
        Smart School OS v1.0
      </div>
    </aside>
  );
};

export default Sidebar;