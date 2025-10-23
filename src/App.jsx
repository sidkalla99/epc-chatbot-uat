import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  // ✅ Add routing
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import ChatApp from './ChatApp';
import HistoryPage from './HistoryPage';  // ✅ Import your new page

Amplify.configure(awsExports);

function SessionWrapper({ user, signOut }) {
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      alert('🔒 Session expired. You will be logged out.');
      signOut();
    }, 60 * 60 * 1000); // 1 hour

    return () => clearTimeout(timeout);
  }, [signOut]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChatApp user={user} />} />
        <Route path="/history" element={<HistoryPage user={user} />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <div className="auth-wrapper">
      <Authenticator>
        {({ signOut, user }) => (
          <SessionWrapper signOut={signOut} user={user} />
        )}
      </Authenticator>
    </div>
  );
}
