const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();
app.use(cors());
app.use(express.json());

const usersPath = path.join(__dirname, 'database', 'users.json');
const classesPath = path.join(__dirname, 'database', 'classes.json');

function readUsers() {
  return JSON.parse(fs.readFileSync(usersPath, 'utf8'));
}

function writeUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf8');
}

function readClasses() {
  return JSON.parse(fs.readFileSync(classesPath, 'utf8'));
}

function writeClasses(classes) {
  fs.writeFileSync(classesPath, JSON.stringify(classes, null, 2), 'utf8');
}

// Fake token generation and verification (for demo)
function generateFakeToken(userId, role) {
  return `fake-token-${userId}-${role}`;
}

function verifyTokenAndGetUser(req) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  // token format: fake-token-userId-role
  const parts = token.split('-');
  if (parts.length !== 4 || parts[0] !== 'fake' || parts[1] !== 'token') return null;
  const userId = parseInt(parts[2], 10);
  const role = parts[3];
  const users = readUsers();
  const user = users.find(u => u.id === userId && u.role === role);
  return user || null;
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/** AUTH **/
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const token = generateFakeToken(user.id, user.role);
  res.json({ userId: user.id, role: user.role, token });
});

/** ADMIN ENDPOINTS **/
app.post('/users', (req, res) => {
  // Only admin can create new users
  const currentUser = verifyTokenAndGetUser(req);
  if (!currentUser || currentUser.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const { username, password, role } = req.body;
  if (!username || !password || !role) return res.status(400).json({ error: 'username, password, role required' });
  
  const users = readUsers();
  if (users.find(u => u.username === username)) return res.status(400).json({ error: 'Username already taken' });

  const newUser = {
    id: Date.now(),
    username,
    password,
    role,
    childrenIds: role === 'parent' ? [] : []
  };
  users.push(newUser);
  writeUsers(users);
  res.status(201).json(newUser);
});

app.get('/users', (req, res) => {
  const currentUser = verifyTokenAndGetUser(req);
  if (!currentUser || currentUser.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const users = readUsers();
  res.json(users);
});

app.post('/classes', (req, res) => {
  const currentUser = verifyTokenAndGetUser(req);
  if (!currentUser || currentUser.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Class name required' });

  const classes = readClasses();
  const newClass = { id: Date.now(), name, teacherId: null, students: [] };
  classes.push(newClass);
  writeClasses(classes);
  res.status(201).json(newClass);
});

app.post('/classes/:classId/addTeacher', (req, res) => {
  const currentUser = verifyTokenAndGetUser(req);
  if (!currentUser || currentUser.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const classId = parseInt(req.params.classId, 10);
  const { teacherId } = req.body;
  const classes = readClasses();
  const c = classes.find(cl => cl.id === classId);
  if (!c) return res.status(404).json({ error: 'Class not found' });

  const users = readUsers();
  const teacher = users.find(u => u.id === teacherId && u.role === 'teacher');
  if (!teacher) return res.status(400).json({ error: 'Invalid teacherId' });

  c.teacherId = teacherId;
  writeClasses(classes);
  res.json(c);
});

app.post('/classes/:classId/addStudent', (req, res) => {
  const currentUser = verifyTokenAndGetUser(req);
  if (!currentUser || currentUser.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const classId = parseInt(req.params.classId, 10);
  const { studentId } = req.body;
  const classes = readClasses();
  const c = classes.find(cl => cl.id === classId);
  if (!c) return res.status(404).json({ error: 'Class not found' });

  const users = readUsers();
  const student = users.find(u => u.id === studentId && u.role === 'student');
  if (!student) return res.status(400).json({ error: 'Invalid studentId' });

  if (c.students.find(s => s.studentId === studentId)) return res.status(400).json({ error: 'Student already in class' });

  c.students.push({ studentId, grade: null });
  writeClasses(classes);
  res.json(c);
});

/** TEACHER ENDPOINTS **/
app.get('/my-classes', (req, res) => {
  const currentUser = verifyTokenAndGetUser(req);
  if (!currentUser || currentUser.role !== 'teacher') return res.status(403).json({ error: 'Forbidden' });
  
  const classes = readClasses().filter(c => c.teacherId === currentUser.id);
  res.json(classes);
});

app.get('/classes/:classId/students', (req, res) => {
  const currentUser = verifyTokenAndGetUser(req);
  if (!currentUser) return res.status(401).json({ error: 'Unauthorized' });

  const classId = parseInt(req.params.classId, 10);
  const classes = readClasses();
  const c = classes.find(cl => cl.id === classId);
  if (!c) return res.status(404).json({ error: 'Class not found' });

  // Teacher or admin can view all students. Students or parents can only view relevant info.
  if (currentUser.role === 'teacher' && c.teacherId !== currentUser.id && currentUser.role !== 'admin') {
    return res.status(403).json({ error: 'Not your class' });
  }
  
  const users = readUsers();
  const studentData = c.students.map(s => {
    const u = users.find(us => us.id === s.studentId);
    return { studentId: s.studentId, username: u?.username, grade: s.grade };
  });
  res.json(studentData);
});

app.patch('/classes/:classId/grades/:studentId', (req, res) => {
  const currentUser = verifyTokenAndGetUser(req);
  if (!currentUser || currentUser.role !== 'teacher') return res.status(403).json({ error: 'Forbidden' });

  const classId = parseInt(req.params.classId, 10);
  const studentId = parseInt(req.params.studentId, 10);
  const { grade } = req.body;

  const classes = readClasses();
  const c = classes.find(cl => cl.id === classId);
  if (!c) return res.status(404).json({ error: 'Class not found' });
  if (c.teacherId !== currentUser.id) return res.status(403).json({ error: 'Not your class' });

  const studentObj = c.students.find(s => s.studentId === studentId);
  if (!studentObj) return res.status(404).json({ error: 'Student not in class' });

  studentObj.grade = grade;
  writeClasses(classes);
  res.json({ studentId, grade });
});

/** STUDENT ENDPOINTS **/
app.get('/my-grades', (req, res) => {
  const currentUser = verifyTokenAndGetUser(req);
  if (!currentUser || currentUser.role !== 'student') return res.status(403).json({ error: 'Forbidden' });

  const classes = readClasses();
  const studentGrades = classes
    .filter(c => c.students.some(st => st.studentId === currentUser.id))
    .map(c => {
      const st = c.students.find(st => st.studentId === currentUser.id);
      return { classId: c.id, className: c.name, grade: st.grade };
    });
  res.json(studentGrades);
});

/** PARENT ENDPOINTS **/
app.get('/my-children', (req, res) => {
  const currentUser = verifyTokenAndGetUser(req);
  if (!currentUser || currentUser.role !== 'parent') return res.status(403).json({ error: 'Forbidden' });

  const classes = readClasses();
  const users = readUsers();
  const childrenData = currentUser.childrenIds.map(childId => {
    const child = users.find(u => u.id === childId && u.role === 'student');
    if (!child) return null;
    const childGrades = classes
      .filter(c => c.students.some(st => st.studentId === childId))
      .map(c => {
        const st = c.students.find(st => st.studentId === childId);
        return { classId: c.id, className: c.name, grade: st.grade };
      });
    return { childId, username: child.username, grades: childGrades };
  }).filter(Boolean);

  res.json(childrenData);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
