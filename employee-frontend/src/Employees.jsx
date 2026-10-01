import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const API_URL = 'http://localhost:5206/api/Employees';

  const fetchEmployees = async function() {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: 'Bearer ' + token } : {};
      const res = await axios.get(API_URL, { headers: headers });
      setEmployees(Array.isArray(res.data) ? res.data : []);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg('Failed to load employees');
    }
  };

  useEffect(function() {
    fetchEmployees();
  }, []);

  const handleLogout = function() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleFormSubmit = async function(e) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: 'Bearer ' + token } : {};

      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || 'Unknown';
      const lastName = nameParts.slice(1).join(' ').trim() || '-';

      const deptQuery = department.trim() ? '?departmentName=' + encodeURIComponent(department.trim()) : '';

      if (editingId) {
        const updatePayload = {
          firstName: firstName,
          lastName: lastName,
          phone: '123-456-7890',
          salary: 60000,
          departmentId: 1
        };

        await axios.put(API_URL + '/' + editingId + deptQuery, updatePayload, { headers: headers });
        setEditingId(null);
      } else {
        const createPayload = {
          firstName: firstName,
          lastName: lastName,
          email: firstName.toLowerCase() + Date.now() + '@example.com',
          phone: '123-456-7890',
          hireDate: new Date().toISOString(),
          salary: 60000,
          departmentId: 1
        };

        await axios.post(API_URL + deptQuery, createPayload, { headers: headers });
      }

      setName('');
      setDepartment('');
      fetchEmployees();
    } catch (err) {
      const serverMsg = err.response && err.response.data 
        ? JSON.stringify(err.response.data) 
        : err.message;
      alert('Action failed: ' + serverMsg);
    }
  };

  const handleStartEdit = function(emp) {
    setEditingId(emp.id || emp.Id);
    const fName = emp.firstName || emp.FirstName || '';
    const lName = emp.lastName || emp.LastName || '';
    const fullName = (lName && lName !== '-') ? (fName + ' ' + lName) : fName;
    setName(fullName || emp.name || emp.Name || '');
    setDepartment(emp.departmentName || emp.DepartmentName || (emp.department && emp.department.name) || '');
  };

  const handleCancelEdit = function() {
    setEditingId(null);
    setName('');
    setDepartment('');
  };

  const handleDelete = async function(id) {
    const confirmDelete = window.confirm('Are you sure you want to delete this employee?');
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: 'Bearer ' + token } : {};
      await axios.delete(API_URL + '/' + id, { headers: headers });
      fetchEmployees();
    } catch (err) {
      alert('Failed to delete employee');
    }
  };

  const filteredEmployees = employees.filter(function(emp) {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    const fName = (emp.firstName || emp.FirstName || '').toLowerCase();
    const lName = (emp.lastName || emp.LastName || '').toLowerCase();
    const fullName = (fName + ' ' + lName).trim();
    const deptName = (emp.departmentName || emp.DepartmentName || (emp.department && emp.department.name) || '').toLowerCase();

    return fullName.includes(term) || deptName.includes(term);
  });

  const tableRows = filteredEmployees.length === 0
    ? [
        React.createElement(
          'tr',
          { key: 'empty' },
          React.createElement(
            'td',
            { colSpan: 3, style: { textAlign: 'center', padding: '15px', color: '#888' } },
            searchTerm ? 'No matching employees found' : 'No employees found'
          )
        )
      ]
    : filteredEmployees.map(function(emp, idx) {
        const empId = emp.id || emp.Id || idx;
        const fName = emp.firstName || emp.FirstName || '';
        const lName = emp.lastName || emp.LastName || '';
        
        let displayName = fName;
        if (lName && lName !== '-') {
          displayName = fName + ' ' + lName;
        }
        if (!displayName) {
          displayName = emp.name || emp.Name || 'N/A';
        }

        const deptName = emp.departmentName || emp.DepartmentName || (emp.department && emp.department.name) || 'N/A';

        return React.createElement(
          'tr',
          { key: empId, style: { borderBottom: '1px solid #eee' } },
          React.createElement('td', { style: { padding: '10px' } }, displayName.trim() || 'N/A'),
          React.createElement('td', { style: { padding: '10px' } }, deptName),
          React.createElement(
            'td',
            { style: { padding: '10px', display: 'flex', gap: '8px' } },
            React.createElement(
              'button',
              {
                onClick: function() { handleStartEdit(emp); },
                style: { padding: '5px 10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }
              },
              'Edit'
            ),
            React.createElement(
              'button',
              {
                onClick: function() { handleDelete(empId); },
                style: { padding: '5px 10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }
              },
              'Delete'
            )
          )
        );
      });

  return React.createElement(
    'div',
    { style: { maxWidth: '850px', margin: '20px auto', fontFamily: 'sans-serif' } },
    React.createElement('h2', { style: { textAlign: 'center', color: '#555', marginTop: '10px' } }, 'Employee Directory'),
    errorMsg ? React.createElement('p', { style: { color: 'red', textAlign: 'center' } }, errorMsg) : null,
    
    // Add / Edit Form
    React.createElement(
      'form',
      { onSubmit: handleFormSubmit, style: { display: 'flex', gap: '10px', marginBottom: '15px' } },
      React.createElement('input', {
        type: 'text',
        placeholder: 'Employee Name',
        value: name,
        required: true,
        style: { flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' },
        onChange: function(e) { setName(e.target.value); }
      }),
      React.createElement('input', {
        type: 'text',
        placeholder: 'Department',
        value: department,
        style: { flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' },
        onChange: function(e) { setDepartment(e.target.value); }
      }),
      React.createElement(
        'button',
        {
          type: 'submit',
          style: {
            padding: '8px 16px',
            backgroundColor: editingId ? '#007bff' : '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }
        },
        editingId ? 'Update Employee' : 'Add Employee'
      ),
      editingId
        ? React.createElement(
            'button',
            {
              type: 'button',
              onClick: handleCancelEdit,
              style: { padding: '8px 16px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }
            },
            'Cancel'
          )
        : null
    ),

    // Search Bar & Counter
    React.createElement(
      'div',
      { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' } },
      React.createElement('input', {
        type: 'text',
        placeholder: 'Search by name or department...',
        value: searchTerm,
        style: { width: '60%', padding: '8px', borderRadius: '4px', border: '1px solid #aaa' },
        onChange: function(e) { setSearchTerm(e.target.value); }
      }),
      React.createElement(
        'span',
        { style: { color: '#666', fontSize: '14px', fontWeight: 'bold' } },
        'Total: ' + filteredEmployees.length
      )
    ),

    // Directory Table
    React.createElement(
      'table',
      { style: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', border: '1px solid #e0e0e0' } },
      React.createElement(
        'thead',
        null,
        React.createElement(
          'tr',
          { style: { borderBottom: '2px solid #ccc', backgroundColor: '#f4f6f8' } },
          React.createElement('th', { style: { padding: '12px 10px' } }, 'Name'),
          React.createElement('th', { style: { padding: '12px 10px' } }, 'Department'),
          React.createElement('th', { style: { padding: '12px 10px' } }, 'Actions')
        )
      ),
      React.createElement('tbody', null, tableRows)
    )
  );
}