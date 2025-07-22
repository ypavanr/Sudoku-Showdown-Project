import React, { useState, useEffect, useRef } from "react";
import "./ChatBox.css";
import socket from "../../socket";
import { useParams } from "react-router-dom";

function ChatBox() {
  const messagesEndRef = useRef(null);
  const [input, setInput] = useState('');
  const [chatTimeline, setChatTimeline] = useState([]);
  const [mySocketId, setMySocketId] = useState("");
  const { roomId } = useParams();

  useEffect(() => {
    if (!socket) return;

    socket.emit('ready');
    socket.on('socket-id', (sid) => {
      setMySocketId(sid);
    });

    const handleMessages=(msg) => {
     setChatTimeline((prev) => [...prev,{type:msg.type,sid:msg.sid,senderusername:msg.senderusername,text:msg.text}]);
    };

    socket.on("display-messages", handleMessages);

    return () => {
      socket.off('display-messages', handleMessages);
    };
  }, [socket, roomId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    socket.emit('new-message', roomId, input, mySocketId);
    setInput(''); 
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatTimeline]);

  return (
    <div className="chatbox">
      <div className="messages-container">

        {chatTimeline.map((msg,index) => (
          <div key={index} 
            className={`messages ${msg.type === "chat"?index % 2===0?"color-a":"color-b":"" } 
            ${msg.type === "join"||msg.type === "leave"||msg.type === "host"?"system-message":""}`}
          >
            {msg.type === "chat"?(
              <p>
                <strong>{msg.sid === mySocketId ? "You" : msg.senderusername}:</strong> {msg.text}
              </p>)
              :msg.type === "host" && msg.sid === mySocketId ? <p>You are the host</p>
              :(<p>{msg.text}</p>)
            }
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      <form id="form" onSubmit={handleSubmit}>
        <label>
          <input
            type="text"
            id="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
          />
        </label>
        <button type="submit">Send</button>
      </form>
      
    </div>
  );
}

export default ChatBox;
