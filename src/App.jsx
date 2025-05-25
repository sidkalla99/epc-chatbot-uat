import React, { useState, useRef } from 'react';
import { Copy } from 'lucide-react'; // ✅ Icon
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    { sender: 'Assistant', text: 'Hello! How can I assist you with your projects?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);

  const typingRef = useRef('');

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).catch(err =>
      console.error('Copy failed', err)
    );
  };

  const typeText = (text, onComplete) => {
    let i = 0;
    typingRef.current = '';
    const interval = setInterval(() => {
      if (i < text.length) {
        typingRef.current += text[i];
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.sender === 'Assistant') {
            updated[updated.length - 1] = {
              ...last,
              text: typingRef.current
            };
          }
          return updated;
        });
        i++;
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 20);
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = { sender: 'user', text: userInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setLoading(true);

    try {
      const response = await fetch('https://uydyp6dip1.execute-api.eu-central-1.amazonaws.com/prod/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userInput }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      const answer = data.response || 'No response received.';

      setMessages(prev => [...prev, { sender: 'Assistant', text: '' }]);
      typeText(answer, () => {
        setLoading(false);
      });

    } catch (err) {
      console.error("🔥 Fetch or parse error:", err);
      setMessages(prev => [...prev, { sender: 'Assistant', text: 'Error fetching response.' }]);
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
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
            <div key={idx} className={`message ${msg.sender.toLowerCase()}`}>
              {msg.sender === 'Assistant' ? (
                <div className="message-wrapper">
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(msg.text)}
                    title="Copy"
                  >
                    <Copy size={18} />
                  </button>
                  <div className="message-text">{msg.text}</div>
                </div>
              ) : (
                msg.text
              )}
            </div>
          ))}
          {loading && (
            <div className="message assistant">
              <span className="dot-flash"></span>
            </div>
          )}
        </div>

        <div className="input-box">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your query here..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
