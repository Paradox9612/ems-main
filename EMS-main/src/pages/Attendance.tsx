import React, { useEffect, useState } from 'react';
import { Clock, Calendar, Users, Timer } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

// API base URL
const API_BASE_URL = 'http://localhost:5001/api';

interface AttendanceRecord {
  id: number;
  employee_id: number;
  date: string;
  check_in: string;
  check_out?: string;
  status: 'present' | 'absent' | 'late';
  firstName?: string;
  lastName?: string;
  // Frontend display properties
  clockIn: string;
  clockOut?: string;
  employeeName?: string;
}

export const Attendance: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      loadAttendance();
    }
  }, [selectedDate, isAdmin, user]);

  // Load attendance from backend
  const loadAttendance = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      let response;

      if (isAdmin) {
        // Admin gets all attendance for selected date
        response = await fetch(`${API_BASE_URL}/attendance/date/${selectedDate}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        // Employee gets their own attendance
        response = await fetch(`${API_BASE_URL}/attendance/employee/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }

      if (!response.ok) {
        throw new Error('Failed to load attendance');
      }

      const data = await response.json();
      const records = data.records || [];

      // Transform backend data to match frontend interface
      const transformedRecords = records.map((record: any) => ({
        id: record.id,
        employee_id: record.employee_id,
        date: record.date,
        clockIn: record.check_in,
        clockOut: record.check_out,
        status: record.status,
        employeeName: record.firstName && record.lastName ? `${record.firstName} ${record.lastName}` : undefined
      }));

      setAttendanceRecords(transformedRecords);

      // Set today's record for employee
      if (!isAdmin && user) {
        const today = new Date().toISOString().split('T')[0];
        if (selectedDate === today) {
          const existing = transformedRecords.find((r: AttendanceRecord) => r.employee_id === parseInt(user.id) && r.date === today);
          setTodayRecord(existing || null);
        } else {
          setTodayRecord(null);
        }
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };


  const handleClockIn = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/attendance/clock-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to clock in');
      }

      const data = await response.json();

      // Transform backend response to frontend format
      const newRecord: AttendanceRecord = {
        id: data.attendance.id,
        employee_id: data.attendance.employeeId,
        date: data.attendance.date,
        check_in: data.attendance.checkIn,
        check_out: data.attendance.checkOut,
        status: data.attendance.status,
        clockIn: data.attendance.checkIn,
        clockOut: data.attendance.checkOut,
        employeeName: `${user.firstName} ${user.lastName}`
      };

      setTodayRecord(newRecord);
      // Reload attendance to get updated data
      loadAttendance();
    } catch (error) {
      console.error('Clock in error:', error);
      alert('Failed to clock in. Please try again.');
    }
  };

  const handleClockOut = async () => {
    if (!todayRecord) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/attendance/clock-out`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          attendanceId: todayRecord.id
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to clock out');
      }

      // Reload attendance to get updated data
      loadAttendance();
      setTodayRecord(null); // Clear today's record since it's completed
    } catch (error) {
      console.error('Clock out error:', error);
      alert('Failed to clock out. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-100 border-green-200';
      case 'late': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'absent': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const calculateWorkingHours = (clockIn: string, clockOut?: string) => {
    if (!clockOut) return 'In progress';
    const inTime = new Date(`2000-01-01T${clockIn}`);
    const outTime = new Date(`2000-01-01T${clockOut}`);
    const diff = outTime.getTime() - inTime.getTime();
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${h}h ${m}m`;
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  // For admin: Load real stats from backend
  const [adminStats, setAdminStats] = useState({
    present: 0,
    absent: 0,
    clockedIn: 0,
    total: 0
  });

  useEffect(() => {
    if (isAdmin && isToday) {
      loadAdminStats();
    }
  }, [isAdmin, isToday]);

  const loadAdminStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/attendance/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const stats = await response.json();
        setAdminStats(stats);
      }
    } catch (error) {
      console.error('Error loading admin stats:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Attendance Management
        </h1>
        <p className="text-gray-500">Track and manage attendance records easily</p>
      </div>

      {/* Current Time */}
      <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl p-6 border border-blue-200 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Current Time</h3>
            <p className="text-2xl font-bold text-blue-700">{currentTime.toLocaleTimeString()}</p>
            <p className="text-sm text-gray-600">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Timer className="h-12 w-12 text-blue-600" />
        </div>
      </div>

      {/* Admin Summary */}
      {isAdmin && isToday && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Attendance Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{adminStats.present}</p>
              <p className="text-sm text-green-700">Present</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <Users className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">{adminStats.absent}</p>
              <p className="text-sm text-red-700">Absent</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-600">{adminStats.clockedIn}</p>
              <p className="text-sm text-yellow-700">Clocked In</p>
            </div>
          </div>
        </div>
      )}

      {/* Clock In/Out for Employee */}
      {!isAdmin && isToday && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Attendance</h2>
          <div className="flex justify-between items-center">
            {todayRecord && (
              <div className="flex space-x-4 text-sm items-center">
                <span className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span>In: {todayRecord.clockIn}</span>
                </span>
                {todayRecord.clockOut && (
                  <span className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-red-600" />
                    <span>Out: {todayRecord.clockOut}</span>
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(todayRecord.status)}`}>
                  {todayRecord.status}
                </span>
              </div>
            )}
            <div>
              {!todayRecord ? (
                <button
                  onClick={handleClockIn}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2 rounded-lg shadow hover:scale-105 transition"
                >
                  Clock In
                </button>
              ) : !todayRecord.clockOut ? (
                <button
                  onClick={handleClockOut}
                  className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-5 py-2 rounded-lg shadow hover:scale-105 transition"
                >
                  Clock Out
                </button>
              ) : (
                <span className="text-green-600 font-semibold">✔ Day Complete</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Attendance Records */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">
            {isAdmin ? 'All Attendance Records' : 'Your Attendance History'}
          </h2>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="border rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center"><LoadingSpinner /></div>
          ) : attendanceRecords.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Records Found</h3>
              <p className="text-gray-500">No attendance data available for this date.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clock In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clock Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Working Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceRecords.map(record => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    {isAdmin && <td className="px-6 py-4">{record.employeeName}</td>}
                    <td className="px-6 py-4">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{record.clockIn}</td>
                    <td className="px-6 py-4">{record.clockOut || '-'}</td>
                    <td className="px-6 py-4 text-blue-600 font-medium">
                      {calculateWorkingHours(record.clockIn, record.clockOut)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};