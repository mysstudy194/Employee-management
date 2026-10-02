import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Leave() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [msg, setMsg] = useState({ text: '', isError: false });

  const BASE_URL = 'https://employee-management-production-aa2e.up.railway.app/api';

  const fetchLeaveRequests = async function() {
    try {
      setLoading(true);
      const res = await axios.get(BASE_URL + '/LeaveRequests');
      const data = Array.isArray(res.data) ? res.data : [];
      setLeaves(data);
    } catch (err) {
      setMsg({ text: 'Leave requests fetch karne mein error aaya.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(function() {
    fetchLeaveRequests();
  }, []);

  const handleStatusUpdate = async function(id, status) {
    try {
      setActionLoadingId(id);
      await axios.put(BASE_URL + '/LeaveRequests/' + id + '/status', {
        status: status
      });
      setLeaves(function(prev) {
        return prev.map(function(item) {
          if (item.id === id || item.Id === id) {
            return Object.assign({}, item, { status: status, Status: status });
          }
          return item;
        });
      });
      setMsg({ text: `Request successfully ${status.toLowerCase()} ho gayi!`, isError: false });
    } catch (err) {
      const errDetail = err.response?.data?.message || 'Status update nahi ho saka.';
      setMsg({ text: errDetail, isError: true });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter logic (by search employee name and by status)
  const filteredLeaves = leaves.filter(function(item) {
    const empName = (item.employeeName || item.EmployeeName || ('ID: ' + (item.employeeId || item.EmployeeId))).toLowerCase();
    const matchesSearch = empName.includes(searchTerm.toLowerCase());

    const itemStatus = (item.status || item.Status || 'Pending').toUpperCase();
    const matchesFilter = filterStatus === 'ALL' || itemStatus === filterStatus;

    return matchesSearch && matchesFilter;
  });

  return React.createElement(
    'div',
    {
      style: {
        width: '100%',
        maxWidth: '1050px',
        margin: '20px auto',
        padding: '0 16px',
        boxSizing: 'border-box',
        fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif'
      }
    },

    // Title
    React.createElement('h2', { style: { textAlign: 'center', color: '#1f2937', marginBottom: '20px' } }, 'Leave Management'),

    // Alert Message
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

    // Controls Bar (Search + Filter + Refresh)
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
      React.createElement(
        'div',
        { style: { display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' } },
        React.createElement('input', {
          type: 'text',
          placeholder: 'Search by employee name...',
          value: searchTerm,
          onChange: function(e) { setSearchTerm(e.target.value); },
          style: {
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            width: '240px',
            fontSize: '14px'
          }
        }),
        React.createElement(
          'select',
          {
            value: filterStatus,
            onChange: function(e) { setFilterStatus(e.target.value); },
            style: {
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
              backgroundColor: '#fff',
              color: '#374151'
            }
          },
          React.createElement('option', { value: 'ALL' }, 'All Statuses'),
          React.createElement('option', { value: 'PENDING' }, 'Pending Only'),
          React.createElement('option', { value: 'APPROVED' }, 'Approved'),
          React.createElement('option', { value: 'REJECTED' }, 'Rejected')
        )
      ),
      React.createElement(
        'button',
        {
          onClick: fetchLeaveRequests,
          style: {
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
          }
        },
        'Refresh Requests'
      )
    ),

    // Leave Requests Table
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
        { style: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' } },
        React.createElement(
          'thead',
          null,
          React.createElement(
            'tr',
            { style: { backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' } },
            React.createElement('th', { style: { padding: '12px 16px', color: '#4b5563', fontSize: '13px' } }, 'Employee'),
            React.createElement('th', { style: { padding: '12px 16px', color: '#4b5563', fontSize: '13px' } }, 'Start Date'),
            React.createElement('th', { style: { padding: '12px 16px', color: '#4b5563', fontSize: '13px' } }, 'End Date'),
            React.createElement('th', { style: { padding: '12px 16px', color: '#4b5563', fontSize: '13px' } }, 'Reason'),
            React.createElement('th', { style: { padding: '12px 16px', color: '#4b5563', fontSize: '13px' } }, 'Status'),
            React.createElement('th', { style: { padding: '12px 16px', color: '#4b5563', fontSize: '13px', textAlign: 'center' } }, 'Action')
          )
        ),
        React.createElement(
          'tbody',
          null,
          loading
            ? React.createElement(
                'tr',
                null,
                React.createElement('td', { colSpan: '6', style: { padding: '24px', textAlign: 'center', color: '#6b7280' } }, 'Leave requests load ho rahi hain...')
              )
            : filteredLeaves.length === 0
            ? React.createElement(
                'tr',
                null,
                React.createElement('td', { colSpan: '6', style: { padding: '24px', textAlign: 'center', color: '#9ca3af' } }, 'Koi leave request nahi mili.')
              )
            : filteredLeaves.map(function(item) {
                const id = item.id || item.Id;
                const status = (item.status || item.Status || 'Pending').toLowerCase();
                const isPending = status === 'pending';
                const isActionLoading = actionLoadingId === id;

                const startDateStr = (item.startDate || item.StartDate || '').split('T')[0];
                const endDateStr = (item.endDate || item.EndDate || '').split('T')[0];

                const badgeStyle = {
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'inline-block',
                  textTransform: 'capitalize'
                };

                if (status === 'approved') {
                  badgeStyle.backgroundColor = '#dcfce7';
                  badgeStyle.color = '#166534';
                } else if (status === 'rejected') {
                  badgeStyle.backgroundColor = '#fee2e2';
                  badgeStyle.color = '#991b1b';
                } else {
                  badgeStyle.backgroundColor = '#fef3c7';
                  badgeStyle.color = '#92400e';
                }

                return React.createElement(
                  'tr',
                  { key: id, style: { borderBottom: '1px solid #f3f4f6' } },
                  React.createElement('td', { style: { padding: '12px 16px', fontWeight: '600', color: '#1f2937' } }, item.employeeName || item.EmployeeName || ('ID: ' + (item.employeeId || item.EmployeeId))),
                  React.createElement('td', { style: { padding: '12px 16px', color: '#4b5563' } }, startDateStr),
                  React.createElement('td', { style: { padding: '12px 16px', color: '#4b5563' } }, endDateStr),
                  React.createElement('td', { style: { padding: '12px 16px', color: '#1f2937' } }, item.reason || item.Reason),
                  React.createElement(
                    'td',
                    { style: { padding: '12px 16px' } },
                    React.createElement('span', { style: badgeStyle }, item.status || item.Status || 'Pending')
                  ),
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
                              disabled: isActionLoading,
                              style: {
                                backgroundColor: '#16a34a',
                                color: '#ffffff',
                                border: 'none',
                                padding: '6px 14px',
                                borderRadius: '6px',
                                cursor: isActionLoading ? 'not-allowed' : 'pointer',
                                fontSize: '12px',
                                fontWeight: '600'
                              }
                            },
                            isActionLoading ? '...' : 'Approve'
                          ),
                          React.createElement(
                            'button',
                            {
                              onClick: function() { handleStatusUpdate(id, 'Rejected'); },
                              disabled: isActionLoading,
                              style: {
                                backgroundColor: '#ef4444',
                                color: '#ffffff',
                                border: 'none',
                                padding: '6px 14px',
                                borderRadius: '6px',
                                cursor: isActionLoading ? 'not-allowed' : 'pointer',
                                fontSize: '12px',
                                fontWeight: '600'
                              }
                            },
                            isActionLoading ? '...' : 'Reject'
                          )
                        )
                      : React.createElement('span', { style: { fontSize: '13px', color: '#9ca3af', fontWeight: '500' } }, 'Done')
                  )
                );
              })
        )
      )
    )
  );
}