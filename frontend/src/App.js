import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Home from './pages/Home';
import UserDirectory from './pages/Admin/UserDirectory';
import ClassesManagement from './pages/Admin/ClassesManagement';
import MyClasses from './pages/Teacher/MyClasses';
import ClassStudents from './pages/Teacher/ClassStudents';
import MyGrades from './pages/Student/MyGrades';
import MyChildren from './pages/Parent/MyChildren';
import NavBar from './components/NavBar';
import { isAuthenticated, getRole } from './utils/auth';

function App() {
  const [loggedIn, setLoggedIn] = useState(isAuthenticated());
  const [role, setRole] = useState(getRole());

  useEffect(() => {
    setLoggedIn(isAuthenticated());
    setRole(getRole());
  }, []);

  if (!loggedIn) {
    return <Auth onAuthSuccess={() => {setLoggedIn(true); setRole(getRole());}} />;
  }

  return (
    <Router>
      <NavBar />
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          {role === 'admin' && (
            <>
              <Route path="/user-directory" element={<UserDirectory />} />
              <Route path="/classes-management" element={<ClassesManagement />} />
            </>
          )}
          {role === 'teacher' && (
            <>
              <Route path="/my-classes" element={<MyClasses />} />
              <Route path="/class-students/:classId" element={<ClassStudents />} />
            </>
          )}
          {role === 'student' && (
            <Route path="/my-grades" element={<MyGrades />} />
          )}
          {role === 'parent' && (
            <Route path="/my-children" element={<MyChildren />} />
          )}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
