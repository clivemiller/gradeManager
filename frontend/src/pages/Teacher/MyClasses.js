import React, { useState, useEffect } from 'react';
import { getMyClasses } from '../../utils/api';
import { Link } from 'react-router-dom';

function MyClasses() {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    const data = await getMyClasses();
    setClasses(data);
  };

  return (
    <div>
      <h1>My Classes</h1>
      <ul>
        {classes.map(c => (
          <li key={c.id}>
            {c.name} (ID:{c.id}) - <Link to={`/class-students/${c.id}`}>View Students</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MyClasses;
