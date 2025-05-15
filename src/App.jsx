import React, { useState } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    { sender: 'Assistant', text: 'Hello! How can I assist you with your projects?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!userInput.trim()) return;
    console.log("📨 Question asked:", userInput);
    const newMessages = [...messages, { sender: 'user', text: userInput }];
    setUserInput(''); // ✅ Clear input right away
    //setMessages([...newMessages, { sender: 'Assistant', text: 'Typing...' }]);
    setMessages(newMessages);  // just update messages with user input
    setLoading(true);

    try {
      const response = await fetch('https://uydyp6dip1.execute-api.eu-central-1.amazonaws.com/prod/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userInput }),
      });

      const data = await response.json();
      console.log("✅ API response:", data);
      let updatedMessages = newMessages;

      if (Array.isArray(data)) {
        updatedMessages = [...newMessages, {
          sender: 'Assistant',
          type: 'table',
          data
        }];
      } else {
        updatedMessages = [...newMessages, {
          sender: 'Assistant',
          text: data.body || 'No response received.'
        }];
      }

      setMessages(updatedMessages);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setMessages([...newMessages, { sender: 'Assistant', text: 'Error fetching response.' }]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  const downloadCSV = (data) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'response.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
      <div className="chat-container">
        <div className="header">
          <h1>Chatbot</h1>
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
                <>
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
                  <button onClick={() => downloadCSV(msg.data)} className="download-btn">
                    ⬇️ Download CSV
                  </button>
                </>
              ) : (
                <p>{msg.text}</p>
              )}
            </div>
          ))}

          {loading && (
          <div className="typing-indicator">
            <strong>Assistant:</strong> <span className="dot-flash"></span>
          </div>
        )}

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
