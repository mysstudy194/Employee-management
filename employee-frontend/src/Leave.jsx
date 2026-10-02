import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function LeaveRequests() {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', isError: false });

  const BASE_URL = 'https://employee-management-production-aa2e.up.railway.app/api';

  const fetchData = async function() {
    try {
      const [leaveRes, empRes] = await Promise.all([
        axios.get(BASE_URL + '/LeaveRequests'),
        axios.get(BASE_URL + '/Employees')
      ]);
      const leavesData = Array.isArray(leaveRes.data) ? leaveRes.data : [];
      const empsData = Array.isArray(empRes.data) ? empRes.data : [];
      setLeaves(leavesData);
      setEmployees(empsData);
      if (empsData.length > 0 && !selectedEmp) {
        setSelectedEmp(empsData[0].id || empsData[0].Id);
      }
    } catch (err) {
      setMsg({ text: 'Data fetch karne mein masla hua', isError: true });
    }
  };

  useEffect(function() {
    fetchData();
  }, []);

  const handleSubmit = async function(e) {
    e.preventDefault();
    if (!selectedEmp || !startDate || !endDate || !reason) {
      setMsg({ text: 'Tamam fields fill karein', isError: true });
      return;
    }

    try {
      setLoading(true);
      await axios.post(BASE_URL + '/LeaveRequests', {
        employeeId: parseInt(selectedEmp),
        startDate: startDate,
        endDate: endDate,
        reason: reason
      });
      setMsg({ text: 'Leave request submit ho gayi!', isError: false });
      setReason('');
      fetchData();
    } catch (err) {
      setMsg({ text: 'Request submit nahi ho saki', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async function(id, status) {
    try {
      await axios.put(BASE_URL + '/LeaveRequests/' + id + '/status', {
        status: status
      });
      setLeaves(function(prev) {
        return prev.map(function(l) {
          return (l.id === id || l.Id === id) ? Object.assign({}, l, { status: status, Status: status }) : l;
        });
      });
      setMsg({ text: 'Request ' + status + ' kar di gayi!', isError: false });
    } catch (err) {
      setMsg({ text: 'Status update nahi ho saka', isError: true });
    }
  };

  return React.createElement(
    'div',
    { style: { width: '100%', maxWidth: '1000px', margin: '20px auto', padding: '0 15px', boxSizing: 'border-box', fontFamily: 'sans-serif' } },
    React.createElement('h2', { style: { textAlign: 'center', color: '#333', marginBottom: '20px' } }, 'Leave Management'),

    msg.text ? React.createElement(
      'div',
      {
        style: {
          padding: '10px 15px',
          marginBottom: '15px',
          borderRadius: '5px',
          textAlign: 'center',
          backgroundColor: msg.isError ? '#f8d7da' : '#d4edda',
          color: msg.isError ? '#721c24' : '#155724',
          border: '1px solid ' + (msg.isError ? '#f5c6cb' : '#c3e6cb')
        }
      },
      msg.text
    ) : null,

    // Form
    React.createElement(
      'form',
      {
        onSubmit: handleSubmit,
        style: {
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          marginBottom: '25px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px'
        }
      },
      React.createElement(
        'select',
        {
          value: selectedEmp,
          onChange: function(e) { setSelectedEmp(e.target.value); },
          style: { flex: '1 1 200px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }
        },
        employees.map(function(emp) {
          const val = emp.id || emp.Id;
          const label = (emp.firstName || emp.FirstName) + ' ' + (emp.lastName || emp.LastName);
          return React.createElement('option', { key: val, value: val }, label);
        })
      ),
      React.createElement('input', {
        type: 'date',
        value: startDate,
        onChange: function(e) { setStartDate(e.target.value); },
        style: { flex: '1 1 150px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' },
        required: true
      }),
      React.createElement('input', {
        type: 'date',
        value: endDate,
        onChange: function(e) { setEndDate(e.target.value); },
        style: { flex: '1 1 150px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' },
        required: true
      }),
      React.createElement('input', {
        type: 'text',
        placeholder: 'Reason for leave',
        value: reason,
        onChange: function(e) { setReason(e.target.value); },
        style: { flex: '2 1 220px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' },
        required: true
      }),
      React.createElement(
        'button',
        {
          type: 'submit',
          disabled: loading,
          style: {
            flex: '1 1 120px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }
        },
        loading ? 'Submitting...' : 'Submit Request'
      )
    ),

    // Table
    React.createElement(
      'div',
      {
        style: {
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          overflowX: 'auto',
          width: '100%'
        }
      },
      React.createElement(
        'table',
        { style: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' } },
        React.createElement(
          'thead',
          null,
          React.createElement(
            'tr',
            { style: { backgroundColor: '#f4f6f9', borderBottom: '2px solid #dee2e6' } },
            React.createElement('th', { style: { padding: '12px 16px', color: '#495057' } }, 'Employee'),
            React.createElement('th', { style: { padding: '12px 16px', color: '#495057' } }, 'Start Date'),
            React.createElement('th', { style: { padding: '12px 16px', color: '#495057' } }, 'End Date'),
            React.createElement('th', { style: { padding: '12px 16px', color: '#495057' } }, 'Reason'),
            React.createElement('th', { style: { padding: '12px 16px', color: '#495057' } }, 'Status'),
            React.createElement('th', { style: { padding: '12px 16px', color: '#495057', textAlign: 'center' } }, 'Action')
          )
        ),
        React.createElement(
          'tbody',
          null,
          leaves.length === 0
            ? React.createElement(
                'tr',
                null,
                React.createElement('td', { colSpan: '6', style: { padding: '20px', textAlign: 'center', color: '#888' } }, 'Koi leave request maujood nahi hai.')
              )
            : leaves.map(function(leave) {
                const id = leave.id || leave.Id;
                const rawStatus = leave.status || leave.Status || 'Pending';
                const statusLower = rawStatus.toLowerCase();
                const isPending = statusLower === 'pending';

                const statusColor =
                  statusLower === 'approved' ? '#28a745' : statusLower === 'rejected' ? '#dc3545' : '#f39c12';

                return React.createElement(
                  'tr',
                  { key: id, style: { borderBottom: '1px solid #eee' } },
                  React.createElement('td', { style: { padding: '12px 16px', fontWeight: '500' } }, leave.employeeName || leave.EmployeeName || ('ID: ' + (leave.employeeId || leave.EmployeeId))),
                  React.createElement('td', { style: { padding: '12px 16px', color: '#555' } }, ((leave.startDate || leave.StartDate || '').split('T')[0])),
                  React.createElement('td', { style: { padding: '12px 16px', color: '#555' } }, ((leave.endDate || leave.EndDate || '').split('T')[0])),
                  React.createElement('td', { style: { padding: '12px 16px', color: '#555' } }, leave.reason || leave.Reason),
                  React.createElement('td', { style: { padding: '12px 16px', fontWeight: 'bold', color: statusColor, textTransform: 'capitalize' } }, rawStatus),
                  React.createElement(
                    'td',
                    { style: { padding: '12px 16px', textAlign: 'center' } },
                    isPending
                      ? React.createElement(
                          'div',
                          { style: { display: 'inline-flex', gap: '8px' } },
                          React.createElement(
                            'button',
                            {
                              onClick: function() { handleStatusUpdate(id, 'Approved'); },
                              style: {
                                backgroundColor: '#28a745',
                                color: '#fff',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }
                            },
                            'Approve'
                          ),
                          React.createElement(
                            'button',
                            {
                              onClick: function() { handleStatusUpdate(id, 'Rejected'); },
                              style: {
                                backgroundColor: '#dc3545',
                                color: '#fff',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }
                            },
                            'Reject'
                          )
                        )
                      : React.createElement('span', { style: { fontSize: '13px', color: '#888' } }, 'Done')
                  )
                );
              })
        )
      )
    )
  );
}