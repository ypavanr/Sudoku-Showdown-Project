import React, { useState, useEffect,useRef } from "react";
import "./ChatBox.css";
import { getSocket } from "../../socket.js";
import { useParams } from "react-router-dom";

function ChatBox(){
    const socket = getSocket();  
    const messagesEndRef = useRef(null);
    const [joinMessages, setJoinMessages]=useState([]);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const {roomId } = useParams();
      useEffect(() => {
        if (!socket ) return;
        const handleUserJoined= (usermessage)=>{
            console.log(usermessage);
            setJoinMessages((prev) => [...prev, usermessage]);  
        };
         const handleMessages= (input)=>{
          console.log(input);
          setMessages((prev) => [...prev, input]);
          setInput('');
        };
        socket.on("user-joined", handleUserJoined);
        socket.on("display-messages",handleMessages);
        return () => {
        socket.off('user-joined', handleUserJoined);
        socket.off('new-message');
        socket.off('display-messages',handleMessages)
        };
      }, [socket, roomId]);

      const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() === '') return;
        socket.emit('new-message', roomId,input);
      };

      useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        },[messages, joinMessages]);

    return (
    <div className="chatbox">
      <div className="message-container">
      {joinMessages.map((usermsg,index)=>(
        <div key={index} className={`join-message ${index % 2 === 0 ? 'color-a' : 'color-b'}`}>
          <p>{usermsg}</p>
        </div>
      ))}
        {messages.map((msg, index) => (
          <div key={index} className={`messages ${index % 2 === 0 ? 'color-a' : 'color-b'}`}>
            <p>{msg}</p>
          </div>
      ))}
      <div ref={messagesEndRef} />
      </div>
      <form id='form' onSubmit={handleSubmit}>
        <label>
          <input
            type='text'
            id='input'
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </label>
        &nbsp;<button type="submit">Send</button>
      </form>
    </div>
  );
}
export default ChatBox;