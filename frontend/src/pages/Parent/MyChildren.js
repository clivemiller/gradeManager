import React, { useState, useEffect } from 'react';
import { getMyChildren } from '../../utils/api';

function MyChildren() {
  const [children, setChildren] = useState([]);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    const data = await getMyChildren();
    setChildren(data);
  };

  return (
    <div>
      <h1>My Children</h1>
      {children.map(ch => (
        <div key={ch.childId} style={{border:'1px solid #ccc', padding:'10px', margin:'10px 0'}}>
          <h3>{ch.username} (ID: {ch.childId})</h3>
          <ul>
            {ch.grades.map(g => (
              <li key={g.classId}>{g.className}: {g.grade || 'N/A'}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default MyChildren;
