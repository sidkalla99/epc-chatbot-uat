import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import ChatApp from './ChatApp';
import HistoryPage from './HistoryPage';
import awsExports from './aws-exports';

Amplify.configure(awsExports);

function SessionWrapper({ user, signOut }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const timeout = setTimeout(() => {
      alert('🔒 Session expired.');
      signOut();
    }, 60 * 60 * 1000);

    return () => clearTimeout(timeout);
  }, [signOut]);

  const isHistory = location.pathname === "/history";

  return (
    <div className="app-container">
      <div className="header">
        <h2>Welcome, {user?.attributes?.email}</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate(isHistory ? "/" : "/history")}>
            {isHistory ? "New Chat" : "Chat History"}
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

export default function App() {
  return (
    <div className="auth-wrapper">
      <Authenticator
        components={{
          SignUp: {
            FormFields() {
              return (
                <>
                  <Authenticator.SignUp.FormFields />
                  <label class="amplify-label" for="amplify-id-«ra»">Business Unit</label>
                  <select name="custom:business_unit" required>
                    <option value="">Select Business Unit</option>
                    <option value="Global">Global</option>
                    <option value="Spain">Spain</option>
                    <option value="Italy">Italy</option>
                    <option value="Germany">Germany</option>
                    <option value="Latam">Latam</option>
                    <option value="United States">United States</option>
                  </select>
                </>
              );
            }
          }
        }}
      >
        {({ signOut, user }) => (
          <Router>
            <SessionWrapper signOut={signOut} user={user} />
          </Router>
        )}
      </Authenticator>
    </div>
  );
}
