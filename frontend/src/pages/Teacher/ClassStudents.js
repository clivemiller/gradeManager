import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getClassStudents, updateStudentGrade } from '../../utils/api';

function ClassStudents() {
  const { classId } = useParams();
  const [students, setStudents] = useState([]);
  const [gradeChanges, setGradeChanges] = useState({});

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    const data = await getClassStudents(classId);
    setStudents(data);
  };

  const handleGradeChange = (studentId, grade) => {
    setGradeChanges({...gradeChanges, [studentId]: grade});
  };

  const handleSave = async (studentId) => {
    const grade = gradeChanges[studentId];
    if (grade === undefined) return;
    const success = await updateStudentGrade(classId, studentId, grade);
    if (success) {
      loadStudents();
    }
  };

  return (
    <div>
      <h1>Class {classId} Students</h1>
      <table>
        <thead>
          <tr><th>Student ID</th><th>Username</th><th>Grade</th><th>Action</th></tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s.studentId}>
              <td>{s.studentId}</td>
              <td>{s.username}</td>
              <td>
                <input value={gradeChanges[s.studentId] !== undefined ? gradeChanges[s.studentId] : s.grade || ''} 
                       onChange={e=>handleGradeChange(s.studentId, e.target.value)} />
              </td>
              <td><button onClick={()=>handleSave(s.studentId)}>Save</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ClassStudents;
