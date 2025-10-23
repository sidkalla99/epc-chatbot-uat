import React, { useEffect, useState } from 'react';

function HistoryPage({ user }) {
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(
          `https://fgi3msvj1m.execute-api.eu-central-1.amazonaws.com/dev/get-history?user_email=${user?.attributes?.email}`
        );
        const result = await res.json();

        let parsed;
        if (typeof result.body === 'string') {
          parsed = JSON.parse(result.body);
        } else {
          parsed = result.body;
        }

        setChatHistory(parsed);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch chat history:', err);
        setError('Failed to load chat history.');
        setLoading(false);
      }
    };

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
