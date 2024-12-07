import React, { useState, useEffect } from 'react';
import { getAllUsers, createUser } from '../../utils/api';

function UserDirectory() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({username:'', password:'', role:''});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await getAllUsers();
    setUsers(data);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password || !form.role) return;
    const newUser = await createUser(form.username, form.password, form.role);
    if (newUser) {
      setForm({username:'', password:'', role:''});
      loadUsers();
    } else {
      alert('Failed to create user');
    }
  };

  return (
    <div>
      <h1>User Directory</h1>
      <form onSubmit={handleCreateUser}>
        <input placeholder="Username" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} />
        <input placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
        <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
          <option value="">Select role</option>
          <option value="admin">admin</option>
          <option value="teacher">teacher</option>
          <option value="parent">parent</option>
          <option value="student">student</option>
        </select>
        <button type="submit">Create User</button>
      </form>
      <h2>All Users</h2>
      <ul>
        {users.map(u => (
          <li key={u.id}>{u.username} ({u.role})</li>
        ))}
      </ul>
    </div>
  );
}

export default UserDirectory;
