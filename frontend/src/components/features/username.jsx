import React, { useEffect, useState } from 'react';
import './username.css';

const iconMap = import.meta.glob('/src/assets/icons/*.svg', { eager: true });

function Username() {
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username') || 'guest';
    const iconFileName = localStorage.getItem('avatar');
    const iconPath = `/src/assets/icons/${iconFileName}`;
    const iconUrl = iconMap[iconPath]?.default;

    setUsername(storedUsername);
    setAvatar(iconUrl); // Store the resolved URL here
  }, []); // empty dependency array

  return (
    <div className="username-box">
      <div>{username}</div>
      {avatar && (
        <img
          src={avatar}
          alt="Avatar"
          width={50}
          style={{ marginTop: '5px', borderRadius: '50%' }}
        />
      )}
    </div>
  );
}

export default Username;
