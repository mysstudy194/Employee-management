import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function EmployeePortal({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' or 'leaves'
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [attendanceToday, setAttendanceToday] = useState(null);
  const [monthlyAttendance, setMonthlyAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', isError: false });

  const BASE_URL = 'https://employee-management-production-aa2e.up.railway.app/api';
  const employeeId = parseInt(user?.employeeId || 4);

  // Live Clock
  useEffect(function() {
    const timer = setInterval(function() {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return function() { clearInterval(timer); };
  }, []);

  // Fetch Data
  const fetchEmployeeData = async function() {
    try {
      const [attRes, leaveRes] = await Promise.all([
        axios.get(BASE_URL + '/Attendances/employee/' + employeeId).catch(function() {
          return axios.get(BASE_URL + '/Attendances');
        }),
        axios.get(BASE_URL + '/LeaveRequests').catch(function() { return { data: [] }; })
      ]);

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const todayDate = now.getDate();

      const attendances = Array.isArray(attRes.data) ? attRes.data : [];

      const myRecords = attendances.filter(function(a) {
        return parseInt(a.employeeId || a.EmployeeId || 0) === employeeId;
      });

      const todayRecord = myRecords.find(function(a) {
        const recDate = new Date(a.date || a.Date || '');
        return (
          recDate.getFullYear() === currentYear &&
          recDate.getMonth() === currentMonth &&
          recDate.getDate() === todayDate
        );
      });
      setAttendanceToday(todayRecord || null);

      const currentMonthRecords = myRecords.filter(function(a) {
        const recDate = new Date(a.date || a.Date || '');
        return recDate.getFullYear() === currentYear && recDate.getMonth() === currentMonth;
      });
      setMonthlyAttendance(currentMonthRecords);

      const allLeaves = Array.isArray(leaveRes.data) ? leaveRes.data : [];
      const myLeaves = allLeaves.filter(function(l) {
        return parseInt(l.employeeId || l.EmployeeId || 0) === employeeId;
      });
      setLeaves(myLeaves);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(function() {
    fetchEmployeeData();
  }, [employeeId]);

  // Handle Check-In (English Alerts)
  const handleCheckIn = async function() {
    try {
      setLoading(true);
      const res = await axios.post(BASE_URL + '/Attendances/check-in', {
        employeeId: employeeId
      });
      setAttendanceToday(res.data);
      setMsg({ text: 'Check-In recorded successfully!', isError: false });
      fetchEmployeeData();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to record Check-In.';
      setMsg({ text: errorMsg, isError: true });
      fetchEmployeeData();
    } finally {
      setLoading(false);
    }
  };

  // Handle Check-Out (English Alerts)
  const handleCheckOut = async function() {
    try {
      setLoading(true);
      const res = await axios.post(BASE_URL + '/Attendances/check-out', {
        employeeId: employeeId
      });
      setAttendanceToday(res.data);
      setMsg({ text: 'Check-Out recorded successfully!', isError: false });
      fetchEmployeeData();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to record Check-Out.';
      setMsg({ text: errorMsg, isError: true });
      fetchEmployeeData();
    } finally {
      setLoading(false);
    }
  };

  // Handle Leave Submit (English Alerts)
  const handleLeaveSubmit = async function(e) {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      setMsg({ text: 'Please fill in all required fields.', isError: true });
      return;
    }

    const sDate = new Date(startDate);
    const eDate = new Date(endDate);

    if (eDate < sDate) {
      setMsg({ text: 'End Date cannot be earlier than Start Date.', isError: true });
      return;
    }

    try {
      setLoading(true);
      await axios.post(BASE_URL + '/LeaveRequests', {
        employeeId: employeeId,
        startDate: sDate.toISOString(),
        endDate: eDate.toISOString(),
        reason: reason.trim()
      });
      setMsg({ text: 'Leave request submitted successfully!', isError: false });
      setReason('');
      setStartDate('');
      setEndDate('');
      fetchEmployeeData();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        (err.response?.data?.errors ? JSON.stringify(err.response.data.errors) : null) ||
        'Failed to submit leave request.';
      setMsg({ text: errorMsg, isError: true });
    } finally {
      setLoading(false);
    }
  };

  const hasCheckedIn = Boolean(attendanceToday && (attendanceToday.checkInTime || attendanceToday.CheckInTime));
  const hasCheckedOut = Boolean(attendanceToday && (attendanceToday.checkOutTime || attendanceToday.CheckOutTime));

  const formatDisplayTime = function(isoStr) {
    if (!isoStr) return '-';
    try {
      return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return isoStr;
    }
  };

  const tabButtonStyle = function(tabName) {
    const isActive = activeTab === tabName;
    return {
      padding: '10px 22px',
      backgroundColor: isActive ? '#007bff' : '#e9ecef',
      color: isActive ? '#ffffff' : '#495057',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      boxShadow: isActive ? '0 2px 6px rgba(0,123,255,0.3)' : 'none'
    };
  };

  return React.createElement(
    'div',
    {
      style: {
        width: '100%',
        maxWidth: '900px',
        margin: '20px auto',
        padding: '0 16px',
        boxSizing: 'border-box',
        fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif'
      }
    },

    // Header Bar
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }
      },
      React.createElement(
        'div',
        null,
        React.createElement('h2', { style: { margin: '0 0 4px 0', color: '#1f2937', fontSize: '22px' } }, 'Employee Self-Service Portal'),
        React.createElement('span', { style: { fontSize: '13px', color: '#6b7280' } }, 'Welcome, ' + (user?.username || 'Employee'))
      ),
      React.createElement(
        'button',
        {
          onClick: onLogout,
          style: {
            backgroundColor: '#ef4444',
            color: '#ffffff',
            border: 'none',
            padding: '9px 18px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px'
          }
        },
        'Logout'
      )
    ),

    // Navigation Tabs
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          gap: '10px',
          marginBottom: '20px'
        }
      },
      React.createElement(
        'button',
        {
          style: tabButtonStyle('attendance'),
          onClick: function() { setActiveTab('attendance'); }
        },
        '📅 Attendance'
      ),
      React.createElement(
        'button',
        {
          style: tabButtonStyle('leaves'),
          onClick: function() { setActiveTab('leaves'); }
        },
        '📝 Leave Management'
      )
    ),

    // Alert Messages in English
    msg.text ? React.createElement(
      'div',
      {
        style: {
          padding: '12px 16px',
          marginBottom: '20px',
          borderRadius: '8px',
          textAlign: 'center',
          backgroundColor: msg.isError ? '#fee2e2' : '#dcfce7',
          color: msg.isError ? '#991b1b' : '#166534',
          border: '1px solid ' + (msg.isError ? '#fecaca' : '#bbf7d0'),
          fontWeight: '500'
        }
      },
      msg.text
    ) : null,

    // TAB 1: ATTENDANCE
    activeTab === 'attendance' ? React.createElement(
      'div',
      null,
      // Punch Clock Card
      React.createElement(
        'div',
        {
          style: {
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '30px 20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            marginBottom: '25px',
            textAlign: 'center'
          }
        },
        React.createElement('div', { style: { fontSize: '14px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' } }, 'Daily Office Attendance'),
        React.createElement('div', { style: { fontSize: '38px', fontWeight: '700', color: '#2563eb', margin: '12px 0 20px 0' } }, currentTime),
        React.createElement(
          'div',
          { style: { display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' } },
          React.createElement(
            'button',
            {
              onClick: handleCheckIn,
              disabled: loading || hasCheckedIn,
              style: {
                backgroundColor: hasCheckedIn ? '#9ca3af' : '#16a34a',
                color: '#ffffff',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '8px',
                cursor: hasCheckedIn ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '15px'
              }
            },
            hasCheckedIn ? 'Checked In (' + formatDisplayTime(attendanceToday.checkInTime || attendanceToday.CheckInTime) + ')' : 'Check In'
          ),
          React.createElement(
            'button',
            {
              onClick: handleCheckOut,
              disabled: loading || hasCheckedOut,
              style: {
                backgroundColor: hasCheckedOut ? '#9ca3af' : '#d97706',
                color: '#ffffff',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '8px',
                cursor: hasCheckedOut ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '15px'
              }
            },
            hasCheckedOut ? 'Checked Out (' + formatDisplayTime(attendanceToday.checkOutTime || attendanceToday.CheckOutTime) + ')' : 'Check Out'
          )
        )
      ),

      // Monthly Attendance Log
      React.createElement(
        'div',
        {
          style: {
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            overflowX: 'auto'
          }
        },
        React.createElement('h3', { style: { margin: '0 0 16px 0', color: '#1f2937', fontSize: '18px' } }, 'My Monthly Attendance Log'),
        React.createElement(
          'table',
          { style: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '550px' } },
          React.createElement(
            'thead',
            null,
            React.createElement(
              'tr',
              { style: { backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' } },
              React.createElement('th', { style: { padding: '12px 16px', color: '#4b5563', fontSize: '13px' } }, 'Date'),
              React.createElement('th', { style: { padding: '12px 16px', color: '#4b5563', fontSize: '13px' } }, 'Check-In'),
              React.createElement('th', { style: { padding: '12px 16px', color: '#4b5563', fontSize: '13px' } }, 'Check-Out'),
              React.createElement('th', { style: { padding: '12px 16px', color: '#4b5563', fontSize: '13px' } }, 'Status')
            )
          ),
          React.createElement(
            'tbody',
            null,
            monthlyAttendance.length === 0
              ? React.createElement(
                  'tr',
                  null,
                  React.createElement('td', { colSpan: '4', style: { padding: '20px', textAlign: 'center', color: '#9ca3af' } }, 'No attendance records found for this month.')
                )
              : monthlyAttendance.map(function(att) {
                  return React.createElement(
                    'tr',
                    { key: att.id || att.Id, style: { borderBottom: '1px solid #f3f4f6' } },
                    React.createElement('td', { style: { padding: '12px 16px', color: '#374151', fontWeight: '500' } }, (att.date || att.Date || '').split('T')[0]),
                    React.createElement('td', { style: { padding: '12px 16px', color: '#16a34a', fontWeight: '600' } }, formatDisplayTime(att.checkInTime || att.CheckInTime)),
                    React.createElement('td', { style: { padding: '12px 16px', color: '#d97706', fontWeight: '600' } }, formatDisplayTime(att.checkOutTime || att.CheckOutTime)),
                    React.createElement(
                      'td',
                      { style: { padding: '12px 16px' } },
                      React.createElement('span', { style: { backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600' } }, att.status || att.Status || 'Present')
                    )
                  );
                })
          )
        )
      )
    ) : null,

    // TAB 2: LEAVE MANAGEMENT
    activeTab === 'leaves' ? React.createElement(
      'div',
      null,
      // Apply Leave Card
      React.createElement(
        'div',
        {
          style: {
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            marginBottom: '25px'
          }
        },
        React.createElement('h3', { style: { margin: '0 0 16px 0', color: '#1f2937', fontSize: '18px' } }, 'Apply for Leave'),
        React.createElement(
          'form',
          { onSubmit: handleLeaveSubmit, style: { display: 'flex', flexWrap: 'wrap', gap: '14px' } },
          React.createElement('input', {
            type: 'date',
            value: startDate,
            onChange: function(e) { setStartDate(e.target.value); },
            style: { flex: '1 1 200px', padding: '11px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' },
            required: true
          }),
          React.createElement('input', {
            type: 'date',
            value: endDate,
            onChange: function(e) { setEndDate(e.target.value); },
            style: { flex: '1 1 200px', padding: '11px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' },
            required: true
          }),
          React.createElement('input', {
            type: 'text',
            placeholder: 'Reason for leave',
            value: reason,
            onChange: function(e) { setReason(e.target.value); },
            style: { flex: '2 1 280px', padding: '11px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' },
            required: true
          }),
          React.createElement(
            'button',
            {
              type: 'submit',
              disabled: loading,
              style: {
                flex: '1 1 140px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '11px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }
            },
            loading ? 'Submitting...' : 'Submit Request'
          )
        )
      ),

      // Leave Tracker Table
      React.createElement(
        'div',
        {
          style: {
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            overflowX: 'auto'
          }
        },
        React.createElement('h3', { style: { margin: '0 0 16px 0', color: '#1f2937', fontSize: '18px' } }, 'My Leave Status Tracker'),
        React.createElement(
          'table',
          { style: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '550px' } },
          React.createElement(
            'thead',
            null,
            React.createElement(
              'tr',
              { style: { backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' } },
              React.createElement('th', { style: { padding: '12px 16px', color: '#4b5563', fontSize: '13px' } }, 'Start Date'),
              React.createElement('th', { style: { padding: '12px 16px', color: '#4b5563', fontSize: '13px' } }, 'End Date'),
              React.createElement('th', { style: { padding: '12px 16px', color: '#4b5563', fontSize: '13px' } }, 'Reason'),
              React.createElement('th', { style: { padding: '12px 16px', color: '#4b5563', fontSize: '13px' } }, 'Approval Status')
            )
          ),
          React.createElement(
            'tbody',
            null,
            leaves.length === 0
              ? React.createElement(
                  'tr',
                  null,
                  React.createElement('td', { colSpan: '4', style: { padding: '20px', textAlign: 'center', color: '#9ca3af' } }, 'No leave requests submitted yet.')
                )
              : leaves.map(function(l) {
                  const s = (l.status || l.Status || 'Pending').toLowerCase();
                  const badgeStyle = {
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'inline-block'
                  };

                  if (s === 'approved') {
                    badgeStyle.backgroundColor = '#dcfce7';
                    badgeStyle.color = '#166534';
                  } else if (s === 'rejected') {
                    badgeStyle.backgroundColor = '#fee2e2';
                    badgeStyle.color = '#991b1b';
                  } else {
                    badgeStyle.backgroundColor = '#fef3c7';
                    badgeStyle.color = '#92400e';
                  }

                  return React.createElement(
                    'tr',
                    { key: l.id || l.Id, style: { borderBottom: '1px solid #f3f4f6' } },
                    React.createElement('td', { style: { padding: '12px 16px', color: '#4b5563' } }, (l.startDate || l.StartDate || '').split('T')[0]),
                    React.createElement('td', { style: { padding: '12px 16px', color: '#4b5563' } }, (l.endDate || l.EndDate || '').split('T')[0]),
                    React.createElement('td', { style: { padding: '12px 16px', color: '#1f2937' } }, l.reason || l.Reason),
                    React.createElement(
                      'td',
                      { style: { padding: '12px 16px' } },
                      React.createElement('span', { style: badgeStyle }, l.status || l.Status)
                    )
                  );
                })
          )
        )
      )
    ) : null
  );
}