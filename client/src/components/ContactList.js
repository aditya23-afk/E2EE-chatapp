import React from 'react';
import UserAvatar from './UserAvatar';

const ContactList = ({ 
  contacts, 
  onSelect, 
  selectedContact, 
  privateRooms, 
  onOpenPrivateRoomModal,
  onLeaveRoom,
  onShowRoomKey,
  selectedRoom 
}) => {
  return (
    <div className="contact-list">
      {/* Public Channel Section */}
      <div className="section">
        <h3>Public Channel</h3>
        <div 
          className={`contact ${!selectedContact && !selectedRoom ? 'selected' : ''}`}
          onClick={() => onSelect(null)}
        >
          <div className="contact-with-avatar">
            <div className="avatar medium">
              <div className="avatar-circle" style={{ backgroundColor: '#28a745' }}>
                📢
              </div>
            </div>
            <div className="contact-info">
              <div className="contact-name">Broadcast to All</div>
              <div className="contact-status">Public channel</div>
            </div>
          </div>
        </div>
      </div>

      {/* Private Rooms Section */}
      <div className="section">
        <div className="section-header">
          <h3>Private Rooms</h3>
          <button className="add-room-btn" onClick={onOpenPrivateRoomModal}>
            ➕
          </button>
        </div>
        
        {privateRooms.length > 0 ? (
          privateRooms.map((room) => (
            <div 
              key={room.key} 
              className={`contact room ${selectedRoom === room.key ? 'selected' : ''}`}
              onClick={() => onSelect(null, room.key)}
            >
              <div className="contact-with-avatar">
                <div className="avatar medium">
                  <div className="avatar-circle" style={{ backgroundColor: '#6f42c1' }}>
                    🔐
                  </div>
                </div>
                <div className="contact-info">
                  <div className="contact-name">Room #{room.key}</div>
                  <div className="contact-status">{room.memberCount} members</div>
                </div>
                <div className="room-actions">
                  <button 
                    className="show-key-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowRoomKey(room.key);
                    }}
                    title="Show room key"
                  >
                    🔑
                  </button>
                  <button 
                    className="leave-room-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLeaveRoom(room.key);
                    }}
                    title="Leave room"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-rooms">
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔐</div>
            <div>No private rooms</div>
            <button className="join-room-link" onClick={onOpenPrivateRoomModal}>
              Join or create a room
            </button>
          </div>
        )}
      </div>

      {/* Online Users Section */}
      <div className="section">
        <h3>Direct Messages</h3>
        {contacts.map((contact, index) => (
          <div 
            key={index} 
            className={`contact ${selectedContact === contact && !selectedRoom ? 'selected' : ''}`}
            onClick={() => onSelect(contact)}
          >
            <div className="contact-with-avatar">
              <UserAvatar username={contact} isOnline={true} size="medium" />
              <div className="contact-info">
                <div className="contact-name">{contact}</div>
                <div className="contact-status">Online</div>
              </div>
            </div>
          </div>
        ))}
        {contacts.length === 0 && (
          <div className="no-users">
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>👥</div>
            <div>No other users online</div>
            <div style={{ fontSize: '12px', marginTop: '5px', opacity: '0.7' }}>
              Open another tab to test messaging
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactList;