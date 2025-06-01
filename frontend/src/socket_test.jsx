// chat.jsx
import React, { useState } from 'react';
import socket from './socket'; // Assumes this exports a connected socket

const Chat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevents page refresh
    if (input.trim() === '') return;

    // Emit message to server
    socket.emit('new message', input);

    // Update local messages list
    setMessages((prev) => [...prev, input]);

    // Clear input
    setInput('');
  };

  return (
    <div style={{
    backgroundColor: 'black',
  padding: '1rem',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  zIndex: 1,
  position: 'relative',
  }}>
      <form id='form' onSubmit={handleSubmit}>
        <label>
          Message: 
          <input
            type='text'
            id='input'
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </label>
        <input type='submit' id='submit' value='Send' />
      </form>

      <div>
        <h4>Chat Messages:</h4>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Chat;
