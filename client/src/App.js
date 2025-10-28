import React, { useState, useEffect } from 'react';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import ContactList from './components/ContactList';
import ConnectionStatus from './components/ConnectionStatus';
import UserMenu from './components/UserMenu';
import LoginModal from './components/LoginModal';
import PrivateRoomModal from './components/PrivateRoomModal';
import RoomCreatedModal from './components/RoomCreatedModal';
import SettingsModal from './components/SettingsModal';
import FriendsModal from './components/FriendsModal';
import { ThemeProvider } from './components/ThemeProvider';
import WebSocketClient from './api/websocket';
import { generateKeyPair } from './crypto/keygen';
import { encrypt } from './crypto/encrypt';
import { decrypt } from './crypto/decrypt';
import { soundManager } from './utils/sounds';
import './styles.css';
import './styles-premium.css';

const App = () => {
  const [messageHistory, setMessageHistory] = useState(() => {
    // Load message history from localStorage on startup
    try {
      const saved = localStorage.getItem('chatMessageHistory');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Error loading message history:', error);
      return {};
    }
  });
  const [connectedUsers, setConnectedUsers] = useState([]); // Now contains friends only
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [privateRooms, setPrivateRooms] = useState([]);
  const [currentUser, setCurrentUser] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  
  // Friend system state
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [friendRequestCount, setFriendRequestCount] = useState(0);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPrivateRoomModal, setShowPrivateRoomModal] = useState(false);
  const [showRoomCreatedModal, setShowRoomCreatedModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [currentRoomKey, setCurrentRoomKey] = useState('');
  const [isNewRoom, setIsNewRoom] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Map());

  // Get current chat key (contact or room)
  const getCurrentChatKey = () => {
    if (selectedRoom) return `room_${selectedRoom}`;
    if (selectedContact) return `contact_${selectedContact}`;
    return null;
  };

  // Get messages for current chat
  const getCurrentMessages = () => {
    const chatKey = getCurrentChatKey();
    return chatKey ? (messageHistory[chatKey] || []) : [];
  };

  // Add message to history
  const addMessageToHistory = (message) => {
    const chatKey = getCurrentChatKey();
    if (!chatKey) return;

    setMessageHistory(prev => ({
      ...prev,
      [chatKey]: [...(prev[chatKey] || []), message]
    }));
  };

  // Save message history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('chatMessageHistory', JSON.stringify(messageHistory));
    } catch (error) {
      console.error('Error saving message history:', error);
    }
  }, [messageHistory]);

  // Clear all message history (for privacy)
  const clearAllMessageHistory = () => {
    setMessageHistory({});
    localStorage.removeItem('chatMessageHistory');
  };

  // Friend system functions
  const handleSendFriendRequest = (targetUsername) => {
    if (wsClient && targetUsername !== currentUser) {
      wsClient.sendFriendRequest(targetUsername);
    }
  };

  const handleAcceptFriendRequest = (requesterUsername) => {
    if (wsClient) {
      wsClient.acceptFriendRequest(requesterUsername);
    }
  };

  const handleRejectFriendRequest = (requesterUsername) => {
    if (wsClient) {
      wsClient.rejectFriendRequest(requesterUsername);
    }
  }; // userId -> timestamp
  const [wsClient] = useState(new WebSocketClient());
  const { publicKey, privateKey } = generateKeyPair();

  // Check for saved username on app start
  useEffect(() => {
    // Initialize sound manager
    window.soundManager = soundManager;
    
    const savedUsername = localStorage.getItem('secureChat_username');
    if (savedUsername) {
      setCurrentUser(savedUsername);
      setIsLoggedIn(true);
      connectToChat(savedUsername);
    } else {
      setShowLoginModal(true);
    }
  }, []);

  const connectToChat = (username) => {
    // Setup WebSocket client
    wsClient.onMessageReceived = (data) => {
      const decryptedMessage = decrypt(data.message, privateKey);
      
      // Play notification sound
      if (typeof window !== 'undefined' && window.soundManager) {
        window.soundManager.play('notification');
      }
      
      const newMessage = {
        from: data.from,
        to: data.to,
        roomKey: data.roomKey,
        message: decryptedMessage,
        timestamp: data.timestamp,
        isPrivate: !!data.to,
        isRoom: !!data.roomKey
      };

      // Store message in appropriate chat history
      const chatKey = data.roomKey ? `room_${data.roomKey}` : `contact_${data.to === currentUser ? data.from : data.to}`;
      setMessageHistory(prev => ({
        ...prev,
        [chatKey]: [...(prev[chatKey] || []), newMessage]
      }));
    };

    wsClient.onUserListUpdated = (users) => {
      // This now receives friends list instead of all users
      setConnectedUsers(users.filter(user => user !== username));
      setFriends(users.filter(user => user !== username));
      setIsConnected(true);
    };

    wsClient.onRoomListUpdated = (rooms) => {
      setPrivateRooms(rooms);
    };

    wsClient.onRoomJoined = (roomKey, success, isCreated = false) => {
      console.log(`Room joined callback: ${roomKey}, success: ${success}, isCreated: ${isCreated}`);
      if (success) {
        // Close the private room modal
        setShowPrivateRoomModal(false);
        
        setSelectedRoom(roomKey);
        setSelectedContact(null);
        // Don't clear messages - they're now stored per room
        
        // Show room key modal if this is a newly created room
        if (isCreated) {
          setCurrentRoomKey(roomKey);
          setIsNewRoom(true);
          setShowRoomCreatedModal(true);
        }
      } else {
        console.error('Failed to join/create room:', roomKey);
      }
    };

    wsClient.onRoomLeft = (roomKey) => {
      if (selectedRoom === roomKey) {
        setSelectedRoom(null);
        // Don't clear messages - they're now stored per room
      }
    };

    wsClient.onTypingUpdate = (data) => {
      const { from, isTyping } = data;
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        if (isTyping) {
          newMap.set(from, Date.now());
        } else {
          newMap.delete(from);
        }
        return newMap;
      });
    };

    // Friend system callbacks
    wsClient.onFriendsListUpdated = (friendsList) => {
      setFriends(friendsList);
      setConnectedUsers(friendsList); // Keep backward compatibility
    };

    wsClient.onFriendRequestReceived = (from, requestCount) => {
      setFriendRequestCount(requestCount);
      // Play notification sound
      if (typeof window !== 'undefined' && window.soundManager) {
        window.soundManager.play('notification');
      }
      console.log(`Friend request received from ${from}`);
    };

    wsClient.onFriendRequestResult = (success, message) => {
      console.log(`Friend request result: ${success ? 'Success' : 'Error'} - ${message}`);
      // You can add toast notifications here later
    };

    wsClient.onPendingRequestsUpdated = (incoming, sent, requestCount) => {
      setPendingRequests(incoming);
      setSentRequests(sent);
      setFriendRequestCount(requestCount);
    };

    wsClient.onFriendRequestAccepted = (friendId, requestCount) => {
      setFriendRequestCount(requestCount || 0);
      console.log(`Friend request accepted by ${friendId}`);
      // Play success sound
      if (typeof window !== 'undefined' && window.soundManager) {
        window.soundManager.play('message');
      }
    };

    wsClient.onMessageError = (error, targetUser) => {
      console.error(`Message error: ${error} (target: ${targetUser})`);
      // You can add toast notifications here later
    };

    // Add connection status tracking
    const originalConnect = wsClient.connect.bind(wsClient);
    wsClient.connect = (userId) => {
      setIsConnected(false);
      return originalConnect(userId);
    };

    wsClient.connect(username);
  };

  const handleLogin = async (username) => {
    // Save username to localStorage
    localStorage.setItem('secureChat_username', username);
    setCurrentUser(username);
    setIsLoggedIn(true);
    setShowLoginModal(false);
    
    // Clear previous connections but keep message history
    setConnectedUsers([]);
    setSelectedContact(null);
    setSelectedRoom(null);
    setPrivateRooms([]);
    
    // Connect to chat
    connectToChat(username);
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('secureChat_username');
    
    // Disconnect from WebSocket
    wsClient.disconnect();
    
    // Reset state
    setCurrentUser('');
    setIsLoggedIn(false);
    setIsConnected(false);
    // Keep message history even after logout
    setConnectedUsers([]);
    setSelectedContact(null);
    setSelectedRoom(null);
    setPrivateRooms([]);
    
    // Show login modal
    setShowLoginModal(true);
  };

  const handleSend = (message) => {
    if (!message.trim() || !isLoggedIn) return;
    
    const encryptedMessage = encrypt(message, publicKey);
    
    // Send via WebSocket
    wsClient.sendMessage(encryptedMessage, selectedContact, selectedRoom);
    
    // Play sound effect
    if (typeof window !== 'undefined' && window.soundManager) {
      window.soundManager.play('message');
    }
    
    // Add to local message history (your own message)
    const newMessage = {
      from: currentUser,
      to: selectedContact,
      roomKey: selectedRoom,
      message: message,
      timestamp: new Date().toISOString(),
      isPrivate: !!selectedContact,
      isRoom: !!selectedRoom,
      isSelf: true
    };

    const chatKey = selectedRoom ? `room_${selectedRoom}` : `contact_${selectedContact}`;
    setMessageHistory(prev => ({
      ...prev,
      [chatKey]: [...(prev[chatKey] || []), newMessage]
    }));
  };

  const handleSelectContact = (contact, roomKey = null) => {
    if (roomKey) {
      setSelectedRoom(roomKey);
      setSelectedContact(null);
    } else {
      setSelectedContact(contact === selectedContact ? null : contact);
      setSelectedRoom(null);
    }
    // Don't clear messages - they're now stored per contact/room
  };

  const handleJoinRoom = (roomKey) => {
    console.log(`Handling join room: ${roomKey}`);
    wsClient.joinRoom(roomKey, false); // Pass false to indicate this is joining existing room
  };

  const handleShowRoomKey = (roomKey) => {
    setCurrentRoomKey(roomKey);
    setIsNewRoom(false);
    setShowRoomCreatedModal(true);
  };

  const handleCreateRoom = (roomKey) => {
    console.log(`Handling create room: ${roomKey}`);
    wsClient.joinRoom(roomKey, true); // Pass true to indicate this is a new room creation
  };

  const handleLeaveRoom = (roomKey) => {
    wsClient.leaveRoom(roomKey);
  };

  const getCurrentChatContext = () => {
    if (selectedRoom) {
      return `🔐 Room #${selectedRoom}`;
    } else if (selectedContact) {
      return `💬 Chatting with ${selectedContact}`;
    } else {
      return '📢 Broadcasting to all';
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      wsClient.disconnect();
      setIsConnected(false);
    };
  }, [wsClient]);

  if (!isLoggedIn) {
    return (
      <ThemeProvider>
        <LoginModal onLogin={handleLogin} isVisible={showLoginModal} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="app">
      <div className="user-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <div><strong>{currentUser}</strong></div>
            <div style={{ fontSize: '12px', opacity: '0.8' }}>
              {getCurrentChatContext()}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <ConnectionStatus isConnected={isConnected} userCount={connectedUsers.length + 1} />
          <UserMenu 
            currentUser={currentUser} 
            isConnected={isConnected} 
            onLogout={handleLogout}
            onOpenSettings={() => setShowSettingsModal(true)}
            onOpenFriends={() => setShowFriendsModal(true)}
            friendRequestCount={friendRequestCount}
          />
        </div>
      </div>
      
      <div className="main-chat">
        <ContactList 
          contacts={connectedUsers} 
          onSelect={handleSelectContact}
          selectedContact={selectedContact}
          privateRooms={privateRooms}
          onOpenPrivateRoomModal={() => setShowPrivateRoomModal(true)}
          onLeaveRoom={handleLeaveRoom}
          onShowRoomKey={handleShowRoomKey}
          selectedRoom={selectedRoom}
        />
        <div className="chat-area">
          <ChatWindow 
            messages={getCurrentMessages()} 
            currentUser={currentUser} 
            typingUsers={Array.from(typingUsers.keys())}
          />
          <MessageInput 
            onSend={handleSend} 
            onTyping={(isTyping) => wsClient.sendTypingStatus(isTyping, selectedContact, selectedRoom)}
          />
        </div>
      </div>
      
      <PrivateRoomModal
        isVisible={showPrivateRoomModal}
        onClose={() => setShowPrivateRoomModal(false)}
        onJoinRoom={handleJoinRoom}
        onCreateRoom={handleCreateRoom}
      />
      
      <RoomCreatedModal
        isVisible={showRoomCreatedModal}
        onClose={() => setShowRoomCreatedModal(false)}
        roomKey={currentRoomKey}
        isNewRoom={isNewRoom}
      />
      
      <SettingsModal
        isVisible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
      
      <FriendsModal
        isVisible={showFriendsModal}
        onClose={() => setShowFriendsModal(false)}
        onSendFriendRequest={handleSendFriendRequest}
        onAcceptFriendRequest={handleAcceptFriendRequest}
        onRejectFriendRequest={handleRejectFriendRequest}
        pendingRequests={pendingRequests}
        sentRequests={sentRequests}
        friends={friends}
      />
      </div>
    </ThemeProvider>
  );
};

export default App;