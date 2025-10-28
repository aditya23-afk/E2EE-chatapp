import React from 'react';

const ConnectionStatus = ({ isConnected, userCount }) => {
  return (
    <div className="connection-status">
      <div className={`connection-dot ${isConnected ? 'connected' : 'disconnected'}`}></div>
      <span>
        {isConnected ? `Connected • ${userCount} online` : 'Disconnected'}
      </span>
    </div>
  );
};

export default ConnectionStatus;