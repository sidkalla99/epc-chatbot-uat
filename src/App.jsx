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
        <main>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', paddingTop: '4rem'}}>
            <h2 style={{ margin: 0 }}>Welcome, {user?.attributes?.email}</h2>
            <button onClick={signOut}>Sign Out</button>
          </div>
          <ChatApp />
        </main>
      )}
    </Authenticator>
    </div>
  );
}
