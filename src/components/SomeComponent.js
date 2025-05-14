import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function SomeComponent() {
  const { isAdmin, login, logout } = useContext(AuthContext);

  return (
    <div>
      {isAdmin ? (
        <div>
          <p>Welcome, Admin!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={() => login('admin@edc', 'tenure@2025')}>Login as Admin</button>
      )}
    </div>
  );
}

export default SomeComponent;