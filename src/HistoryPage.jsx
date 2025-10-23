import React, { useEffect, useState } from 'react';

function HistoryPage({ user }) {
const [chatHistory, setChatHistory] = useState([]);  // ✅ initialize as empty array
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch('https://your-api-url')
    .then(res => res.json())
    .then(data => {
      console.log("Chat history response:", data);  // ✅ confirm shape
      setChatHistory(Array.isArray(data) ? data : []);
    })
    .catch(err => console.error("Fetch error", err))
    .finally(() => setLoading(false));
}, []);

return (
  <div>
    {loading ? (
      <p>Loading history...</p>
    ) : chatHistory.length > 0 ? (
      chatHistory.map(chat => (
        <div key={chat.chat_key}>
          <strong>{chat.prompt}</strong>
          <p>{chat.agent_response}</p>
          <small>{new Date(chat.request_timestamp_utc).toLocaleString()}</small>
        </div>
      ))
    ) : (
      <p>No chat history found.</p>
    )}
  </div>
);

    fetchHistory();
  }, [user]);

  if (loading) return <div style={{ padding: 20 }}>🔄 Loading chat history...</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>🕑 Chat History</h2>
      {chatHistory.length === 0 ? (
        <p>No chat history found for {user?.attributes?.email}.</p>
      ) : (
        chatHistory.map((entry, idx) => (
          <div key={idx} style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
            <div><strong>You:</strong> {entry.prompt}</div>
            <div><strong>Zelo:</strong> <span dangerouslySetInnerHTML={{ __html: entry.agent_response }} /></div>
            <div style={{ fontSize: '0.85em', color: '#666' }}>
              {new Date(entry.request_timestamp_utc).toLocaleString()} {entry.rating === 1 && '👍'} {entry.rating === -1 && '👎'}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default HistoryPage;
