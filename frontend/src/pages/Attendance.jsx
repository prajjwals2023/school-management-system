import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Save,
  AlertCircle,
  Users,
  ChevronLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Attendance = () => {
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAttendance(selectedDate);
  }, [selectedDate]);

  const fetchAttendance = async (date) => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await api.get(`/teacher/attendance?date=${date}`);
      if (res.data.success) {
        setRecords(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load attendance:', err);
      setMessage({ type: 'error', text: 'Failed to fetch attendance for this date' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = (studentId) => {
    setRecords((prev) =>
      prev.map((rec) => {
        if (rec.studentId === studentId) {
          const nextStatus = rec.status === 'Present' ? 'Absent' : 'Present';
          return { ...rec, status: nextStatus };
        }
        return rec;
      })
    );
  };

  const handleMarkAll = (status) => {
    setRecords((prev) =>
      prev.map((rec) => ({
        ...rec,
        status,
      }))
    );
  };

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const payload = {
        date: selectedDate,
        records: records.map((r) => ({
          studentId: r.studentId,
          status: r.status,
        })),
      };

      const res = await api.post('/teacher/attendance', payload);
      if (res.data.success) {
        setMessage({ type: 'success', text: `Attendance for ${selectedDate} saved successfully!` });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save attendance',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const presentCount = records.filter((r) => r.status === 'Present').length;
  const absentCount = records.filter((r) => r.status === 'Absent').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <button
                onClick={() => navigate('/teacher')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-2 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Dashboard
              </button>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                <CalendarCheck className="w-7 h-7 text-blue-600" />
                Class Attendance Register
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Mark daily presence and absence for students in your assigned class.
              </p>
            </div>

            {/* Date Picker */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500 px-2 uppercase tracking-wider">
                Date:
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Toast / Alert Message */}
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 text-sm font-medium ${
                message.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Quick Metrics & Bulk Buttons */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-xs text-slate-400 block font-medium uppercase">Total</span>
                <span className="text-lg font-bold text-slate-800">{records.length} Students</span>
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <div>
                <span className="text-xs text-emerald-600 block font-medium uppercase">Present</span>
                <span className="text-lg font-bold text-emerald-700">{presentCount}</span>
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <div>
                <span className="text-xs text-rose-600 block font-medium uppercase">Absent</span>
                <span className="text-lg font-bold text-rose-700">{absentCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleMarkAll('Present')}
                className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors"
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('Absent')}
                className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors"
              >
                Mark All Absent
              </button>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 text-center w-16">Roll</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Student ID</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Quick Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {records.map((record) => {
                  const isPresent = record.status === 'Present';
                  return (
                    <tr
                      key={record.studentId}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold">
                          {record.rollNumber}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {record.name}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                        {record.customStudentId}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            isPresent
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isPresent ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Present
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" /> Absent
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(record.studentId)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isPresent
                              ? 'bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-700'
                              : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700'
                          }`}
                        >
                          Toggle to {isPresent ? 'Absent' : 'Present'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveAttendance}
              disabled={isSaving || records.length === 0}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Attendance Register</span>
                </>
              )}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Attendance;
