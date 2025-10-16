// frontend/src/App.jsx
import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import './App.css';

const socket = io("http://localhost:5001");

function App() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setChat((prevChat) => [...prevChat, data]);
    });

    // Clean up the effect to prevent memory leaks
    return () => {
      socket.off("receive_message");
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (name.trim() && message.trim()) {
      const messageData = { name, message };
      socket.emit("send_message", messageData);
      setMessage(""); // Clear message input after sending
    }
  };

  return (
    <div className="chat-window">
      <h2>Real-Time Chat</h2>
      <div className="user-name-input">
        <input
          type="text"
          placeholder="Enter your name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="chat-body">
        {chat.map((msg, index) => (
          <p key={index} className="message">
            <strong>{msg.name}</strong> [{msg.timestamp}]: {msg.message}
          </p>
        ))}
      </div>
      <form className="chat-footer" onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;