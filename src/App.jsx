import React from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import ChatApp from './ChatApp';

Amplify.configure(awsExports);

export default function App() {
  return (
    <div className="auth-wrapper">
    <Authenticator>
      {({ signOut, user }) => (
        <main className="app-container">
          <div className="chat-container">
          <div className="header">
          <h2>Welcome, {user?.attributes?.email}</h2>
          <button onClick={signOut}>Sign Out</button>
          </div>
          <ChatApp />
          </div>
        </main>
      )}
    </Authenticator>
    </div>
  );
}
