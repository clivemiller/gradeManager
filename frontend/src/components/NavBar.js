import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, getRole, logout } from '../utils/auth';

function NavBar() {
  const navigate = useNavigate();
  const role = getRole();

  const handleLogout = () => {
    logout();
    navigate(0);
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">GradeManager</div>
      {isAuthenticated() && (
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          {role === 'admin' && (
            <>
              <li><Link to="/user-directory">User Directory</Link></li>
              <li><Link to="/classes-management">Classes Management</Link></li>
            </>
          )}
          {role === 'teacher' && (
            <li><Link to="/my-classes">My Classes</Link></li>
          )}
          {role === 'student' && (
            <li><Link to="/my-grades">My Grades</Link></li>
          )}
          {role === 'parent' && (
            <li><Link to="/my-children">My Children</Link></li>
          )}
          <li><button onClick={handleLogout}>Logout</button></li>
        </ul>
      )}
    </nav>
  );
}

export default NavBar;
