import React, { useState, useEffect,useRef } from "react";
import "./ChatBox.css";
import { getSocket } from "../../socket.js";
import { useParams } from "react-router-dom";

function ChatBox(){
    const socket = getSocket();  
    const messagesEndRef = useRef(null);
    const [joinMessages, setJoinMessages]=useState([]);
      useEffect(() => {
        if (!socket ) return;
        const handleUserJoined= (message)=>{
            console.log(message);
            setJoinMessages((prev) => [...prev, message]);  
        };
    
        socket.on("user-joined", handleUserJoined);
        return () => {
        socket.off('user-joined', handleUserJoined);
        };
      }, []);

        useEffect(() => {messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });}, [joinMessages]);
    return (
    <div className="chatbox">
      {joinMessages.map((msg,index)=>(
        <div key={index} className={`join-message ${index % 2 === 0 ? 'color-a' : 'color-b'}`}>
          <p>{msg}</p>
        </div>
      ))}
       <div ref={messagesEndRef} />
    </div>
  );
}
export default ChatBox;