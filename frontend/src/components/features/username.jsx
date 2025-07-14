import React, { useEffect, useState } from 'react';
import './username.css';

function Username() {
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username') || 'guest';
    const iconFileName = localStorage.getItem('avatar') || 'default.svg'; 
    const iconPath = `/icons/${iconFileName}`;
    setUsername(storedUsername);
    setAvatar(iconPath);
  }, []);

  return (
    <div className="username-box">
      {avatar && (
        <img
          src={avatar}
          alt="Avatar"
          width={50}
          style={{ marginTop: '5px', borderRadius: '50%' }}
        />
      )}
      <div>{username}</div>
    </div>
  );
}

export default Username;
