import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', isError: false });

  // Edit Modal State
  const [editingEmp, setEditingEmp] = useState(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDepartmentName, setEditDepartmentName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');

  const BASE_URL = 'https://employee-management-production-aa2e.up.railway.app/api';

  const getAuthHeaders = function() {
    const token = localStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  const fetchData = async function() {
    try {
      const [empRes, deptRes] = await Promise.all([
        axios.get(BASE_URL + '/Employees'),
        axios.get(BASE_URL + '/Departments', getAuthHeaders()).catch(function() {
          return axios.get(BASE_URL + '/Departments');
        }).catch(function() { return { data: [] }; })
      ]);

      const emps = Array.isArray(empRes.data) ? empRes.data : [];
      setEmployees(emps);

      const depts = Array.isArray(deptRes.data) ? deptRes.data : [];
      setDepartments(depts);
    } catch (err) {
      setMsg({ text: 'Failed to fetch employee and department data.', isError: true });
    }
  };

  useEffect(function() {
    fetchData();
  }, []);

  const getOrCreateDepartmentId = async function(deptInputName) {
    const cleanName = (deptInputName || '').trim();
    if (!cleanName) return 1;

    const existing = departments.find(function(d) {
      const dName = (d.name || d.Name || '').toLowerCase().trim();
      return dName === cleanName.toLowerCase();
    });

    if (existing) {
      return existing.id || existing.Id;
    }

    try {
      const createRes = await axios.post(
        BASE_URL + '/Departments',
        {
          name: cleanName,
          description: cleanName + ' Department'
        },
        getAuthHeaders()
      );
      const newId = createRes.data?.id || createRes.data?.Id;
      if (newId) return newId;
    } catch (err) {
      console.warn('Backend rejected department creation, using fallback department.');
    }

    if (departments.length > 0) {
      return departments[0].id || departments[0].Id || 1;
    }
    return 1;
  };

  // Handle Add Employee
  const handleSubmit = async function(e) {
    e.preventDefault();
    setMsg({ text: '', isError: false });

    if (!firstName || !lastName || !username || !password || !departmentName.trim()) {
      setMsg({ text: 'Please fill in all required fields.', isError: true });
      return;
    }

    // Capture the exact employee full name before clearing inputs
    const registeredFullName = firstName.trim() + ' ' + lastName.trim();

    try {
      setLoading(true);

      const resolvedDeptId = await getOrCreateDepartmentId(departmentName.trim());
      const empEmail = email.trim() || (username.trim().toLowerCase().replace(/\s+/g, '') + '@company.com');

      // 1. Create Employee Record
      await axios.post(BASE_URL + '/Employees', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: empEmail,
        phone: phone.trim() || '123-456-7890',
        departmentId: parseInt(resolvedDeptId),
        salary: 50000
      });

      // 2. Register Login Credentials
      try {
        await axios.post(BASE_URL + '/auth/register', {
          username: username.trim(),
          email: empEmail,
          password: password.trim(),
          role: 'Employee'
        });
        setMsg({ text: 'Employee "' + registeredFullName + '" created successfully!', isError: false });
      } catch (authErr) {
        const errorDetail =
          authErr.response?.data?.message ||
          authErr.response?.data?.details ||
          'Username already exists or password invalid.';
        setMsg({ text: 'Employee "' + registeredFullName + '" created, but login registration failed: ' + errorDetail, isError: true });
      }

      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setDepartmentName('');
      setUsername('');
      setPassword('');
      fetchData();
    } catch (err) {
      const errResponse = err.response?.data?.message || 'An error occurred while creating the employee.';
      setMsg({ text: errResponse, isError: true });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = function(emp) {
    setEditingEmp(emp);
    setEditFirstName(emp.firstName || emp.FirstName || '');
    setEditLastName(emp.lastName || emp.LastName || '');
    setEditPhone(emp.phone || emp.Phone || '');
    setEditDepartmentName(emp.departmentName || emp.DepartmentName || '');

    const empMail = emp.email || emp.Email || '';
    const inferredUser = empMail.includes('@') ? empMail.split('@')[0] : (emp.firstName || '').toLowerCase();
    setEditUsername(inferredUser);
    setEditPassword('');
  };

  const handleEditSave = async function(e) {
    e.preventDefault();
    if (!editingEmp) return;
    const id = editingEmp.id || editingEmp.Id;
    const updatedFullName = editFirstName.trim() + ' ' + editLastName.trim();

    try {
      setLoading(true);
      const resolvedDeptId = await getOrCreateDepartmentId(editDepartmentName.trim());

      await axios.put(BASE_URL + '/Employees/' + id, {
        id: id,
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        email: editingEmp.email || editingEmp.Email,
        phone: editPhone.trim(),
        departmentId: parseInt(resolvedDeptId),
        salary: editingEmp.salary || editingEmp.Salary || 50000
      });

      if (editPassword.trim() || editUsername.trim()) {
        try {
          await axios.post(BASE_URL + '/auth/register', {
            username: editUsername.trim(),
            email: editingEmp.email || editingEmp.Email || (editUsername.trim().toLowerCase() + '@company.com'),
            password: editPassword.trim() || 'Emp@12345',
            role: 'Employee'
          });
        } catch (ignoredAuth) {}
      }

      setMsg({ text: 'Employee "' + updatedFullName + '" updated successfully!', isError: false });
      setEditingEmp(null);
      fetchData();
    } catch (err) {
      setMsg({ text: err.message || 'Failed to update employee details.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async function(id, name) {
    if (!window.confirm(`Are you sure you want to delete employee "\({name}" (ID:\){id})?`)) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(BASE_URL + '/Employees/' + id);
      setMsg({ text: 'Employee "' + name + '" deleted successfully!', isError: false });
      fetchData();
    } catch (err) {
      const errText = err.response?.data?.message || 'Failed to delete employee.';
      setMsg({ text: errText, isError: true });
    } finally {
      setLoading(false);
    }
  };

  return React.createElement(
    'div',
    {
      style: {
        width: '100%',
        maxWidth: '1100px',
        margin: '20px auto',
        padding: '0 16px',
        boxSizing: 'border-box',
        fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif'
      }
    },
    React.createElement('h2', { style: { textAlign: 'center', color: '#1f2937', marginBottom: '20px' } }, 'Employee Management'),

    // Alert Message Popup
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

    // Form Container
    React.createElement(
      'div',
      {
        style: {
          backgroundColor: '#ffffff',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          marginBottom: '25px'
        }
      },
      React.createElement('h3', { style: { margin: '0 0 16px 0', color: '#374151', fontSize: '16px' } }, 'Add New Employee & Portal Credentials'),
      React.createElement(
        'form',
        { onSubmit: handleSubmit, style: { display: 'flex', flexWrap: 'wrap', gap: '14px' } },

        // First Name
        React.createElement('div', { style: { flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '5px' } },
          React.createElement('label', { style: { fontSize: '12px', fontWeight: 'bold', color: '#4b5563' } }, 'First Name *'),
          React.createElement('input', {
            type: 'text',
            placeholder: 'First Name',
            value: firstName,
            onChange: function(e) { setFirstName(e.target.value); },
            required: true,
            style: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }
          })
        ),

        // Last Name
        React.createElement('div', { style: { flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '5px' } },
          React.createElement('label', { style: { fontSize: '12px', fontWeight: 'bold', color: '#4b5563' } }, 'Last Name *'),
          React.createElement('input', {
            type: 'text',
            placeholder: 'Last Name',
            value: lastName,
            onChange: function(e) { setLastName(e.target.value); },
            required: true,
            style: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }
          })
        ),

        // Department
        React.createElement('div', { style: { flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '5px' } },
          React.createElement('label', { style: { fontSize: '12px', fontWeight: 'bold', color: '#1d4ed8' } }, 'Department *'),
          React.createElement('input', {
            type: 'text',
            list: 'department-suggestions',
            placeholder: 'Type department (e.g. CS, Software, HR)',
            value: departmentName,
            onChange: function(e) { setDepartmentName(e.target.value); },
            required: true,
            style: { padding: '10px 14px', borderRadius: '8px', border: '2px solid #2563eb', fontSize: '14px', backgroundColor: '#f0f7ff' }
          }),
          React.createElement(
            'datalist',
            { id: 'department-suggestions' },
            departments.map(function(d, index) {
              return React.createElement('option', { key: index, value: d.name || d.Name });
            })
          )
        ),

        // Email
        React.createElement('div', { style: { flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '5px' } },
          React.createElement('label', { style: { fontSize: '12px', fontWeight: 'bold', color: '#4b5563' } }, 'Email (Optional)'),
          React.createElement('input', {
            type: 'email',
            placeholder: 'Email',
            value: email,
            onChange: function(e) { setEmail(e.target.value); },
            style: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }
          })
        ),

        // Phone
        React.createElement('div', { style: { flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '5px' } },
          React.createElement('label', { style: { fontSize: '12px', fontWeight: 'bold', color: '#4b5563' } }, 'Phone (Optional)'),
          React.createElement('input', {
            type: 'text',
            placeholder: 'Phone number',
            value: phone,
            onChange: function(e) { setPhone(e.target.value); },
            style: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }
          })
        ),

        // Portal Username
        React.createElement('div', { style: { flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '5px' } },
          React.createElement('label', { style: { fontSize: '12px', fontWeight: 'bold', color: '#1d4ed8' } }, 'Portal Username *'),
          React.createElement('input', {
            type: 'text',
            placeholder: 'Choose unique username',
            value: username,
            onChange: function(e) { setUsername(e.target.value); },
            required: true,
            style: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #2563eb', fontSize: '14px' }
          })
        ),

        // Portal Password
        React.createElement('div', { style: { flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '5px' } },
          React.createElement('label', { style: { fontSize: '12px', fontWeight: 'bold', color: '#1d4ed8' } }, 'Portal Password *'),
          React.createElement('input', {
            type: 'password',
            placeholder: 'e.g. Pass@123',
            value: password,
            onChange: function(e) { setPassword(e.target.value); },
            required: true,
            style: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #2563eb', fontSize: '14px' }
          })
        ),

        // Submit Button
        React.createElement('div', { style: { flex: '1 1 200px', display: 'flex', alignItems: 'flex-end' } },
          React.createElement(
            'button',
            {
              type: 'submit',
              disabled: loading,
              style: {
                width: '100%',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                border: 'none',
                padding: '11px 20px',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }
            },
            loading ? 'Processing...' : 'Add Employee'
          )
        )
      )
    ),

    // Directory Table
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
        { style: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '780px' } },
        React.createElement(
          'thead',
          null,
          React.createElement(
            'tr',
            { style: { backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' } },
            React.createElement('th', { style: { padding: '12px 16px', color: '#4b5563', fontSize: '13px' } }, 'ID'),
            React.createElement('th', { style: { padding: '12px 16px', color: '#4b5563', fontSize: '13px' } }, 'Name'),
            React.createElement('th', { style: { padding: '12px 16px', color: '#4b5563', fontSize: '13px' } }, 'Email'),
            React.createElement('th', { style: { padding: '12px 16px', color: '#4b5563', fontSize: '13px' } }, 'Phone'),
            React.createElement('th', { style: { padding: '12px 16px', color: '#4b5563', fontSize: '13px' } }, 'Department'),
            React.createElement('th', { style: { padding: '12px 16px', color: '#4b5563', fontSize: '13px', textAlign: 'center' } }, 'Actions')
          )
        ),
        React.createElement(
          'tbody',
          null,
          employees.length === 0
            ? React.createElement(
                'tr',
                null,
                React.createElement('td', { colSpan: '6', style: { padding: '24px', textAlign: 'center', color: '#9ca3af' } }, 'No employees found.')
              )
            : employees.map(function(emp) {
                const id = emp.id || emp.Id;
                const fullName = (emp.firstName || emp.FirstName) + ' ' + (emp.lastName || emp.LastName);

                return React.createElement(
                  'tr',
                  { key: id, style: { borderBottom: '1px solid #f3f4f6' } },
                  React.createElement('td', { style: { padding: '12px 16px', color: '#6b7280' } }, id),
                  React.createElement('td', { style: { padding: '12px 16px', fontWeight: '600', color: '#1f2937' } }, fullName),
                  React.createElement('td', { style: { padding: '12px 16px', color: '#4b5563' } }, emp.email || emp.Email || '-'),
                  React.createElement('td', { style: { padding: '12px 16px', color: '#4b5563' } }, emp.phone || emp.Phone || '-'),
                  React.createElement(
                    'td',
                    { style: { padding: '12px 16px' } },
                    React.createElement(
                      'span',
                      {
                        style: {
                          backgroundColor: '#e0e7ff',
                          color: '#3730a3',
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }
                      },
                      emp.departmentName || emp.DepartmentName || 'General'
                    )
                  ),
                  React.createElement(
                    'td',
                    { style: { padding: '12px 16px', textAlign: 'center' } },
                    React.createElement(
                      'div',
                      { style: { display: 'inline-flex', gap: '8px' } },
                      React.createElement(
                        'button',
                        {
                          onClick: function() { startEdit(emp); },
                          style: {
                            backgroundColor: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }
                        },
                        'Edit'
                      ),
                      React.createElement(
                        'button',
                        {
                          onClick: function() { handleDelete(id, fullName); },
                          style: {
                            backgroundColor: '#ef4444',
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }
                        },
                        'Delete'
                      )
                    )
                  )
                );
              })
        )
      )
    ),

    // Edit Modal Popup
    editingEmp ? React.createElement(
      'div',
      {
        style: {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '16px'
        }
      },
      React.createElement(
        'div',
        {
          style: {
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '28px',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }
        },
        React.createElement('h3', { style: { margin: '0 0 16px 0', color: '#0f172a', fontSize: '18px' } }, `Edit Employee & Login Credentials (#${editingEmp.id || editingEmp.Id})`),
        React.createElement(
          'form',
          { onSubmit: handleEditSave, style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
          React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' } }, 'First Name *'),
            React.createElement('input', {
              type: 'text',
              value: editFirstName,
              onChange: function(e) { setEditFirstName(e.target.value); },
              required: true,
              style: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' } }, 'Last Name *'),
            React.createElement('input', {
              type: 'text',
              value: editLastName,
              onChange: function(e) { setEditLastName(e.target.value); },
              required: true,
              style: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' } }, 'Department'),
            React.createElement('input', {
              type: 'text',
              value: editDepartmentName,
              onChange: function(e) { setEditDepartmentName(e.target.value); },
              placeholder: 'Type department name',
              style: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' } }, 'Phone'),
            React.createElement('input', {
              type: 'text',
              value: editPhone,
              onChange: function(e) { setEditPhone(e.target.value); },
              style: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }
            })
          ),
          React.createElement('div', { style: { borderTop: '1px dashed #cbd5e1', margin: '8px 0 2px 0' } }),
          React.createElement('span', { style: { fontSize: '12px', fontWeight: 'bold', color: '#2563eb' } }, '🔑 Portal Login Credentials'),
          React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' } }, 'Portal Username'),
            React.createElement('input', {
              type: 'text',
              placeholder: 'Username',
              value: editUsername,
              onChange: function(e) { setEditUsername(e.target.value); },
              style: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #93c5fd', backgroundColor: '#eff6ff', boxSizing: 'border-box' }
            })
          ),
          React.createElement('div', null,
            React.createElement('label', { style: { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' } }, 'New Password (Leave blank to keep existing)'),
            React.createElement('input', {
              type: 'password',
              placeholder: 'New Password (e.g. Pass@123)',
              value: editPassword,
              onChange: function(e) { setEditPassword(e.target.value); },
              style: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #93c5fd', backgroundColor: '#eff6ff', boxSizing: 'border-box' }
            })
          ),
          React.createElement(
            'div',
            { style: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' } },
            React.createElement(
              'button',
              {
                type: 'button',
                onClick: function() { setEditingEmp(null); },
                style: {
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }
              },
              'Cancel'
            ),
            React.createElement(
              'button',
              {
                type: 'submit',
                disabled: loading,
                style: {
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 20px',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }
              },
              loading ? 'Saving...' : 'Save Changes'
            )
          )
        )
      )
    ) : null
  );
}