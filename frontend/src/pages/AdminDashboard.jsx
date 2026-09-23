import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import {
  ShieldAlert,
  Users,
  GraduationCap,
  Layers,
  UserCheck,
  UserCog,
  PlusCircle,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Server,
  Activity,
} from 'lucide-react';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [classes, setClasses] = useState([]);
  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [classFormData, setClassFormData] = useState({
    className: '',
    section: 'A',
    teacherId: '',
  });

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'teacher',
    classId: '',
  });

  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const currentTab = (() => {
    if (location.pathname.includes('/classes')) return 'classes';
    if (location.pathname.includes('/users')) return 'users';
    return 'overview';
  })();

  useEffect(() => {
    fetchInitialData();
  }, [currentTab, selectedRoleFilter]);

  const fetchInitialData = async () => {
    setLoading(true);
    setFeedback({ type: '', message: '' });
    try {
      const [statsRes, classesRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/classes'),
        api.get(`/admin/users${selectedRoleFilter !== 'all' ? `?role=${selectedRoleFilter}` : ''}`),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (classesRes.data.success) setClasses(classesRes.data.data);
      if (usersRes.data.success) {
        setUsers(usersRes.data.data);
        setTeachers(usersRes.data.data.filter((u) => u.role === 'teacher'));
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Class Operations
  const handleOpenCreateClass = () => {
    setEditingClass(null);
    setClassFormData({ className: '', section: 'A', teacherId: '' });
    setFeedback({ type: '', message: '' });
    setIsClassModalOpen(true);
  };

  const handleOpenEditClass = (cls) => {
    setEditingClass(cls);
    setClassFormData({
      className: cls.className,
      section: cls.section,
      teacherId: cls.teacher ? cls.teacher._id : '',
    });
    setFeedback({ type: '', message: '' });
    setIsClassModalOpen(true);
  };

  const handleSaveClass = async (e) => {
    e.preventDefault();
    try {
      if (editingClass) {
        const res = await api.put(`/admin/classes/${editingClass._id}`, classFormData);
        if (res.data.success) {
          setFeedback({ type: 'success', message: 'Class updated and teacher reassigned!' });
          setIsClassModalOpen(false);
          fetchInitialData();
        }
      } else {
        const res = await api.post('/admin/classes', classFormData);
        if (res.data.success) {
          setFeedback({ type: 'success', message: 'New class created successfully!' });
          setIsClassModalOpen(false);
          fetchInitialData();
        }
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to save class' });
    }
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    try {
      const res = await api.delete(`/admin/classes/${classId}`);
      if (res.data.success) {
        setFeedback({ type: 'success', message: 'Class deleted successfully' });
        fetchInitialData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to delete class' });
    }
  };

  // User Operations
  const handleOpenCreateUser = () => {
    setEditingUser(null);
    setUserFormData({ name: '', email: '', password: '', role: 'teacher', classId: '' });
    setFeedback({ type: '', message: '' });
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (u) => {
    setEditingUser(u);
    setUserFormData({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      classId: u.classId ? u.classId._id : '',
    });
    setFeedback({ type: '', message: '' });
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const res = await api.put(`/admin/users/${editingUser._id}`, userFormData);
        if (res.data.success) {
          setFeedback({ type: 'success', message: 'User updated successfully!' });
          setIsUserModalOpen(false);
          fetchInitialData();
        }
      } else {
        const res = await api.post('/admin/users', userFormData);
        if (res.data.success) {
          setFeedback({ type: 'success', message: 'New user created successfully!' });
          setIsUserModalOpen(false);
          fetchInitialData();
        }
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to save user' });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user account?')) return;
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        setFeedback({ type: 'success', message: 'User account deleted successfully' });
        fetchInitialData();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to delete user' });
    }
  };

  const tabs = [
    { id: 'overview', name: 'Admin Overview', path: '/admin', icon: Activity },
    { id: 'classes', name: 'Manage Classes', path: '/admin/classes', icon: Layers },
    { id: 'users', name: 'User Management', path: '/admin/users', icon: UserCog },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {/* Header & Role Banner */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 text-amber-800 text-xs font-bold mb-2">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                Root System Administration Portal
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {currentTab === 'overview' && 'System Governance & Configuration'}
                {currentTab === 'classes' && 'Class & Section Management'}
                {currentTab === 'users' && 'School Accounts & Credentials'}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Root level access: Provision users, configure classes, reassign faculty, and monitor RBAC.
              </p>
            </div>

            {/* Quick Tab Selector */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm self-start sm:self-auto">
              {tabs.map((tab) => {
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => navigate(tab.path)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {tab.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback alert */}
          {feedback.message && (
            <div
              className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 text-xs font-bold ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* TAB 1: ADMIN OVERVIEW */}
          {currentTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  onClick={() => navigate('/admin/users')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Users className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Total System Users
                  </p>
                  <h3 className="text-2xl font-extrabold text-slate-900">
                    {stats ? stats.totalUsers : '...'}
                  </h3>
                  <span className="text-[11px] text-blue-600 font-bold flex items-center gap-1 mt-1">
                    Manage accounts <ArrowRight className="w-3 h-3" />
                  </span>
                </div>

                <div
                  onClick={() => navigate('/admin/classes')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-400 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <Layers className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Total Classes
                  </p>
                  <h3 className="text-2xl font-extrabold text-slate-900">
                    {stats ? stats.totalClasses : '...'}
                  </h3>
                  <span className="text-[11px] text-amber-600 font-bold flex items-center gap-1 mt-1">
                    Manage classes <ArrowRight className="w-3 h-3" />
                  </span>
                </div>

                <div
                  onClick={() => {
                    setSelectedRoleFilter('teacher');
                    navigate('/admin/users');
                  }}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Active Teachers
                  </p>
                  <h3 className="text-2xl font-extrabold text-slate-900">
                    {stats ? stats.totalTeachers : '...'}
                  </h3>
                  <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                    Faculty roles <ArrowRight className="w-3 h-3" />
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mb-3">
                    <Server className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    System Health
                  </p>
                  <h3 className="text-2xl font-extrabold text-slate-900">
                    {stats ? stats.systemStatus : 'Online'}
                  </h3>
                  <span className="text-[11px] text-purple-600 font-medium">RBAC Enforced</span>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-2">Admin Quick Actions</h3>
                <p className="text-xs text-slate-500 mb-5">
                  Frequently executed administrative commands and provisioning workflows.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleOpenCreateUser}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Create New User Account
                  </button>

                  <button
                    onClick={handleOpenCreateClass}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                  >
                    <Layers className="w-4 h-4" />
                    Add New Class / Section
                  </button>

                  <button
                    onClick={() => navigate('/admin/classes')}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-2"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    Reassign Class Teachers
                  </button>
                </div>
              </div>

              {/* Security & RBAC Matrix */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    System Role-Based Access Control (RBAC) Hierarchy
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
                    <span className="font-bold text-amber-900 block mb-1">Super Admin Role</span>
                    <p className="text-slate-600 leading-relaxed">
                      Root governance: Create & delete classes, manage all accounts (Admin, Principal, Teachers), reset passwords, and assign teachers to classrooms.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50">
                    <span className="font-bold text-purple-900 block mb-1">Principal Role</span>
                    <p className="text-slate-600 leading-relaxed">
                      Academic supervision: Oversight across Class 1 to 10, school-wide attendance, comprehensive exam performance, and student profiles.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                    <span className="font-bold text-emerald-900 block mb-1">Class Teacher Role</span>
                    <p className="text-slate-600 leading-relaxed">
                      Classroom instruction: Strictly scoped to assigned class. Mark daily attendance, record test marks, register students within their assigned class.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE CLASSES */}
          {currentTab === 'classes' && (
            <div className="animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Class Setup & Teacher Assignment ({classes.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage school classes, sections, and assign class teachers.
                  </p>
                </div>

                <button
                  onClick={handleOpenCreateClass}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add New Class
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Class</th>
                      <th className="py-3.5 px-4">Section</th>
                      <th className="py-3.5 px-4">Assigned Teacher</th>
                      <th className="py-3.5 px-4 text-center">Enrolled Students</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {classes.map((cls) => (
                      <tr key={cls._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800">{cls.className}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-600">
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-xs">
                            {cls.section}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {cls.teacher ? (
                            <div>
                              <p className="font-semibold text-slate-800 text-xs">{cls.teacher.name}</p>
                              <p className="text-[11px] text-slate-400">{cls.teacher.email}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                          {cls.studentCount} Students
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditClass(cls)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 text-xs font-bold transition-all"
                            >
                              Edit / Assign
                            </button>
                            <button
                              onClick={() => handleDeleteClass(cls._id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                              title="Delete Class"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: USER MANAGEMENT */}
          {currentTab === 'users' && (
            <div className="animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    System User Directory ({users.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage authentication accounts, roles, and classroom associations.
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <select
                    value={selectedRoleFilter}
                    onChange={(e) => setSelectedRoleFilter(e.target.value)}
                    className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admins</option>
                    <option value="principal">Principals</option>
                    <option value="teacher">Teachers</option>
                  </select>

                  <button
                    onClick={handleOpenCreateUser}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add User
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4">User</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Assigned Class</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {users.map((u) => {
                      let roleBadge = 'bg-slate-100 text-slate-700';
                      if (u.role === 'admin') roleBadge = 'bg-amber-50 text-amber-800 border-amber-200';
                      if (u.role === 'principal') roleBadge = 'bg-purple-50 text-purple-700 border-purple-200';
                      if (u.role === 'teacher') roleBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';

                      return (
                        <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs uppercase">
                                {u.name.split(' ').map((n) => n[0]).join('')}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800 text-xs">{u.name}</p>
                                <p className="text-[11px] text-slate-400">{u.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${roleBadge}`}>
                              {u.role.toUpperCase()}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">
                            {u.classId ? `${u.classId.className}-${u.classId.section}` : '—'}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditUser(u)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                title="Edit User"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u._id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Class Create / Edit Modal */}
      <Modal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        title={editingClass ? `Edit Class: ${editingClass.className}` : 'Create New Class'}
      >
        <form onSubmit={handleSaveClass} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Class Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Class 11"
              value={classFormData.className}
              onChange={(e) => setClassFormData({ ...classFormData, className: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Section</label>
            <input
              type="text"
              required
              placeholder="e.g. A"
              value={classFormData.section}
              onChange={(e) => setClassFormData({ ...classFormData, section: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Assign Class Teacher</label>
            <select
              value={classFormData.teacherId}
              onChange={(e) => setClassFormData({ ...classFormData, teacherId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500/20 bg-white"
            >
              <option value="">-- No Teacher (Unassigned) --</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.email})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsClassModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
            >
              {editingClass ? 'Update Class' : 'Create Class'}
            </button>
          </div>
        </form>
      </Modal>

      {/* User Create / Edit Modal */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title={editingUser ? `Edit User: ${editingUser.name}` : 'Create New System User'}
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Chandra"
              value={userFormData.name}
              onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. ramesh@school.com"
              value={userFormData.email}
              onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              {editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
            </label>
            <input
              type="password"
              required={!editingUser}
              placeholder={editingUser ? '••••••••' : 'Minimum 6 characters'}
              value={userFormData.password}
              onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Role</label>
            <select
              value={userFormData.role}
              onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500/20 bg-white"
            >
              <option value="teacher">Teacher</option>
              <option value="principal">Principal</option>
              <option value="admin">Super Admin</option>
            </select>
          </div>

          {userFormData.role === 'teacher' && (
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Assign Class</label>
              <select
                value={userFormData.classId}
                onChange={(e) => setUserFormData({ ...userFormData, classId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500/20 bg-white"
              >
                <option value="">-- No Class Assigned --</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.className} - Section {cls.section}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsUserModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
            >
              {editingUser ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
