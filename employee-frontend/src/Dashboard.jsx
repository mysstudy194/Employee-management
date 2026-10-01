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

  const EMPLOYEES_URL = 'http://localhost:5206/api/Employees';
  const ATTENDANCE_URL = 'http://localhost:5206/api/Attendances';
  const LEAVE_URL = 'http://localhost:5206/api/LeaveRequests';

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

      // Aaj ki local date
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentDate = now.getDate();

      // Aaj ke unique present employees
      const presentEmployeeIds = new Set();

      attendances.forEach(function(a) {
        if (!a.date) return;
        const d = new Date(a.date);
        
        // Local Year, Month, Date comparison
        const isToday = 
          d.getFullYear() === currentYear &&
          d.getMonth() === currentMonth &&
          d.getDate() === currentDate;

        if (isToday && (a.status === 'Present' || a.checkInTime)) {
          const empId = a.employeeId || (a.employee && (a.employee.id || a.employee.Id)) || a.id;
          if (empId) {
            presentEmployeeIds.add(empId);
          }
        }
      });

      // Leaves count
      const pendingCount = leaves.filter(function(l) {
        return (l.status || '').toLowerCase() === 'pending';
      }).length;

      const approvedCount = leaves.filter(function(l) {
        return (l.status || '').toLowerCase() === 'approved';
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