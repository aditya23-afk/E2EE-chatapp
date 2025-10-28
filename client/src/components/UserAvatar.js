import React from 'react';

const UserAvatar = ({ username, isOnline = true, size = 'medium' }) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const sizeClasses = {
    small: 'w-8 h-8 text-xs',
    medium: 'w-10 h-10 text-sm',
    large: 'w-12 h-12 text-base'
  };

  return (
    <div className={`avatar ${sizeClasses[size]}`}>
      <div 
        className="avatar-circle"
        style={{ backgroundColor: getAvatarColor(username) }}
      >
        {getInitials(username)}
      </div>
      {isOnline && <div className="online-indicator"></div>}
    </div>
  );
};

export default UserAvatar;