// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import HistoryPage from './HistoryPage'; // ✅ new import

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/history" element={<HistoryPageWrapper />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// ✅ Wrap HistoryPage with Authenticator (like App does)
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

function HistoryPageWrapper() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main className="app-container">
          <div className="chat-container">
            <div className="header">
              <h2>Welcome, {user?.attributes?.email}</h2>
              <button onClick={signOut}>Sign Out</button>
            </div>
            <HistoryPage user={user} />
          </div>
        </main>
      )}
    </Authenticator>
  );
}
