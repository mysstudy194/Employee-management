import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Leave() {
  const [leaveList, setLeaveList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const LEAVE_URL = 'https://employee-management-production-aa2e.up.railway.app/api/LeaveRequests';
  const EMPLOYEES_URL = 'https://employee-management-production-aa2e.up.railway.app/api/Employees';

  const fetchData = async function() {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: 'Bearer ' + token } : {};

    // 1. Load Employees
    try {
      const empRes = await axios.get(EMPLOYEES_URL, { headers: headers });
      const empData = Array.isArray(empRes.data) ? empRes.data : [];
      setEmployees(empData);
      if (empData.length > 0) {
        setSelectedEmployeeId(function(prev) {
          return prev ? prev : (empData[0].id || empData[0].Id);
        });
      }
    } catch (empErr) {
      console.error('Failed to load employees for leave dropdown', empErr);
    }

    // 2. Load Leave Records
    try {
      const leaveRes = await axios.get(LEAVE_URL, { headers: headers });
      setLeaveList(Array.isArray(leaveRes.data) ? leaveRes.data : []);
      setErrorMsg('');
    } catch (leaveErr) {
      console.error('Failed to load leave records', leaveErr);
      if (leaveErr.response && leaveErr.response.status === 401) {
        setErrorMsg('Unauthorized: Please login again.');
      } else {
        setErrorMsg('Failed to load leave records');
      }
    }
  };

  useEffect(function() {
    fetchData();
  }, []);

  const handleApplyLeave = async function(e) {
    e.preventDefault();
    if (!selectedEmployeeId) {
      alert('Please select an employee');
      return;
    }
    if (!startDate || !endDate) {
      alert('Please select start and end dates');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: 'Bearer ' + token } : {};

      const payload = {
        employeeId: parseInt(selectedEmployeeId, 10),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        reason: reason.trim() || 'No reason provided'
      };

      await axios.post(LEAVE_URL, payload, { headers: headers });
      setReason('');
      setStartDate('');
      setEndDate('');
      fetchData();
    } catch (err) {
      const serverMsg = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : (err.response && err.response.data ? JSON.stringify(err.response.data) : err.message);
      alert('Failed to submit leave request: ' + serverMsg);
    }
  };

  const handleUpdateStatus = async function(id, newStatus) {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: 'Bearer ' + token } : {};

      const payload = {
        status: newStatus
      };

      await axios.put(LEAVE_URL + '/' + id + '/status', payload, { headers: headers });
      fetchData();
    } catch (err) {
      const serverMsg = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : (err.response && err.response.data ? JSON.stringify(err.response.data) : err.message);
      alert('Failed to update leave status: ' + serverMsg);
    }
  };

  const employeeOptions = employees.map(function(emp) {
    const id = emp.id || emp.Id;
    const name = ((emp.firstName || emp.FirstName || '') + ' ' + (emp.lastName || emp.LastName || '')).trim() || 'Employee ' + id;
    return React.createElement('option', { key: id, value: id }, name);
  });

  const tableRows = leaveList.length === 0
    ? [
        React.createElement(
          'tr',
          { key: 'empty' },
          React.createElement('td', { colSpan: 6, style: { textAlign: 'center', padding: '15px', color: '#888' } }, 'No leave requests found')
        )
      ]
    : leaveList.map(function(item, idx) {
        const reqId = item.id || item.Id || idx;
        const empName = item.employeeName || (item.employee ? ((item.employee.firstName || '') + ' ' + (item.employee.lastName || '')) : 'Employee #' + item.employeeId);
        const sDate = item.startDate ? new Date(item.startDate).toLocaleDateString() : '-';
        const eDate = item.endDate ? new Date(item.endDate).toLocaleDateString() : '-';
        const itemReason = item.reason || 'N/A';
        const itemStatus = item.status || 'Pending';

        let statusColor = '#ff9800'; // Pending
        if (itemStatus.toLowerCase() === 'approved') statusColor = '#28a745';
        if (itemStatus.toLowerCase() === 'rejected') statusColor = '#dc3545';

        // Action Buttons: Sirf tab dikhayenge jab status Pending ho
        const actionContent = itemStatus.toLowerCase() === 'pending'
          ? React.createElement(
              'div',
              { style: { display: 'flex', gap: '6px' } },
              React.createElement(
                'button',
                {
                  type: 'button',
                  onClick: function() { handleUpdateStatus(reqId, 'Approved'); },
                  style: { padding: '4px 8px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }
                },
                'Approve'
              ),
              React.createElement(
                'button',
                {
                  type: 'button',
                  onClick: function() { handleUpdateStatus(reqId, 'Rejected'); },
                  style: { padding: '4px 8px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }
                },
                'Reject'
              )
            )
          : React.createElement('span', { style: { color: '#888', fontSize: '13px' } }, 'Completed');

        return React.createElement(
          'tr',
          { key: reqId, style: { borderBottom: '1px solid #eee' } },
          React.createElement('td', { style: { padding: '10px' } }, empName),
          React.createElement('td', { style: { padding: '10px' } }, sDate),
          React.createElement('td', { style: { padding: '10px' } }, eDate),
          React.createElement('td', { style: { padding: '10px' } }, itemReason),
          React.createElement('td', { style: { padding: '10px', fontWeight: 'bold', color: statusColor } }, itemStatus),
          React.createElement('td', { style: { padding: '10px' } }, actionContent)
        );
      });

  return React.createElement(
    'div',
    { style: { maxWidth: '900px', margin: '20px auto', fontFamily: 'sans-serif' } },
    React.createElement('h2', { style: { textAlign: 'center', color: '#555' } }, 'Leave Management'),
    errorMsg ? React.createElement('p', { style: { color: 'red', textAlign: 'center' } }, errorMsg) : null,

    // Apply Leave Form
    React.createElement(
      'form',
      { onSubmit: handleApplyLeave, style: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' } },
      React.createElement(
        'select',
        {
          value: selectedEmployeeId,
          onChange: function(e) { setSelectedEmployeeId(e.target.value); },
          style: { flex: '1 1 200px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }
        },
        employeeOptions.length > 0 ? employeeOptions : React.createElement('option', { value: '' }, 'No employees available')
      ),
      React.createElement('input', {
        type: 'date',
        value: startDate,
        required: true,
        style: { flex: '1 1 140px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' },
        onChange: function(e) { setStartDate(e.target.value); }
      }),
      React.createElement('input', {
        type: 'date',
        value: endDate,
        required: true,
        style: { flex: '1 1 140px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' },
        onChange: function(e) { setEndDate(e.target.value); }
      }),
      React.createElement('input', {
        type: 'text',
        placeholder: 'Reason for leave',
        value: reason,
        required: true,
        style: { flex: '2 1 220px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' },
        onChange: function(e) { setReason(e.target.value); }
      }),
      React.createElement(
        'button',
        {
          type: 'submit',
          style: { padding: '8px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }
        },
        'Submit Request'
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
          React.createElement('th', { style: { padding: '12px 10px' } }, 'Start Date'),
          React.createElement('th', { style: { padding: '12px 10px' } }, 'End Date'),
          React.createElement('th', { style: { padding: '12px 10px' } }, 'Reason'),
          React.createElement('th', { style: { padding: '12px 10px' } }, 'Status'),
          React.createElement('th', { style: { padding: '12px 10px' } }, 'Actions')
        )
      ),
      React.createElement('tbody', null, tableRows)
    )
  );
}