import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    { sender: 'Assistant', text: 'Hello! How can I assist you with your projects?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const typingRef = useRef('');

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

  const sendMessage = async (customInput = null, isRetry = false) => {
    const question = customInput || userInput;
    if (!question.trim()) return;

    if (!isRetry) {
      setMessages(prev => [...prev, { sender: 'user', text: question }]);
      setUserInput('');
    }

    setLoading(true);

    try {
      const response = await fetch('https://uydyp6dip1.execute-api.eu-central-1.amazonaws.com/prod/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      console.log("📥 Raw fetch response:", response);

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      const answer = data.response || 'No response received.';
      console.log("✅ Parsed response JSON:", data);
      console.log("📩 Answer to type out:", answer);

      setMessages(prev => [...prev, { sender: 'Assistant', text: '' }]);

      typeText(answer, () => {
        setLoading(false);
      });

    } catch (err) {
      console.error("🔥 API fetch error:", err);

      if (!isRetry) {
        // Retry assistant message
        setMessages(prev => [...prev, {
          sender: 'Assistant',
          text: "Sorry, it's taking me more than expected time. Retrying..."
        }]);

        setTimeout(() => {
          sendMessage(question, true);
        }, 2000);
      } else {
        setMessages(prev => [...prev, {
          sender: 'Assistant',
          text: "⚠️ I'm still unable to fetch the response. Please try again shortly."
        }]);
        setLoading(false);
      }
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
            <div key={idx} className={`message-container ${msg.sender.toLowerCase()}`}>
              <div className={`message ${msg.sender.toLowerCase()}`}>
                {msg.text}
                {msg.sender === 'Assistant' && (
                  <span
                    className="copy-icon"
                    onClick={() => navigator.clipboard.writeText(msg.text)}
                    title="Copy to clipboard"
                  >
                    ⧉
                  </span>
                )}
              </div>
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
          <button onClick={() => sendMessage()}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
