session timeout 

app.js 
import React, { useEffect } from 'react';
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
        {({ signOut, user }) => {
          // ⏱️ Auto logout after 1 hour
          useEffect(() => {
            const timeout = setTimeout(() => {
              alert('🔒 Session expired. You will be logged out.');
              signOut();
            }, 2 * 60 * 1000); // 1 hour in milliseconds

            return () => clearTimeout(timeout); // Cleanup on unmount
          }, [signOut]);

          return (
            <main className="app-container">
              <div className="chat-container">
                <div className="header">
                  <h2>Welcome, {user?.attributes?.email}</h2>
                  <button onClick={signOut}>Sign Out</button>
                </div>
                <ChatApp />
              </div>
            </main>
          );
        }}
      </Authenticator>
    </div>
  );
}
