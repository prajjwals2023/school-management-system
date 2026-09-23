import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import {
  Users,
  CalendarCheck,
  Award,
  UserCheck,
  UserX,
  ArrowRight,
  Lock,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClassData();
  }, []);

  const fetchClassData = async () => {
    setLoading(true);
    try {
      const [dashRes, studentsRes] = await Promise.all([
        api.get('/teacher/dashboard'),
        api.get('/teacher/students'),
      ]);

      if (dashRes.data.success) setDashboardData(dashRes.data.data);
      if (studentsRes.data.success) setRecentStudents(studentsRes.data.data);
    } catch (err) {
      console.error('Failed to load teacher class data:', err);
    } finally {
      setLoading(false);
    }
  };

  const total = dashboardData?.totalStudents || 0;
  const present = dashboardData?.presentToday || 0;
  const absent = dashboardData?.absentToday || 0;
  const rate = dashboardData?.attendancePercentage ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {/* Assigned Class Banner */}
          <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/15 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-white/5 pointer-events-none"></div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur-sm mb-3">
                  <Lock className="w-3.5 h-3.5" /> Assigned Class Portal
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {dashboardData?.classInfo
                    ? `${dashboardData.classInfo.className} — Section ${dashboardData.classInfo.section}`
                    : 'Assigned Class'}
                </h1>
                <p className="text-blue-100 text-sm mt-1">
                  Class Teacher: <span className="font-semibold text-white">{dashboardData?.teacherName || user?.name}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm text-white font-bold text-xs">
                  Today: {dashboardData?.todayDate || 'Current Session'}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Class Strength
                </p>
                <h3 className="text-2xl font-extrabold text-slate-900">
                  {dashboardData ? dashboardData.totalStudents : '...'}
                </h3>
                <span className="text-[11px] text-blue-600 font-medium">Assigned students</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Present Today
                </p>
                <h3 className="text-2xl font-extrabold text-slate-900">
                  {dashboardData ? dashboardData.presentToday : '0'}
                </h3>
                <span className="text-[11px] text-emerald-600 font-medium">In attendance</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <UserX className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Absent Today
                </p>
                <h3 className="text-2xl font-extrabold text-slate-900">
                  {dashboardData ? dashboardData.absentToday : '0'}
                </h3>
                <span className="text-[11px] text-rose-600 font-medium">Absentees recorded</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Attendance Rate
                </p>
                <h3 className="text-2xl font-extrabold text-slate-900">
                  {dashboardData?.attendancePercentage !== null
                    ? `${dashboardData?.attendancePercentage}%`
                    : 'N/A'}
                </h3>
                <span className="text-[11px] text-indigo-600 font-medium">Today's Ratio</span>
              </div>
            </div>
          </div>

          {/* Quick Action Portals */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-4">
              Teacher Actions & Quick Portals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Action 1: My Class Students */}
              <div
                onClick={() => navigate('/teacher/students')}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    My Class Students
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    View full student directory, edit profiles, register new students, and inspect details.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-bold">
                  <span>Manage {total} Students</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Action 2: Mark Attendance */}
              <div
                onClick={() => navigate('/teacher/attendance')}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <CalendarCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    Mark Daily Attendance
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Take roll call, toggle student presence, mark bulk attendance, and view date logs.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-bold">
                  <span>{rate}% Present Today</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Action 3: Student Marks */}
              <div
                onClick={() => navigate('/teacher/marks')}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-400 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Examination Marks
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Enter examination and test scores per subject, review grades, and update evaluations.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-bold">
                  <span>Enter & View Marks</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Student Roster Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Class Roll Call Quick Preview
                </h3>
                <p className="text-xs text-slate-500">
                  Showing students enrolled in your assigned class.
                </p>
              </div>
              <button
                onClick={() => navigate('/teacher/students')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View Full Student Directory <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {recentStudents.slice(0, 8).map((st) => (
                <div
                  key={st._id}
                  onClick={() => navigate(`/students/${st._id}`)}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {st.rollNumber}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-semibold text-slate-800 text-xs truncate">{st.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{st.studentId}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;