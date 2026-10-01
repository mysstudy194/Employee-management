import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    todayPresent: 0,
    pendingLeaves: 0,
    approvedLeaves: 0
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const EMPLOYEES_URL = 'https://employee-management-production-aa2e.up.railway.app/api/Employees';
  const ATTENDANCE_URL = 'https://employee-management-production-aa2e.up.railway.app/api/Attendances';
  const LEAVE_URL = 'https://employee-management-production-aa2e.up.railway.app/api/LeaveRequests';

  const fetchDashboardStats = async function() {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: 'Bearer ' + token } : {};

      const [empRes, attRes, leaveRes] = await Promise.all([
        axios.get(EMPLOYEES_URL, { headers: headers }).catch(() => ({ data: [] })),
        axios.get(ATTENDANCE_URL, { headers: headers }).catch(() => ({ data: [] })),
        axios.get(LEAVE_URL, { headers: headers }).catch(() => ({ data: [] }))
      ]);

      const employees = Array.isArray(empRes.data) ? empRes.data : [];
      const attendances = Array.isArray(attRes.data) ? attRes.data : [];
      const leaves = Array.isArray(leaveRes.data) ? leaveRes.data : [];

      // Aaj ki local date aur UTC date strings (e.g., "2026-10-01" / "2026-10-02")
      const now = new Date();
      const localToday = `\({now.getFullYear()}-\){String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const utcToday = now.toISOString().split('T')[0];

      // Aaj ke present employees
      const presentEmployeeIds = new Set();

      attendances.forEach(function(a) {
        const rawDate = a.date || a.Date;
        if (!rawDate) return;

        // Raw date format sanitize karein
        const recordDate = typeof rawDate === 'string'
          ? rawDate.split('T')[0]
          : new Date(rawDate).toISOString().split('T')[0];

        const status = (a.status || a.Status || '').toLowerCase();
        const checkIn = a.checkInTime || a.CheckInTime;

        // Agar date local ya UTC kisi se bhi match kare, ya valid check-in ho
        const isToday = (recordDate === localToday || recordDate === utcToday);

        if (isToday && (status === 'present' || checkIn)) {
          const empId = a.employeeId || a.EmployeeId || (a.employee && (a.employee.id || a.employee.Id)) || a.id || a.Id;
          if (empId) {
            presentEmployeeIds.add(empId);
          }
        }
      });

      // Leaves count (Casing safe)
      const pendingCount = leaves.filter(function(l) {
        const s = (l.status || l.Status || '').toLowerCase();
        return s === 'pending';
      }).length;

      const approvedCount = leaves.filter(function(l) {
        const s = (l.status || l.Status || '').toLowerCase();
        return s === 'approved';
      }).length;

      setStats({
        totalEmployees: employees.length,
        todayPresent: presentEmployeeIds.size,
        pendingLeaves: pendingCount,
        approvedLeaves: approvedCount
      });
      setErrorMsg('');
    } catch (err) {
      setErrorMsg('Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(function() {
    fetchDashboardStats();
  }, []);

  const createCard = function(title, value, colorBg, colorText) {
    return React.createElement(
      'div',
      {
        style: {
          flex: '1 1 200px',
          backgroundColor: colorBg,
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '180px'
        }
      },
      React.createElement('span', { style: { fontSize: '13px', fontWeight: 'bold', color: colorText, textTransform: 'uppercase' } }, title),
      React.createElement('h2', { style: { fontSize: '32px', margin: '10px 0 0 0', color: colorText } }, loading ? '...' : value)
    );
  };

  return React.createElement(
    'div',
    { style: { maxWidth: '900px', margin: '20px auto', fontFamily: 'sans-serif' } },
    React.createElement('h2', { style: { textAlign: 'center', color: '#555', marginBottom: '25px' } }, 'System Overview'),
    errorMsg ? React.createElement('p', { style: { color: 'red', textAlign: 'center' } }, errorMsg) : null,

    // Cards Grid
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          flexWrap: 'wrap',
          gap: '18px',
          justifyContent: 'space-between',
          marginBottom: '30px'
        }
      },
      createCard('Total Employees', stats.totalEmployees, '#e8f4fd', '#007bff'),
      createCard("Today's Present", stats.todayPresent, '#eafaf1', '#28a745'),
      createCard('Pending Leaves', stats.pendingLeaves, '#fef9e7', '#f39c12'),
      createCard('Approved Leaves', stats.approvedLeaves, '#f5eef8', '#8e44ad')
    ),

    // Quick Info Box
    React.createElement(
      'div',
      {
        style: {
          backgroundColor: '#fafafa',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          textAlign: 'center',
          color: '#666',
          fontSize: '14px'
        }
      },
      'Welcome to the portal. Use the navigation buttons above to manage Employees, Attendance, and Leave requests.'
    )
  );
}