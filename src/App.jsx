import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import ChatApp from './ChatApp';
import HistoryPage from './HistoryPage';
import awsExports from './aws-exports';

Amplify.configure(awsExports);

// ---------------------------------------------------------
// SESSION WRAPPER (keeps your existing routing + header UI)
// ---------------------------------------------------------
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

// ---------------------------------------------------------
// MAIN APP WITH AUTHENTICATOR SIGN-UP OVERRIDE
// ---------------------------------------------------------
export default function App() {
  return (
    <div className="auth-wrapper">
      <Authenticator
        components={{
          SignUp: {
            FormFields() {
              const { validationErrors } = useAuthenticator();

              return (
                <>
                  {/* Default sign-up fields */}
                  <Authenticator.SignUp.FormFields />

                  {/* -----------------------------
                      BUSINESS UNIT DROPDOWN FIELD
                      ----------------------------- */}
                  <label style={{ marginTop: "10px" }}>Business Unit</label>
                  <select
                    name="custom:business_unit"
                    required
                    style={{
                      padding: "10px",
                      marginTop: "8px",
                      marginBottom: "16px",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                      width: "100%"
                    }}
                  >
                    <option value="">Select Business Unit</option>
                    <option value="Global">Global</option>
                    <option value="Spain">Spain</option>
                    <option value="Italy">Italy</option>
                    <option value="Germany">Germany</option>
                    <option value="Latam">Latam</option>
                    <option value="United States">United States</option>
                  </select>

                  {validationErrors?.["custom:business_unit"] && (
                    <span style={{ color: "red" }}>
                      {validationErrors["custom:business_unit"]}
                    </span>
                  )}
                </>
              );
            }
          }
        }}
      >
        {/* Authenticated routes */}
        {({ signOut, user }) => (
          <Router>
            <SessionWrapper signOut={signOut} user={user} />
          </Router>
        )}
      </Authenticator>
    </div>
  );
}
