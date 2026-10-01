import React, { useState } from 'react';
import axios from 'axios';

export default function Login(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async function(e) {
    e.preventDefault();
    setErrorMsg('');

    try {
      const res = await axios.post('http://localhost:5206/api/Auth/login', {
        username: username,
        password: password
      });

      if (res.status === 200) {
        // Save user info
        localStorage.setItem('username', username);

        // Extract token if sent, or set dummy token so protected route opens
        const receivedToken = res.data?.token || (typeof res.data === 'string' ? res.data : 'logged_in');
        localStorage.setItem('token', receivedToken);

        if (props.onLoginSuccess) {
          props.onLoginSuccess();
        } else {
          // Fallback reload to trigger state change in App.jsx
          window.location.reload();
        }
      }
    } catch (err) {
      setErrorMsg('Invalid username or password');
    }
  };

  return React.createElement(
    'div',
    { style: { maxWidth: '350px', margin: '40px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '6px' } },
    React.createElement('h2', null, 'Login'),
    errorMsg ? React.createElement('p', { style: { color: 'red' } }, errorMsg) : null,
    React.createElement(
      'form',
      { onSubmit: handleSubmit },
      React.createElement(
        'div',
        { style: { marginBottom: '12px' } },
        React.createElement('label', null, 'Username: '),
        React.createElement('br', null),
        React.createElement('input', {
          type: 'text',
          value: username,
          required: true,
          style: { width: '100%', padding: '8px', boxSizing: 'border-box' },
          onChange: function(e) { setUsername(e.target.value); }
        })
      ),
      React.createElement(
        'div',
        { style: { marginBottom: '12px' } },
        React.createElement('label', null, 'Password: '),
        React.createElement('br', null),
        React.createElement('input', {
          type: 'password',
          value: password,
          required: true,
          style: { width: '100%', padding: '8px', boxSizing: 'border-box' },
          onChange: function(e) { setPassword(e.target.value); }
        })
      ),
      React.createElement(
        'button',
        { type: 'submit', style: { width: '100%', padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' } },
        'Sign In'
      )
    )
  );
}