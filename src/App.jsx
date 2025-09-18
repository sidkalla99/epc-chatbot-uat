import React from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import ChatApp from './ChatApp';

Amplify.configure(awsExports);

// ✅ Session wrapper that handles auto-logout
function SessionWrapper({ user, signOut }) {
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      alert('🔒 Session expired. You will be logged out.');
      signOut();
    }, 60 * 60 * 1000); // ⏱ 2 minutes

    return () => clearTimeout(timeout);
  }, [signOut]);

  return (
    <main className="app-container">
      <div className="chat-container">
        <div className="header">
          <h2>Welcome, {user?.attributes?.email}</h2>
          <button onClick={signOut}>Sign Out</button>
        </div>
        <ChatApp user={user} />
      </div>
    </main>
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
