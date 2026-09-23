import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StudentTable from '../components/StudentTable';
import {
  Users,
  GraduationCap,
  Layers,
  CalendarCheck,
  Search,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  Filter,
  Mail,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

const PrincipalDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classStudents, setClassStudents] = useState([]);

  // All Students Search state
  const [allStudents, setAllStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('');
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [loading, setLoading] = useState(true);

  // Determine current active tab from route pathname
  const currentTab = (() => {
    if (location.pathname.includes('/classes')) return 'classes';
    if (location.pathname.includes('/students')) return 'students';
    if (location.pathname.includes('/teachers')) return 'teachers';
    return 'overview';
  })();

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (currentTab === 'students') {
      fetchStudents(searchQuery, selectedClassFilter);
    } else if (currentTab === 'teachers') {
      fetchTeachers();
    }
  }, [currentTab, selectedClassFilter]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [statsRes, classesRes, teachersRes] = await Promise.all([
        api.get('/principal/stats'),
        api.get('/principal/classes'),
        api.get('/principal/teachers'),
      ]);
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (classesRes.data.success) setClasses(classesRes.data.data);
      if (teachersRes.data.success) setTeachers(teachersRes.data.data);
    } catch (err) {
      console.error('Failed to load initial principal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (query = '', classId = '') => {
    setLoadingStudents(true);
    try {
      let url = '/principal/students?';
      if (query) url += `search=${encodeURIComponent(query)}&`;
      if (classId) url += `classId=${encodeURIComponent(classId)}`;

      const res = await api.get(url);
      if (res.data.success) {
        setAllStudents(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/principal/teachers');
      if (res.data.success) {
        setTeachers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
    }
  };

  const handleSelectClass = async (cls) => {
    setSelectedClass(cls);
    try {
      const res = await api.get(`/principal/classes/${cls._id}/students`);
      if (res.data.success) {
        setClassStudents(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load class students:', err);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchStudents(val, selectedClassFilter);
  };

  const tabs = [
    { id: 'overview', name: 'Principal Overview', path: '/principal', icon: Users },
    { id: 'classes', name: 'Classes (1 – 10)', path: '/principal/classes', icon: Layers },
    { id: 'students', name: 'All Students Search', path: '/principal/students', icon: Search },
    { id: 'teachers', name: 'Faculty & Teachers', path: '/principal/teachers', icon: GraduationCap },
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
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100/70 text-purple-800 text-xs font-bold mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                Principal Administration System
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {currentTab === 'overview' && 'School Overview & Analytics'}
                {currentTab === 'classes' && 'All School Classes (1 – 10)'}
                {currentTab === 'students' && 'All Students Search & Directory'}
                {currentTab === 'teachers' && 'Faculty & Teaching Staff'}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Role-based scope: Full administrative oversight over all classes, students, and teachers.
              </p>
            </div>

            {/* Quick Tab Selector on Top */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm self-start sm:self-auto overflow-x-auto max-w-full">
              {tabs.map((tab) => {
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setSelectedClass(null);
                      navigate(tab.path);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
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

          {/* ======================================================== */}
          {/* VIEW 1: PRINCIPAL OVERVIEW                               */}
          {/* ======================================================== */}
          {currentTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Metric KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  onClick={() => navigate('/principal/students')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Users className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Total Students
                  </p>
                  <h3 className="text-2xl font-extrabold text-slate-900">
                    {stats ? stats.totalStudents : '...'}
                  </h3>
                  <span className="text-[11px] text-blue-600 font-bold flex items-center gap-1 mt-1">
                    Search students <ArrowRight className="w-3 h-3" />
                  </span>
                </div>

                <div
                  onClick={() => navigate('/principal/teachers')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-400 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Total Faculty
                  </p>
                  <h3 className="text-2xl font-extrabold text-slate-900">
                    {stats ? stats.totalTeachers : '...'}
                  </h3>
                  <span className="text-[11px] text-purple-600 font-bold flex items-center gap-1 mt-1">
                    View faculty <ArrowRight className="w-3 h-3" />
                  </span>
                </div>

                <div
                  onClick={() => navigate('/principal/classes')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-400 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <Layers className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Total Classes
                  </p>
                  <h3 className="text-2xl font-extrabold text-slate-900">
                    {stats ? stats.totalClasses : '10'}
                  </h3>
                  <span className="text-[11px] text-amber-600 font-bold flex items-center gap-1 mt-1">
                    Class 1 to 10 <ArrowRight className="w-3 h-3" />
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mb-3">
                    <CalendarCheck className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Attendance Rate
                  </p>
                  <h3 className="text-2xl font-extrabold text-slate-900">
                    {stats ? `${stats.overallAttendanceRate}%` : '...'}
                  </h3>
                  <span className="text-[11px] text-emerald-600 font-medium">School Average</span>
                </div>
              </div>

              {/* Class Attendance Comparison Bar Chart */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Class-Wise Attendance Performance
                    </h3>
                    <p className="text-xs text-slate-500">
                      Overall recorded attendance rates across Class 1 through Class 10.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/principal/classes')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    View All Classes <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {classes.map((cls) => {
                    const rate = cls.attendanceRate ?? 90;
                    return (
                      <div key={cls._id} className="flex items-center gap-4 text-xs">
                        <span className="w-20 font-bold text-slate-700">{cls.className}</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${rate}%` }}
                          ></div>
                        </div>
                        <span className="w-12 font-bold text-slate-900 text-right">{rate}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 2: CLASSES (1 – 10)                                 */}
          {/* ======================================================== */}
          {currentTab === 'classes' && (
            <div className="animate-in fade-in duration-200">
              {/* If a class is clicked: show class drill-down roster */}
              {selectedClass ? (
                <div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <button
                          onClick={() => setSelectedClass(null)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-2 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" /> Back to Class Grid
                        </button>
                        <h2 className="text-xl font-bold text-slate-900">
                          {selectedClass.className} — Section {selectedClass.section}
                        </h2>
                        <p className="text-xs text-slate-500">
                          Class Teacher: <span className="font-semibold text-slate-700">{selectedClass.teacher?.name || 'Unassigned'}</span> ({selectedClass.teacher?.email || 'N/A'})
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                          {classStudents.length} Students
                        </span>
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                          {selectedClass.attendanceRate}% Attendance
                        </span>
                      </div>
                    </div>
                  </div>

                  <StudentTable students={classStudents} />
                </div>
              ) : (
                /* Class 1-10 Grid */
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-blue-600" />
                      All Classes in School (Class 1 to Class 10)
                    </h2>
                    <p className="text-xs text-slate-400">Click any class card to view students</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {classes.map((cls) => (
                      <div
                        key={cls._id}
                        onClick={() => handleSelectClass(cls)}
                        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              {cls.className.replace('Class ', '')}
                            </span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              Sec {cls.section}
                            </span>
                          </div>

                          <h3 className="font-bold text-slate-800 text-base group-hover:text-blue-600 transition-colors">
                            {cls.className}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">
                            {cls.teacher ? cls.teacher.name : 'No Teacher'}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700">
                            {cls.studentCount} Students
                          </span>
                          <span className="text-blue-600 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Open <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 3: ALL STUDENTS SEARCH                              */}
          {/* ======================================================== */}
          {currentTab === 'students' && (
            <div className="animate-in fade-in duration-200">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Search Input */}
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search by student name, ID, phone..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                  />
                </div>

                {/* Filter by Class Dropdown */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={selectedClassFilter}
                    onChange={(e) => setSelectedClassFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">All Classes (Class 1 to 10)</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.className} - Sec {cls.section}
                      </option>
                    ))}
                  </select>

                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-2 rounded-xl">
                    {allStudents.length} Students
                  </span>
                </div>
              </div>

              {loadingStudents ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs text-slate-500">Searching students...</p>
                </div>
              ) : (
                <StudentTable students={allStudents} />
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 4: FACULTY & TEACHERS                               */}
          {/* ======================================================== */}
          {currentTab === 'teachers' && (
            <div className="animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-purple-600" />
                    School Faculty Directory ({teachers.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Teaching staff assigned to respective classes with strict class-level isolation.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teachers.map((t) => (
                  <div
                    key={t._id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                          {t.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs">
                          {t.classId ? `${t.classId.className}-${t.classId.section}` : 'Unassigned'}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base">{t.name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> {t.email}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">
                        Assigned: <strong className="text-slate-800">{t.studentCount || 0} students</strong>
                      </span>
                      {t.classId && (
                        <button
                          onClick={() => {
                            const foundClass = classes.find((c) => c._id === t.classId._id);
                            if (foundClass) {
                              navigate('/principal/classes');
                              handleSelectClass(foundClass);
                            }
                          }}
                          className="text-blue-600 font-bold hover:text-blue-700"
                        >
                          View Class →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PrincipalDashboard;