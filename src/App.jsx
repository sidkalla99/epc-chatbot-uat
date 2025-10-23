import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import ChatApp from './ChatApp';
import HistoryPage from './HistoryPage';

Amplify.configure(awsExports);

// ✅ SessionWrapper handles layout, routing, header, and logout
function SessionWrapper({ user, signOut }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-logout after 1 hour
  useEffect(() => {
    const timeout = setTimeout(() => {
      alert('🔒 Session expired. You will be logged out.');
      signOut();
    }, 60 * 60 * 1000);

    return () => clearTimeout(timeout);
  }, [signOut]);

  const isHistoryPage = location.pathname === "/history";

  return (
    <div className="app-container">
      <div className="header">
        <h2>Welcome, {user?.attributes?.email}</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate(isHistoryPage ? '/' : '/history')}>
            {isHistoryPage ? 'New Chat' : 'Chat History'}
          </button>
          <button onClick={signOut}>Sign Out</button>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<ChatApp user={user} />} />
        <Route path="/history" element={<HistoryPage user={user} />} />
      </Routes>
    </div>
  );
}

// ✅ Main App entrypoint with Auth wrapper
export default function App() {
  return (
    <div className="auth-wrapper">
      <Authenticator>
        {({ signOut, user }) => (
          <Router>
            <SessionWrapper signOut={signOut} user={user} />
          </Router>
        )}
      </Authenticator>
    </div>
  );
}
