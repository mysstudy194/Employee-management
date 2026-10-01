import React, { useState } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import Employees from './Employees';
import Attendance from './Attendance';
import Leave from './Leave';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleSuccess = function() {
    setToken(localStorage.getItem('token'));
  };

  const handleLogout = function() {
    localStorage.clear();
    setToken(null);
  };

  if (!token) {
    return React.createElement(Login, { onLoginSuccess: handleSuccess });
  }

  // Active Screen Switcher
  let currentComponent = null;
  if (activeTab === 'dashboard') {
    currentComponent = React.createElement(Dashboard, null);
  } else if (activeTab === 'employees') {
    currentComponent = React.createElement(Employees, null);
  } else if (activeTab === 'attendance') {
    currentComponent = React.createElement(Attendance, null);
  } else if (activeTab === 'leave') {
    currentComponent = React.createElement(Leave, null);
  }

  const getTabStyle = function(tabName) {
    return {
      padding: '8px 16px',
      marginRight: '10px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold',
      backgroundColor: activeTab === tabName ? '#007bff' : '#e0e0e0',
      color: activeTab === tabName ? '#ffffff' : '#333333'
    };
  };

  return React.createElement(
    'div',
    { style: { padding: '20px', fontFamily: 'sans-serif' } },
    React.createElement(
      'div',
      { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
      React.createElement('h2', { style: { margin: 0, color: '#333' } }, 'Employee Management Portal'),
      React.createElement(
        'button',
        {
          onClick: handleLogout,
          style: { padding: '6px 14px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }
        },
        'Logout'
      )
    ),
    React.createElement('hr', { style: { margin: '15px 0', border: 'none', borderTop: '1px solid #ccc' } }),
    
    // Navigation Tabs (Dashboard, Employees, Attendance, Leave Requests)
    React.createElement(
      'div',
      { style: { marginBottom: '20px' } },
      React.createElement(
        'button',
        { style: getTabStyle('dashboard'), onClick: function() { setActiveTab('dashboard'); } },
        'Dashboard'
      ),
      React.createElement(
        'button',
        { style: getTabStyle('employees'), onClick: function() { setActiveTab('employees'); } },
        'Employees'
      ),
      React.createElement(
        'button',
        { style: getTabStyle('attendance'), onClick: function() { setActiveTab('attendance'); } },
        'Attendance'
      ),
      React.createElement(
        'button',
        { style: getTabStyle('leave'), onClick: function() { setActiveTab('leave'); } },
        'Leave Requests'
      )
    ),

    // Active Screen Component Render
    currentComponent
  );
}