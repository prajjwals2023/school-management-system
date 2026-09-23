import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import {
  Award,
  CheckCircle2,
  Save,
  AlertCircle,
  ChevronLeft,
  BookOpen,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Marks = () => {
  const navigate = useNavigate();
  const subjects = [
    'Mathematics',
    'Science',
    'English',
    'Computer Science',
    'Social Studies',
  ];
  const exams = ['Unit Test 1', 'Midterm Examination', 'Final Examination'];

  const [selectedExam, setSelectedExam] = useState('Midterm Examination');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [students, setStudents] = useState([]);
  const [marksMap, setMarksMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchStudentsAndMarks();
  }, [selectedExam, selectedSubject]);

  const fetchStudentsAndMarks = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const [studentsRes, marksRes] = await Promise.all([
        api.get('/teacher/students'),
        api.get(`/teacher/marks?exam=${encodeURIComponent(selectedExam)}&subject=${encodeURIComponent(selectedSubject)}`),
      ]);

      if (studentsRes.data.success) {
        setStudents(studentsRes.data.data);
      }

      const map = {};
      if (marksRes.data.success) {
        marksRes.data.data.forEach((m) => {
          const sId = m.studentId?._id || m.studentId;
          map[sId] = m.marks;
        });
      }
      setMarksMap(map);
    } catch (err) {
      console.error('Failed to load marks:', err);
      setMessage({ type: 'error', text: 'Failed to load class marks' });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (studentId, val) => {
    const num = val === '' ? '' : Math.min(100, Math.max(0, Number(val)));
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: num,
    }));
  };

  const handleSaveMarks = async () => {
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    try {
      // Save all entered marks
      const promises = students.map((student) => {
        const mark = marksMap[student._id];
        if (mark !== undefined && mark !== '') {
          return api.post('/teacher/marks', {
            studentId: student._id,
            subject: selectedSubject,
            exam: selectedExam,
            marks: Number(mark),
            maxMarks: 100,
          });
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      setMessage({
        type: 'success',
        text: `Marks for ${selectedSubject} (${selectedExam}) saved successfully!`,
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save marks',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getGrade = (marks) => {
    if (marks === undefined || marks === '') return { grade: '-', color: 'text-slate-400' };
    const m = Number(marks);
    if (m >= 90) return { grade: 'A+ (Excellent)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (m >= 80) return { grade: 'A (Very Good)', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    if (m >= 70) return { grade: 'B (Good)', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
    if (m >= 60) return { grade: 'C (Average)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (m >= 50) return { grade: 'D (Pass)', color: 'text-orange-700 bg-orange-50 border-orange-200' };
    return { grade: 'F (Needs Improvement)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

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
                <Award className="w-7 h-7 text-blue-600" />
                Student Examination Marks
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Enter and maintain evaluation records for students in your assigned class.
              </p>
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

          {/* Filter Toolbar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Examination
                </label>
                <select
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-blue-500/20"
                >
                  {exams.map((exam) => (
                    <option key={exam} value={exam}>
                      {exam}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-blue-500/20"
                >
                  {subjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="text-xs text-slate-500 font-medium">Max Marks:</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-xs text-slate-700">
                100
              </span>
            </div>
          </div>

          {/* Marks Entry Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 text-center w-16">Roll</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Student ID</th>
                  <th className="py-3.5 px-4 text-center w-36">Score (Out of 100)</th>
                  <th className="py-3.5 px-4 text-right">Performance Band</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {students.map((student) => {
                  const currentMark = marksMap[student._id] ?? '';
                  const { grade, color } = getGrade(currentMark);

                  return (
                    <tr key={student._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold">
                          {student.rollNumber}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {student.name}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                        {student.studentId}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="—"
                          value={currentMark}
                          onChange={(e) => handleMarkChange(student._id, e.target.value)}
                          className="w-24 text-center py-1.5 px-2 rounded-xl border border-slate-300 font-bold text-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                        />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${color}`}
                        >
                          {grade}
                        </span>
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
              onClick={handleSaveMarks}
              disabled={isSaving || students.length === 0}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Examination Marks</span>
                </>
              )}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Marks;
