import React, { useState, useEffect } from 'react';
import { getClasses, createClass, addTeacherToClass, addStudentToClass, getAllUsers } from '../../utils/api';

function ClassesManagement() {
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [teacherName, setTeacherName] = useState('');
  const [className, setClassName] = useState('');
  const [allTeachers, setAllTeachers] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  useEffect(() => {
    loadClasses();
    loadUsers();
  }, []);

  const loadClasses = async () => {
    const data = await getClasses();
    setClasses(data);
  };

  const loadUsers = async () => {
    const users = await getAllUsers();
    setAllTeachers(users.filter(u => u.role === 'teacher'));
    setAllStudents(users.filter(u => u.role === 'student'));
  };

  const handleStudentSearch = (e) => {
    setStudentSearch(e.target.value);
    if (e.target.value.trim() === '') {
      setFilteredStudents([]);
      return;
    }
    const query = e.target.value.toLowerCase();
    const matches = allStudents.filter(s => s.username.toLowerCase().includes(query) && !selectedStudents.find(sel => sel.id === s.id));
    setFilteredStudents(matches.slice(0,5)); // show top 5 matches
  };

  const handleAddStudent = (student) => {
    setSelectedStudents([...selectedStudents, student]);
    setStudentSearch('');
    setFilteredStudents([]);
  };

  const handleRemoveStudent = (studentId) => {
    setSelectedStudents(selectedStudents.filter(s => s.id !== studentId));
  };

  const handleCreateClass = async () => {
    // Basic validation
    if (!className.trim() || !teacherName.trim() || selectedStudents.length === 0) {
      alert('Please fill in class name, teacher, and select at least one student.');
      return;
    }

    // Find teacher by name
    const teacher = allTeachers.find(t => t.username.toLowerCase() === teacherName.toLowerCase());
    if (!teacher) {
      alert('Teacher not found.');
      return;
    }

    // Create class
    const newC = await createClass(className);
    if (!newC) {
      alert('Failed to create class');
      return;
    }

    // Assign teacher
    const teacherAssigned = await addTeacherToClass(newC.id, teacher.id);
    if (!teacherAssigned) {
      alert('Failed to assign teacher');
      return;
    }

    // Assign students
    for (let student of selectedStudents) {
      const studentAssigned = await addStudentToClass(newC.id, student.id);
      if (!studentAssigned) {
        alert(`Failed to add student ${student.username}`);
        // Not reverting changes for simplicity
      }
    }

    // Refresh classes
    await loadClasses();
    // Reset modal state
    setShowModal(false);
    setTeacherName('');
    setClassName('');
    setSelectedStudents([]);
  };

  return (
    <div>
      <h1>Classes Management</h1>
      <button onClick={() => setShowModal(true)}>Create Class (Modal)</button>
      <h2>All Classes</h2>
      <ul>
        {classes.map(c => (
          <li key={c.id}>{c.name} (ID: {c.id}) Teacher: {c.teacherId || 'none'}, Students: {c.students.length}</li>
        ))}
      </ul>

      {showModal && (
        <div style={{
          position:'fixed', top:0, left:0, width:'100%', height:'100%',
          background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center'
        }}>
          <div style={{background:'#fff', padding:'20px', borderRadius:'5px', width:'400px'}}>
            <h2>Create New Class</h2>
            <div style={{marginBottom:'10px'}}>
              <label>Class Name:</label><br/>
              <input value={className} onChange={e=>setClassName(e.target.value)} style={{width:'100%'}} />
            </div>
            <div style={{marginBottom:'10px'}}>
              <label>Teacher Username:</label><br/>
              <input value={teacherName} onChange={e=>setTeacherName(e.target.value)} style={{width:'100%'}} list="teacher-list"/>
              <datalist id="teacher-list">
                {allTeachers.map(t => (
                  <option key={t.id} value={t.username}>{t.username}</option>
                ))}
              </datalist>
            </div>
            <div style={{marginBottom:'10px'}}>
              <label>Add Students:</label><br/>
              <input 
                placeholder="Search student by name"
                value={studentSearch}
                onChange={handleStudentSearch}
                style={{width:'100%'}}
              />
              {filteredStudents.length > 0 && (
                <ul style={{border:'1px solid #ccc', padding:'5px', margin:'5px 0', maxHeight:'100px', overflow:'auto'}}>
                  {filteredStudents.map(s => (
                    <li key={s.id} style={{cursor:'pointer'}} onClick={()=>handleAddStudent(s)}>
                      {s.username}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h3>Selected Students</h3>
              <table style={{width:'100%', borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{borderBottom:'1px solid #ccc'}}>
                    <th style={{textAlign:'left'}}>Username</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStudents.map(st => (
                    <tr key={st.id} style={{borderBottom:'1px solid #eee'}}>
                      <td>{st.username}</td>
                      <td><button onClick={()=>handleRemoveStudent(st.id)}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{marginTop:'10px', display:'flex', justifyContent:'space-between'}}>
              <button onClick={()=>setShowModal(false)}>Cancel</button>
              <button onClick={handleCreateClass}>Create Class</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClassesManagement;
