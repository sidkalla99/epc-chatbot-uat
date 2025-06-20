import React, { useState, useRef,useEffect } from 'react';
import './App.css';

function App() {
  const sessionIdRef = useRef(crypto.randomUUID());

  // ➕ NEW: keep the socket instance
  const wsRef = useRef(null);
  const [messages, setMessages] = useState([
    { sender: 'Assistant', text: 'Hello! How can I assist you with your projects?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  let ws;
  let reconnectTimer;

  const connectWebSocket = () => {
    ws = new WebSocket('wss://vcvpeauj4c.execute-api.eu-central-1.amazonaws.com/production');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket connected');
    };

    ws.onmessage = (evt) => {
      let payload;
      try {
        payload = JSON.parse(evt.data);
      } catch (e) {
        console.warn("Non-JSON frame:", evt.data);
        return;
      }

      if (!payload.answer) {
        console.warn("No answer field:", payload);
        return;
      }

      setMessages(prev => [...prev, { sender: 'Assistant', text: '' }]);
      typeText(payload.answer, () => setLoading(false));
    };

    ws.onclose = () => {
      console.warn("🔌 WebSocket closed, retrying in 3 seconds...");
      reconnectTimer = setTimeout(() => connectWebSocket(), 3000);
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      ws.close(); // ensure it triggers onclose
    };
  };

  connectWebSocket();

  const ping = setInterval(() => {
    if (wsRef.current?.readyState === 1) {
      wsRef.current.send('{"ping":1}');
    }
  }, 480_000);

  return () => {
    clearTimeout(reconnectTimer);
    clearInterval(ping);
    wsRef.current?.close();
  };
}, []);

  // useEffect(() => {
  //   wsRef.current = new WebSocket(
  //     'wss://vcvpeauj4c.execute-api.eu-central-1.amazonaws.com/production'
  //   );
  //   wsRef.current.onmessage = (evt) => {
  //     let payload;                                                      
  //     try {
  //       payload = JSON.parse(evt.data);
  //     } catch (e) {
  //       console.warn("Non-JSON frame:", evt.data);                      
  //       return;                     // ignore pings or malformed frames
  //     }
      
  //     if (!payload.answer) {                                            
  //       console.warn("No answer field:", payload);  // e.g., permission error frame
  //       return;
  //     }
      
  //     // normal path
  //     setMessages(prev => [...prev, { sender: 'Assistant', text: '' }]);
  //     typeText(payload.answer, () => setLoading(false));
  //   };


  //   // wsRef.current.onmessage = (evt) => {
  //   //   const { answer } = JSON.parse(evt.data);
  //   //   // add empty assistant bubble then animate
  //   //   setMessages(prev => [...prev, { sender: 'Assistant', text: '' }]);
  //   //   typeText(answer, () => setLoading(false));
  //   // };

  //   wsRef.current.onclose = () => console.log('🔌 WebSocket closed');
  //   const ping = setInterval(() => {
  //     if (wsRef.current.readyState === 1) {
  //       wsRef.current.send('{"ping":1}');
  //     }
  //   }, 480_000);
    
  //    return () => {
  //     clearInterval(ping);
  //     if (wsRef.current) wsRef.current.close();
  //   };
  // }, []);
    
  

  const typingRef = useRef(''); // ✅ stores the typed text during animation

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
  

   const sendMessage = () => {
  if (!userInput.trim()) return;

  if (wsRef.current.readyState !== 1) {
    console.warn("Socket still opening – try again in a second");
    return;
  }

  setMessages(prev => [...prev, { sender: 'user', text: userInput }]);
  setUserInput('');
  setLoading(true);

  wsRef.current.send(
    JSON.stringify({
      question:  userInput,
      sessionId: sessionIdRef.current
    })
  );
};


  // const sendMessage = async () => {
  //   if (!userInput.trim()) return;

  //   const userMessage = { sender: 'user', text: userInput };
  //   setMessages(prev => [...prev, userMessage]);
  //   setUserInput('');
  //   setLoading(true);

  //   try {
  //     const response = await fetch('https://uydyp6dip1.execute-api.eu-central-1.amazonaws.com/prod/chat', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ question: userInput ,sessionId: sessionIdRef.current }),
  //     });

  //     console.log("📥 Raw fetch response:", response);

  //     if (!response.ok) throw new Error(`API error: ${response.status}`);

  //     const data = await response.json();
  //     const answer = data.response || 'No response received.';
  //     console.log("✅ Parsed response JSON:", data);
  //     console.log("📩 Answer to type out:", answer);

  //     // Add empty assistant message
  //     setMessages(prev => [...prev, { sender: 'Assistant', text: '' }]);

  //     // Start typing animation
  //     typeText(answer, () => {
  //       setLoading(false);
  //     });

  //   } catch (err) {
  //     console.error("🔥 Fetch or parse error:", err);
  //     setMessages(prev => [...prev, { sender: 'Assistant', text: 'Error fetching response.' }]);
  //     setLoading(false);
  //   }
  // };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  // 🔽 Table CSV download handler
function downloadTableAsCSV(index) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = messages[index].text;

  const table = tempDiv.querySelector('table');
  if (!table) return;

  const csv = [];
  const rows = table.querySelectorAll('tr');

  for (const row of rows) {
    const cells = [...row.querySelectorAll('th, td')].map(cell =>
      `"${cell.textContent.replace(/"/g, '""')}"`
    );
    csv.push(cells.join(','));
  }

  const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `zelo-table-${index + 1}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


  return (
    <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
      <div className="chat-container">
        <div className="header">
          <h1>Zelo</h1>
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
            // <div key={idx} className={`message ${msg.sender.toLowerCase()}`}>
            //   {msg.text}
            // </div>
            /// <div key={idx} className={`message ${msg.sender.toLowerCase()}`}>
            ///   <div dangerouslySetInnerHTML={{ __html: msg.text }} />
            /// </div>
            <div key={idx} className={`message ${msg.sender.toLowerCase()}`}>
              {msg.sender === 'Assistant' && msg.text.includes('<table') ? (
                <div className="table-container">
                  <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                  <button onClick={() => downloadTableAsCSV(idx)} className="download-button">
                    Download CSV
                  </button>
             </div>
      ) : (
        <div dangerouslySetInnerHTML={{ __html: msg.text }} />
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
