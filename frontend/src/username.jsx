import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./username.css"
import {username} from "./login"

function Username() {
  return (
    <div className="username-box">{username}</div>
  );
}

export default Username;
