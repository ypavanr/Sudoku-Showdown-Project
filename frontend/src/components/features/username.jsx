import React, {useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./username.css"

function Username() {
    const [username,setUsername]=useState(null);
    useEffect(() => {
    const storedUsername=localStorage.getItem('username');
    setUsername(storedUsername);
  }, []);


  return (
    <div className="username-box">{username||'guest'}</div>
  );
}

export default Username;
