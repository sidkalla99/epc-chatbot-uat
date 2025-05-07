import React, { useState } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    { sender: 'Assistant', text: 'Hello! How can I assist you with your EPC projects?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [darkMode, setDarkMode] = useState(true); // Start in dark mode

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: userInput }];
    setMessages(newMessages);

    try {
      const response = await fetch('https://uydyp6dip1.execute-api.eu-central-1.amazonaws.com/prod/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userInput }),
      });

      const data = await response.json();

      const answer = Array.isArray(data.body)
        ? data.body.map((row, i) => `${i + 1}. ${Object.values(row).join(' | ')}`).join('\n')
        : data.body;

      setMessages([...newMessages, { sender: 'Assistant', text: answer || 'No response received.' }]);
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { sender: 'Assistant', text: 'Error fetching response.' }]);
    }

    setUserInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
      <div className="chat-container">
        <div className="header">
          <h1>EPC Chatbot</h1>
          <label className="switch">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
            <span className="slider round"></span>
          </label>
        </div>
        <div className="chat-box">
          {messages.map((msg, idx) => (
            <p key={idx}><strong>{msg.sender === 'user' ? 'You' : 'Assistant'}:</strong> {msg.text}</p>
          ))}
        </div>
        <div className="input-box">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your Query here"
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
