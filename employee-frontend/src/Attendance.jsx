import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Attendance() {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [msg, setMsg] = useState({ text: '', isError: false });

  const BASE_URL = 'https://employee-management-production-aa2e.up.railway.app/api';

  const fetchAttendanceRecords = async function() {
    try {
      setLoading(true);
      const res = await axios.get(BASE_URL + '/Attendances');
      const data = Array.isArray(res.data) ? res.data : [];
      setAttendances(data);
    } catch (err) {
      setMsg({ text: 'Failed to load attendance records.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(function() {
    fetchAttendanceRecords();
  }, []);

  const formatDisplayTime = function(timeVal) {
    if (!timeVal) return '-';
    try {
      if (timeVal.includes('T') || timeVal.includes('Z')) {
        return new Date(timeVal).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return timeVal;
    } catch (e) {
      return timeVal;
    }
  };

  const filteredAttendances = attendances.filter(function(record) {
    const name = (record.employeeName || record.EmployeeName || '').toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  return React.createElement(
    'div',
    {
      style: {
        width: '100%',
        maxWidth: '1000px',
        margin: '20px auto',
        padding: '0 16px',
        boxSizing: 'border-box',
        fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif'
      }
    },

    // Title
    React.createElement('h2', { style: { textAlign: 'center', color: '#1f2937', marginBottom: '20px' } }, 'Attendance Management'),

    // Alert Message
    msg.text ? React.createElement(
      'div',
      {
        style: {
          padding: '10px 15px',
          marginBottom: '15px',
          borderRadius: '6px',
          textAlign: 'center',
          backgroundColor: msg.isError ? '#fee2e2' : '#dcfce7',
          color: msg.isError ? '#991b1b' : '#166534',
          border: '1px solid ' + (msg.isError ? '#fecaca' : '#bbf7d0')
        }
      },
      msg.text
    ) : null,

    // Search and Refresh Bar
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px'
        }
      },
      React.createElement('input', {
        type: 'text',
        placeholder: 'Search employee by name...',
        value: searchTerm,
        onChange: function(e) { setSearchTerm(e.target.value); },
        style: {
          padding: '10px 14px',
          borderRadius: '8px',
          border: '1px solid #d1d5db',
          width: '260px',
          fontSize: '14px'
        }
      }),
      React.createElement(
        'button',
        {
          onClick: fetchAttendanceRecords,
          style: {
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px'
          }
        },
        'Refresh Records'
      )
    ),

    // Records Table
    React.createElement(
      'div',
      {
        style: {
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          overflowX: 'auto',
          width: '100%'
        }
      },
      React.createElement(
        'table',
        { style: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '650px' } },
        React.createElement(
          'thead',
          null,
          React.createElement(
            'tr',
            { style: { backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' } },
            React.createElement('th', { style: { padding: '12px 16px', color: '#4b5563', fontSize: '13px' } }, 'Employee'),
            React.createElement('th', { style: { padding: '12px 16px', color: '#4b5563', fontSize: '13px' } }, 'Date'),
            React.createElement('th', { style: { padding: '12px 16px', color: '#4b5563', fontSize: '13px' } }, 'Check-In'),
            React.createElement('th', { style: { padding: '12px 16px', color: '#4b5563', fontSize: '13px' } }, 'Check-Out'),
            React.createElement('th', { style: { padding: '12px 16px', color: '#4b5563', fontSize: '13px' } }, 'Status')
          )
        ),
        React.createElement(
          'tbody',
          null,
          loading
            ? React.createElement(
                'tr',
                null,
                React.createElement('td', { colSpan: '5', style: { padding: '24px', textAlign: 'center', color: '#6b7280' } }, 'Loading records...')
              )
            : filteredAttendances.length === 0
            ? React.createElement(
                'tr',
                null,
                React.createElement('td', { colSpan: '5', style: { padding: '24px', textAlign: 'center', color: '#9ca3af' } }, 'No attendance records found.')
              )
            : filteredAttendances.map(function(item) {
                const id = item.id || item.Id;
                const dateStr = (item.date || item.Date || '').split('T')[0];
                return React.createElement(
                  'tr',
                  { key: id, style: { borderBottom: '1px solid #f3f4f6' } },
                  React.createElement('td', { style: { padding: '12px 16px', fontWeight: '600', color: '#1f2937' } }, item.employeeName || item.EmployeeName || ('ID: ' + (item.employeeId || item.EmployeeId))),
                  React.createElement('td', { style: { padding: '12px 16px', color: '#4b5563' } }, dateStr),
                  React.createElement('td', { style: { padding: '12px 16px', color: '#16a34a', fontWeight: '600' } }, formatDisplayTime(item.checkInTime || item.CheckInTime)),
                  React.createElement('td', { style: { padding: '12px 16px', color: '#d97706', fontWeight: '600' } }, formatDisplayTime(item.checkOutTime || item.CheckOutTime)),
                  React.createElement(
                    'td',
                    { style: { padding: '12px 16px' } },
                    React.createElement(
                      'span',
                      {
                        style: {
                          backgroundColor: '#dcfce7',
                          color: '#166534',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }
                      },
                      item.status || item.Status || 'Present'
                    )
                  )
                );
              })
        )
      )
    )
  );
}