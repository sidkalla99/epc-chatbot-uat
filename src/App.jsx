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
    console.log("🟡 User Query:", userInput);
  
    try {
      const response = await fetch('https://uydyp6dip1.execute-api.eu-central-1.amazonaws.com/prod/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userInput }),
      });
  
      console.log("🟢 Response status:", response.status);
      const data = await response.json();
      console.log("🔵 Parsed response JSON:", data);
  
      if (Array.isArray(data)) {
        setMessages([...newMessages, { sender: 'Assistant', type: 'table', data }]);
      } else {
        setMessages([...newMessages, { sender: 'Assistant', text: data.body || 'No response received.' }]);
      }
  
    } catch (err) {
      console.error("❌ Fetch error:", err);
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
  <div key={idx}>
    <strong>{msg.sender === 'user' ? 'You' : 'Assistant'}:</strong>
    {msg.type === 'table' ? (
      <table className="response-table">
        <thead>
          <tr>
            {Object.keys(msg.data[0] || {}).map((key) => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {msg.data.map((row, i) => (
            <tr key={i}>
              {Object.values(row).map((val, j) => (
                <td key={j}>{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p>{msg.text}</p>
    )}
  </div>
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
