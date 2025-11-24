import React, { useEffect, useState } from 'react';
import { Copy, Check, ThumbsUp, ThumbsDown, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

function HistoryPage({ user }) {
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Fetch user chat history
  useEffect(() => {
    if (!user?.attributes?.email) return;

    const userEmail = user.attributes.email;
    const url = `https://fgi3msvj1m.execute-api.eu-central-1.amazonaws.com/dev/get-history?user_email=${encodeURIComponent(userEmail)}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        setChatHistory(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setError('Failed to load chat history.');
      })
      .finally(() => setLoading(false));
  }, [user]);

  // Copy helper
  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 3000);
  };

  // Download helper
  const downloadTableAsCSV = (index) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = chatHistory[index].agent_response;

    const tables = tempDiv.querySelectorAll('table');
    if (!tables || tables.length === 0) return;

    const wb = XLSX.utils.book_new();

    tables.forEach((table, tableIndex) => {
      const grid = [];
      const rows = table.querySelectorAll('tr');

      for (let row of rows) {
        const cells = [...row.querySelectorAll('th, td')];
        grid.push(cells.map((cell) => cell.textContent.trim()));
      }

      const ws = XLSX.utils.aoa_to_sheet(grid);
      XLSX.utils.book_append_sheet(wb, ws, `Table ${tableIndex + 1}`);
    });

    XLSX.writeFile(wb, `history-table-${index + 1}.xlsx`);
  };

  if (loading) return <div className="chat-box">🔄 Loading chat history...</div>;
  if (error) return <div className="chat-box error">{error}</div>;

  return (
    <div className="chat-box">
      {chatHistory.length === 0 ? (
        <p>No chat history found for {user?.attributes?.email}.</p>
      ) : (
        chatHistory
          // ✅ Sort DESCENDING (latest first)
          .sort(
            (a, b) =>
              new Date(b.request_timestamp_utc) -
              new Date(a.request_timestamp_utc)
          )
          .map((entry, idx) => {
            const isTable = entry.agent_response?.includes('<table>');
            const isHello = entry.agent_response
              ?.toLowerCase()
              ?.includes('hello');

            return (
              <React.Fragment key={idx}>
                {/* ✅ Assistant (Zelo) response first */}
                <div className="message assistant">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: entry.agent_response || '',
                    }}
                  />

                  {!isHello && (
                    <div className="button-row">
                      {isTable && (
                        <div className="tooltip">
                          <Download
                            className="action-icon"
                            onClick={() => downloadTableAsCSV(idx)}
                          />
                          <span className="tooltip-text">Download</span>
                        </div>
                      )}
                      <div className="tooltip">
                        {copiedIndex === idx ? (
                          <Check className="action-icon active" />
                        ) : (
                          <Copy
                            className="action-icon"
                            onClick={() =>
                              handleCopy(
                                entry.agent_response.replace(/<[^>]*>?/gm, ''),
                                idx
                              )
                            }
                          />
                        )}
                        <span className="tooltip-text">
                          {copiedIndex === idx ? 'Copied!' : 'Copy'}
                        </span>
                      </div>
                      {entry.rating === 1 && (
                        <ThumbsUp className="action-icon active" />
                      )}
                      {entry.rating === -1 && (
                        <ThumbsDown className="action-icon active" />
                      )}
                    </div>
                  )}

                  <div className="chat-time">
                    {new Date(entry.request_timestamp_utc).toLocaleString()}
                  </div>
                </div>

                {/* ✅ User prompt second */}
                <div className="message user">{entry.prompt}</div>
              </React.Fragment>
            );
          })
      )}
    </div>
  );
}

export default HistoryPage;
