import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import {
  User,
  ChevronLeft,
  CalendarCheck,
  Award,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/students/${id}`);
      if (res.data.success) {
        setProfileData(res.data.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load student profile (Access Denied or Not Found)'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (user?.role === 'principal') {
      navigate('/principal');
    } else {
      navigate('/teacher');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 max-w-md w-full text-center shadow-sm">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
            <p className="text-sm text-slate-500 mt-2">{error || 'Could not load student profile'}</p>
            <button
              onClick={handleBack}
              className="mt-6 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-700 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { student, attendance, academics } = profileData;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full">
          {/* Back Navigation */}
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </button>

          {/* Student Banner Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-2xl uppercase shadow-md shadow-blue-500/20">
                {student.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                    Roll #{student.rollNumber}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-mono text-xs">
                    {student.studentId}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {student.name}
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Class {student.classId?.className?.replace('Class ', '') || '5'} • Section {student.section || 'A'}
                </p>
              </div>
            </div>

            {/* Quick Badges */}
            <div className="flex items-center gap-3 self-stretch sm:self-auto justify-around sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
              <div className="text-center sm:text-right px-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Attendance
                </span>
                <span className="text-2xl font-black text-emerald-600">
                  {attendance.rate}%
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="text-center sm:text-right px-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Overall Score
                </span>
                <span className="text-2xl font-black text-blue-600">
                  {academics.overallPercentage ? `${academics.overallPercentage}%` : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Student Personal Information */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <User className="w-4 h-4 text-blue-600" />
                Student Biodata
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                    Father's Name
                  </span>
                  <span className="text-slate-800 font-bold text-sm">{student.fatherName}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                    Mother's Name
                  </span>
                  <span className="text-slate-800 font-bold text-sm">{student.motherName}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                      Date of Birth
                    </span>
                    <span className="text-slate-800 font-semibold">{student.dateOfBirth}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                      Gender
                    </span>
                    <span className="text-slate-800 font-semibold">{student.gender}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                    Contact Phone
                  </span>
                  <span className="text-slate-800 font-semibold flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-blue-600" /> {student.phone}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                    Address
                  </span>
                  <span className="text-slate-800 font-semibold flex items-start gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" /> {student.address}
                  </span>
                </div>
              </div>
            </div>

            {/* Attendance Summary & Timeline */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                <CalendarCheck className="w-4 h-4 text-emerald-600" />
                Attendance Record
              </h2>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Days</span>
                  <p className="text-xl font-black text-slate-800">{attendance.totalDays}</p>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Present</span>
                  <p className="text-xl font-black text-emerald-700">{attendance.presentDays}</p>
                </div>
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-center">
                  <span className="text-[10px] font-bold text-rose-600 uppercase">Absent</span>
                  <p className="text-xl font-black text-rose-700">{attendance.absentDays}</p>
                </div>
              </div>

              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Recent Attendance Log:
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {attendance.recentRecords.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-xl border text-center text-xs ${
                      item.status === 'Present'
                        ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50/50 border-rose-200 text-rose-800'
                    }`}
                  >
                    <p className="text-[10px] text-slate-400 font-mono">{item.date}</p>
                    <p className="font-bold mt-0.5">{item.status}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Academic Report Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3 mb-6">
              <Award className="w-4 h-4 text-blue-600" />
              Academic Performance Report Card
            </h2>

            {Object.keys(academics.marksByExam).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No examination marks recorded yet.
              </p>
            ) : (
              <div className="space-y-6">
                {Object.entries(academics.marksByExam).map(([examName, list]) => (
                  <div key={examName} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200">
                    <h3 className="font-bold text-slate-900 text-sm mb-3">{examName}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {list.map((m) => (
                        <div
                          key={m._id}
                          className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-700">{m.subject}</p>
                            <p className="text-[10px] text-slate-400">Max Score: {m.maxMarks}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-base font-black text-slate-900">
                              {m.marks}
                            </span>
                            <span className="text-xs font-semibold text-slate-400">
                              /{m.maxMarks}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentProfile;
