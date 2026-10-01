import React, { useState, useEffect } from 'react';
import Login from './Login';
import Employees from './Employees';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
  };

  // Agar login nahi hai toh Login component render hoga
  if (!isAuthenticated) {
    return React.createElement(Login, {
      onLoginSuccess: () => setIsAuthenticated(true)
    });
  }

  // Login hone par Dashboard aur Employees render honge
  return React.createElement(
    'div',
    { style: { maxWidth: '800px', margin: '30px auto', fontFamily: 'sans-serif' } },
    React.createElement(
      'header',
      { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' } },
      React.createElement('h2', null, 'Employee Management Portal'),
      React.createElement(
        'button',
        {
          onClick: handleLogout,
          style: { padding: '6px 12px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }
        },
        'Logout'
      )
    ),
    React.createElement(Employees, null)
  );
}