import React, { useState } from 'react';
import { login } from '../utils/api';

function Auth({ onAuthSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(username, password);
    if (result) {
      onAuthSuccess();
    } else {
      alert('Login failed');
    }
  };

  return (
    <div>
      <h1>Sign In</h1>
      <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', maxWidth:'300px'}}>
        <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} required />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Auth;

