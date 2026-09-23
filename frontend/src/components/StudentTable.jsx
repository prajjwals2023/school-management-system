import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, UserCheck, AlertCircle, Phone } from 'lucide-react';

const StudentTable = ({ students, onEdit, isTeacherView = false }) => {
  const navigate = useNavigate();

  if (!students || students.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-700">No students found</h3>
        <p className="text-sm text-slate-400 mt-1">There are no student records for this view.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 text-center w-16">Roll</th>
              <th className="py-3.5 px-4">Student</th>
              <th className="py-3.5 px-4">Student ID</th>
              <th className="py-3.5 px-4">Class</th>
              <th className="py-3.5 px-4">Father / Mother</th>
              <th className="py-3.5 px-4 text-center">Attendance</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {students.map((student) => {
              const attendanceRate = student.attendanceRate ?? 92;
              let attendanceColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
              if (attendanceRate < 75) {
                attendanceColor = 'text-rose-700 bg-rose-50 border-rose-200';
              } else if (attendanceRate < 85) {
                attendanceColor = 'text-amber-700 bg-amber-50 border-amber-200';
              }

              return (
                <tr
                  key={student._id}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/students/${student._id}`)}
                >
                  {/* Roll No */}
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold">
                      {student.rollNumber}
                    </span>
                  </td>

                  {/* Student Name & Avatar */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                        {student.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {student.name}
                        </p>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {student.phone}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Student ID */}
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold">
                      {student.studentId}
                    </span>
                  </td>

                  {/* Class & Section */}
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {student.classId?.className || 'Class 5'} - {student.section || 'A'}
                  </td>

                  {/* Parents */}
                  <td className="py-3.5 px-4 text-xs text-slate-600">
                    <p className="font-medium text-slate-700">{student.fatherName}</p>
                    <p className="text-slate-400">{student.motherName}</p>
                  </td>

                  {/* Attendance Rate */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${attendanceColor}`}
                    >
                      <UserCheck className="w-3 h-3" />
                      {attendanceRate}%
                    </span>
                  </td>

                  {/* Actions */}
                  <td
                    className="py-3.5 px-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => navigate(`/students/${student._id}`)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {isTeacherView && onEdit && (
                        <button
                          onClick={() => onEdit(student)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Edit Student Info"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentTable;
