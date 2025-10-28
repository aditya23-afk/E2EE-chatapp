import React, { useState } from 'react';

const TestInterface = ({ onSendMessage, connectedUsers, currentUser }) => {
  const [testMessage, setTestMessage] = useState('');

  const sendTestMessage = () => {
    if (testMessage.trim()) {
      onSendMessage(testMessage);
      setTestMessage('');
    }
  };

  const sendQuickMessage = (message) => {
    onSendMessage(message);
  };

  return (
    <div className="test-interface">
      <h3>Quick Test Messages</h3>
      <p>Currently logged in as: <strong>{currentUser}</strong></p>
      <p>Connected users: {connectedUsers.length > 0 ? connectedUsers.join(', ') : 'None'}</p>
      
      <div className="test-message-input">
        <input
          type="text"
          value={testMessage}
          onChange={(e) => setTestMessage(e.target.value)}
          placeholder="Type a test message..."
          onKeyPress={(e) => e.key === 'Enter' && sendTestMessage()}
        />
        <button onClick={sendTestMessage}>Send</button>
      </div>

      <div className="quick-messages">
        <button onClick={() => sendQuickMessage('Hello everyone! 👋')}>
          Hello
        </button>
        <button onClick={() => sendQuickMessage('How are you doing? 🤔')}>
          How are you?
        </button>
        <button onClick={() => sendQuickMessage('Testing encryption... 🔐')}>
          Test Encryption
        </button>
        <button onClick={() => sendQuickMessage('This is a private message 🤫')}>
          Private Test
        </button>
      </div>
    </div>
  );
};

export default TestInterface;