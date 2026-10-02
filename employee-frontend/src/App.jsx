import React, { useState } from 'react';
import axios from 'axios';
import Dashboard from './Dashboard';
import Employees from './Employees';
import Attendance from './Attendance';
import Leave from './Leave';
import EmployeePortal from './EmployeePortal';

export default function App() {
  const [user, setUser] = useState(function() {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedRole, setSelectedRole] = useState('Employee'); // 'Admin' or 'Employee'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const BASE_URL = 'https://employee-management-production-aa2e.up.railway.app/api';

  const handleLogin = async function(e) {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    try {
      const loginRes = await axios.post(BASE_URL + '/auth/login', {
        username: username.trim(),
        password: password.trim()
      });

      // Save token if provided by backend
      const token = loginRes.data?.token || loginRes.data?.accessToken || '';
      if (token) {
        localStorage.setItem('token', token);
      }

      const lowerUser = username.trim().toLowerCase();
      const isAdminAccount = (lowerUser === 'talha' || lowerUser === 'admin');

      if (selectedRole === 'Admin' && !isAdminAccount) {
        setLoginError('Access denied: These credentials do not have administrative privileges.');
        setLoading(false);
        return;
      }

      let empId = 1;
      if (selectedRole === 'Employee') {
        try {
          const empListRes = await axios.get(BASE_URL + '/Employees');
          const matched = (empListRes.data || []).find(function(emp) {
            const fName = (emp.firstName || emp.FirstName || '').toLowerCase();
            const lName = (emp.lastName || emp.LastName || '').toLowerCase();
            return (
              fName.includes(lowerUser) ||
              lowerUser.includes(fName) ||
              lName.includes(lowerUser) ||
              lowerUser.includes(lName)
            );
          });
          if (matched) {
            empId = matched.id || matched.Id;
          }
        } catch (ignored) {}
      }

      const userData = {
        username: username.trim(),
        role: selectedRole,
        employeeId: empId
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setUsername('');
      setPassword('');
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = function() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setCurrentTab('dashboard');
    setUsername('');
    setPassword('');
    setLoginError('');
  };

  if (!user) {
    return React.createElement(
      'div',
      {
        style: {
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f1f5f9',
          padding: '20px',
          fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif',
          boxSizing: 'border-box'
        }
      },
      React.createElement(
        'div',
        {
          style: {
            width: '100%',
            maxWidth: '420px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
            padding: '36px 30px',
            boxSizing: 'border-box'
          }
        },
        React.createElement(
          'div',
          { style: { textAlign: 'center', marginBottom: '26px' } },
          React.createElement('div', {
            style: {
              width: '48px',
              height: '48px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              marginBottom: '10px'
            }
          }, '🏢'),
          React.createElement('h2', { style: { margin: '0 0 6px 0', color: '#0f172a', fontSize: '24px', fontWeight: '700' } }, 'HRMS Portal Login'),
          React.createElement('p', { style: { margin: 0, color: '#64748b', fontSize: '13px' } }, 'Select your account type to proceed')
        ),
        React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              backgroundColor: '#f8fafc',
              padding: '4px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              marginBottom: '22px'
            }
          },
          React.createElement(
            'button',
            {
              type: 'button',
              onClick: function() {
                setSelectedRole('Employee');
                setLoginError('');
              },
              style: {
                flex: 1,
                padding: '9px 0',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px',
                transition: 'all 0.2s ease',
                backgroundColor: selectedRole === 'Employee' ? '#ffffff' : 'transparent',
                color: selectedRole === 'Employee' ? '#2563eb' : '#64748b',
                boxShadow: selectedRole === 'Employee' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
              }
            },
            '👤 Employee'
          ),
          React.createElement(
            'button',
            {
              type: 'button',
              onClick: function() {
                setSelectedRole('Admin');
                setLoginError('');
              },
              style: {
                flex: 1,
                padding: '9px 0',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px',
                transition: 'all 0.2s ease',
                backgroundColor: selectedRole === 'Admin' ? '#ffffff' : 'transparent',
                color: selectedRole === 'Admin' ? '#2563eb' : '#64748b',
                boxShadow: selectedRole === 'Admin' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
              }
            },
            '🛡️ Admin'
          )
        ),
        loginError ? React.createElement(
          'div',
          {
            style: {
              padding: '11px 14px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              borderRadius: '8px',
              marginBottom: '18px',
              fontSize: '13px',
              textAlign: 'center',
              fontWeight: '500'
            }
          },
          loginError
        ) : null,
        React.createElement(
          'form',
          { onSubmit: handleLogin, style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
          React.createElement(
            'div',
            null,
            React.createElement('label', { style: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' } }, selectedRole + ' Username'),
            React.createElement('input', {
              type: 'text',
              placeholder: selectedRole === 'Admin' ? 'Enter admin username (e.g. talha)' : 'Enter your employee username',
              value: username,
              onChange: function(e) { setUsername(e.target.value); },
              required: true,
              style: {
                width: '100%',
                padding: '11px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                boxSizing: 'border-box'
              }
            })
          ),
          React.createElement(
            'div',
            null,
            React.createElement('label', { style: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' } }, 'Password'),
            React.createElement('input', {
              type: 'password',
              placeholder: '••••••••',
              value: password,
              onChange: function(e) { setPassword(e.target.value); },
              required: true,
              style: {
                width: '100%',
                padding: '11px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                boxSizing: 'border-box'
              }
            })
          ),
          React.createElement(
            'button',
            {
              type: 'submit',
              disabled: loading,
              style: {
                backgroundColor: '#2563eb',
                color: '#ffffff',
                padding: '12px',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                marginTop: '6px',
                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
              }
            },
            loading ? 'Authenticating...' : `Sign In as ${selectedRole}`
          )
        )
      )
    );
  }

  if (user.role === 'Employee') {
    return React.createElement(
      'div',
      { style: { minHeight: '100vh', backgroundColor: '#f8fafc', padding: '10px 0', boxSizing: 'border-box' } },
      React.createElement(EmployeePortal, { user: user, onLogout: handleLogout })
    );
  }

  const navButtonStyle = function(tabName) {
    const isActive = currentTab === tabName;
    return {
      padding: '8px 18px',
      backgroundColor: isActive ? '#2563eb' : '#f1f5f9',
      color: isActive ? '#ffffff' : '#475569',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '13px',
      flex: '1 1 auto',
      minWidth: '110px'
    };
  };

  return React.createElement(
    'div',
    { style: { minHeight: '100vh', backgroundColor: '#f8fafc', boxSizing: 'border-box', fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif' } },
    React.createElement(
      'header',
      {
        style: {
          backgroundColor: '#ffffff',
          padding: '14px 24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }
      },
      React.createElement('h2', { style: { margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '700' } }, 'Employee Management Portal'),
      React.createElement(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '14px' } },
        React.createElement('span', { style: { fontSize: '13px', color: '#16a34a', fontWeight: '600' } }, '● Administrator: ' + user.username),
        React.createElement(
          'button',
          {
            onClick: handleLogout,
            style: {
              backgroundColor: '#ef4444',
              color: '#ffffff',
              border: 'none',
              padding: '7px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px'
            }
          },
          'Logout'
        )
      )
    ),
    React.createElement(
      'nav',
      {
        style: {
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          padding: '16px 12px 0 12px',
          maxWidth: '850px',
          margin: '0 auto'
        }
      },
      React.createElement('button', { style: navButtonStyle('dashboard'), onClick: function() { setCurrentTab('dashboard'); } }, '📊 Dashboard'),
      React.createElement('button', { style: navButtonStyle('employees'), onClick: function() { setCurrentTab('employees'); } }, '👥 Employees'),
      React.createElement('button', { style: navButtonStyle('attendance'), onClick: function() { setCurrentTab('attendance'); } }, '📅 Attendance'),
      React.createElement('button', { style: navButtonStyle('leave'), onClick: function() { setCurrentTab('leave'); } }, '📝 Leave Requests')
    ),
    React.createElement(
      'main',
      { style: { padding: '12px 0' } },
      currentTab === 'dashboard' ? React.createElement(Dashboard, null) : null,
      currentTab === 'employees' ? React.createElement(Employees, null) : null,
      currentTab === 'attendance' ? React.createElement(Attendance, null) : null,
      currentTab === 'leave' ? React.createElement(Leave, null) : null
    )
  );
}