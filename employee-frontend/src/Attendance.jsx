import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Attendance() {
  const [attendanceList, setAttendanceList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const ATTENDANCE_URL = 'http://localhost:5206/api/Attendances';
  const EMPLOYEES_URL = 'http://localhost:5206/api/Employees';

  const fetchData = async function() {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: 'Bearer ' + token } : {};

      const [attRes, empRes] = await Promise.all([
        axios.get(ATTENDANCE_URL, { headers: headers }),
        axios.get(EMPLOYEES_URL, { headers: headers })
      ]);

      setAttendanceList(Array.isArray(attRes.data) ? attRes.data : []);
      const empData = Array.isArray(empRes.data) ? empRes.data : [];
      setEmployees(empData);
      if (empData.length > 0 && !selectedEmployeeId) {
        setSelectedEmployeeId(empData[0].id || empData[0].Id);
      }
      setErrorMsg('');
    } catch (err) {
      setErrorMsg('Failed to load attendance records');
    }
  };

  useEffect(function() {
    fetchData();
  }, []);

  const handleCheckIn = async function() {
    if (!selectedEmployeeId) {
      alert('Please select an employee');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: 'Bearer ' + token } : {};

      const payload = {
        employeeId: parseInt(selectedEmployeeId, 10)
      };

      await axios.post(ATTENDANCE_URL + '/check-in', payload, { headers: headers });
      fetchData();
    } catch (err) {
      const serverMsg = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : (err.response && err.response.data ? JSON.stringify(err.response.data) : err.message);
      alert('Check-in failed: ' + serverMsg);
    }
  };

  const handleCheckOut = async function() {
    if (!selectedEmployeeId) {
      alert('Please select an employee');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: 'Bearer ' + token } : {};

      const payload = {
        employeeId: parseInt(selectedEmployeeId, 10)
      };

      await axios.post(ATTENDANCE_URL + '/check-out', payload, { headers: headers });
      fetchData();
    } catch (err) {
      const serverMsg = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : (err.response && err.response.data ? JSON.stringify(err.response.data) : err.message);
      alert('Check-out failed: ' + serverMsg);
    }
  };

  const employeeOptions = employees.map(function(emp) {
    const id = emp.id || emp.Id;
    const name = ((emp.firstName || emp.FirstName || '') + ' ' + (emp.lastName || emp.LastName || '')).trim() || 'Employee ' + id;
    return React.createElement('option', { key: id, value: id }, name);
  });

  const tableRows = attendanceList.length === 0
    ? [
        React.createElement(
          'tr',
          { key: 'empty' },
          React.createElement('td', { colSpan: 5, style: { textAlign: 'center', padding: '15px', color: '#888' } }, 'No attendance records found')
        )
      ]
    : attendanceList.map(function(att, idx) {
        const attId = att.id || att.Id || idx;
        const empName = att.employeeName || (att.employee ? ((att.employee.firstName || '') + ' ' + (att.employee.lastName || '')) : 'Employee #' + att.employeeId);
        const dateStr = att.date ? new Date(att.date).toLocaleDateString() : 'N/A';
        const checkInStr = att.checkInTime ? new Date(att.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';
        const checkOutStr = att.checkOutTime ? new Date(att.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';
        const currentStatus = att.status || 'Present';

        return React.createElement(
          'tr',
          { key: attId, style: { borderBottom: '1px solid #eee' } },
          React.createElement('td', { style: { padding: '10px' } }, empName),
          React.createElement('td', { style: { padding: '10px' } }, dateStr),
          React.createElement('td', { style: { padding: '10px' } }, checkInStr),
          React.createElement('td', { style: { padding: '10px' } }, checkOutStr),
          React.createElement('td', { style: { padding: '10px', fontWeight: 'bold', color: currentStatus === 'Present' ? '#28a745' : '#dc3545' } }, currentStatus)
        );
      });

  return React.createElement(
    'div',
    { style: { maxWidth: '850px', margin: '20px auto', fontFamily: 'sans-serif' } },
    React.createElement('h2', { style: { textAlign: 'center', color: '#555' } }, 'Attendance Management'),
    errorMsg ? React.createElement('p', { style: { color: 'red', textAlign: 'center' } }, errorMsg) : null,
    
    // Actions Section
    React.createElement(
      'div',
      { style: { display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' } },
      React.createElement(
        'select',
        {
          value: selectedEmployeeId,
          onChange: function(e) { setSelectedEmployeeId(e.target.value); },
          style: { flex: 2, padding: '9px', borderRadius: '4px', border: '1px solid #ccc' }
        },
        employeeOptions.length > 0 ? employeeOptions : React.createElement('option', { value: '' }, 'No employees available')
      ),
      React.createElement(
        'button',
        {
          type: 'button',
          onClick: handleCheckIn,
          style: { padding: '9px 18px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }
        },
        'Check-In'
      ),
      React.createElement(
        'button',
        {
          type: 'button',
          onClick: handleCheckOut,
          style: { padding: '9px 18px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }
        },
        'Check-Out'
      )
    ),

    // Table
    React.createElement(
      'table',
      { style: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', border: '1px solid #e0e0e0' } },
      React.createElement(
        'thead',
        null,
        React.createElement(
          'tr',
          { style: { borderBottom: '2px solid #ccc', backgroundColor: '#f4f6f8' } },
          React.createElement('th', { style: { padding: '12px 10px' } }, 'Employee'),
          React.createElement('th', { style: { padding: '12px 10px' } }, 'Date'),
          React.createElement('th', { style: { padding: '12px 10px' } }, 'Check-In'),
          React.createElement('th', { style: { padding: '12px 10px' } }, 'Check-Out'),
          React.createElement('th', { style: { padding: '12px 10px' } }, 'Status')
        )
      ),
      React.createElement('tbody', null, tableRows)
    )
  );
}