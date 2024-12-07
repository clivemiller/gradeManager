import React, { useState, useEffect } from 'react';
import { getMyGrades } from '../../utils/api';

function MyGrades() {
  const [grades, setGrades] = useState([]);

  useEffect(() => {
    loadGrades();
  }, []);

  const loadGrades = async () => {
    const data = await getMyGrades();
    setGrades(data);
  };

  return (
    <div>
      <h1>My Grades</h1>
      <ul>
        {grades.map(g => (
          <li key={g.classId}>{g.className}: {g.grade || 'N/A'}</li>
        ))}
      </ul>
    </div>
  );
}

export default MyGrades;
