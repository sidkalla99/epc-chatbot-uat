import React, { useEffect, useState } from 'react';

function HistoryPage({ user }) {
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.attributes?.email) return;

    const userEmail = user.attributes.email;
    const url = `https://fgi3msvj1m.execute-api.eu-central-1.amazonaws.com/dev/get-history?user_email=${encodeURIComponent(userEmail)}`;

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(data => {
        setChatHistory(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setError("Failed to load chat history.");
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="chat-history">🔄 Loading chat history...</div>;
  if (error) return <div className="chat-history error">{error}</div>;

  return (
    <div className="chat-history">
      <header className="chat-header">🕑 Chat History</header>
      <div className="chat-scroll-area">
        {chatHistory.length === 0 ? (
          <p>No chat history found for {user?.attributes?.email}.</p>
        ) : (
          chatHistory.map((entry, idx) => (
            <div key={idx} className="chat-bubble-wrapper">
              <div className="chat-bubble user-bubble">
                <div className="chat-meta">You</div>
                <div className="chat-text">{entry.prompt}</div>
              </div>
              <div className="chat-bubble zelo-bubble">
                <div className="chat-meta">Zelo</div>
                <div
                  className="chat-text"
                  dangerouslySetInnerHTML={{ __html: entry.agent_response }}
                />
                <div className="chat-time">
                  {new Date(entry.request_timestamp_utc).toLocaleString()}{" "}
                  {entry.rating === 1 && '👍'} {entry.rating === -1 && '👎'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default HistoryPage;
