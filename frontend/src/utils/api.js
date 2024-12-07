const API_URL = 'http://localhost:3001';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function login(username, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({username, password})
  });
  if (!res.ok) return false;
  const data = await res.json();
  localStorage.setItem('token', data.token);
  localStorage.setItem('userId', data.userId);
  localStorage.setItem('role', data.role);
  return true;
}

export async function getAllUsers() {
  const res = await fetch(`${API_URL}/users`, { headers: {...authHeaders()} });
  if (!res.ok) return [];
  return res.json();
}

export async function createUser(username, password, role) {
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: {'Content-Type':'application/json', ...authHeaders()},
    body: JSON.stringify({username, password, role})
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getClasses() {
  const res = await fetch(`${API_URL}/classes`, { headers: {...authHeaders()} });
  if (!res.ok) return [];
  return res.json();
}

export async function createClass(name) {
  const res = await fetch(`${API_URL}/classes`, {
    method:'POST',
    headers:{'Content-Type':'application/json',...authHeaders()},
    body: JSON.stringify({ name })
  });
  if (!res.ok) return null;
  return res.json();
}

export async function addTeacherToClass(classId, teacherId) {
  const res = await fetch(`${API_URL}/classes/${classId}/addTeacher`, {
    method:'POST',
    headers:{'Content-Type':'application/json',...authHeaders()},
    body: JSON.stringify({ teacherId: parseInt(teacherId,10) })
  });
  return res.ok;
}

export async function addStudentToClass(classId, studentId) {
  const res = await fetch(`${API_URL}/classes/${classId}/addStudent`, {
    method:'POST',
    headers:{'Content-Type':'application/json',...authHeaders()},
    body: JSON.stringify({ studentId: parseInt(studentId,10) })
  });
  return res.ok;
}

export async function getMyClasses() {
  const res = await fetch(`${API_URL}/my-classes`, { headers: {...authHeaders()} });
  if (!res.ok) return [];
  return res.json();
}

export async function getClassStudents(classId) {
  const res = await fetch(`${API_URL}/classes/${classId}/students`, { headers:{...authHeaders()} });
  if(!res.ok) return [];
  return res.json();
}

export async function updateStudentGrade(classId, studentId, grade) {
  const res = await fetch(`${API_URL}/classes/${classId}/grades/${studentId}`, {
    method:'PATCH',
    headers:{'Content-Type':'application/json',...authHeaders()},
    body: JSON.stringify({ grade })
  });
  return res.ok;
}

export async function getMyGrades() {
  const res = await fetch(`${API_URL}/my-grades`, { headers:{...authHeaders()} });
  if(!res.ok) return [];
  return res.json();
}

export async function getMyChildren() {
  const res = await fetch(`${API_URL}/my-children`, { headers:{...authHeaders()} });
  if(!res.ok) return [];
  return res.json();
}
