import React, { useState } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    { sender: 'Assistant', text: 'Hello! How can I assist you with your projects?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);

  // Typing animation: simulate word-by-word assistant typing
  const typeText = (text, callback) => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        callback(prev => prev + text[i]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 20);
  };

  const sendMessage = async () => {
    if (!userInput.trim()) {
      console.log("⛔ Empty input — skipping request");
      return;
    }

    console.log("📤 Sending user message:", userInput);
    const newMessages = [...messages, { sender: 'user', text: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setLoading(true);

    try {
      const apiUrl = 'https://uydyp6dip1.execute-api.eu-central-1.amazonaws.com/prod/chat';
      console.log("🌐 Sending POST to:", apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userInput }),
      });

      console.log("📥 Raw fetch response:", response);

      if (!response.ok) {
        console.error("❌ API returned error status:", response.status);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Parsed response JSON:", data);

      const answer = data.response || 'No response received.';
      console.log("📩 Answer to type out:", answer);

      // Add placeholder assistant message
      setMessages(prev => [...prev, { sender: 'Assistant', text: '' }]);

      let finalAnswer = '';
      typeText(answer, (typedText) => {
        finalAnswer = typedText;
        console.log("⌨️ Typed so far:", finalAnswer);
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { sender: 'Assistant', text: finalAnswer };
          return updated;
        });
      });

    } catch (err) {
      console.error("🔥 Fetch or parse error:", err);
      setMessages(prev => [...prev, { sender: 'Assistant', text: 'Error fetching response.' }]);
    }

    setLoading(false);
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
              {msg.text}
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
