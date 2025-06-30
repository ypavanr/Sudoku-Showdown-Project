import React, { useState, useEffect,useRef } from "react";
import "./chat.css";
import { getSocket } from "../../socket.js";

import { useParams } from "react-router-dom";

function chat(){
    const socket = getSocket();
    return <div className='chatbox'> 
    <h1>HEyyyy</h1>
    <p>Huuu</p>
    </div>
}
export default chat;