const WebSocket = require('ws');
const { validateSession } = require('./auth');

let wss;
const connectedUsers = new Map(); // userId -> {ws, userId, username, rooms: Set, sessionId}
const privateRooms = new Map(); // roomKey -> Set of userIds

// Friend system data structures
const friendships = new Map(); // userId -> Set of friend userIds
const friendRequests = new Map(); // userId -> Set of pending incoming request userIds
const sentRequests = new Map(); // userId -> Set of sent outgoing request userIds

const initWebSocket = (server) => {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    ws.on('message', async (message) => {
      console.log('Received raw message:', message.toString());
      try {
        const data = JSON.parse(message);
        console.log('Parsed message data:', data);
        
        switch (data.type) {
          case 'register':
            // Register user with session validation
            const { sessionId, userId } = data;
            
            if (!sessionId) {
              ws.send(JSON.stringify({
                type: 'authError',
                error: 'Session ID required'
              }));
              ws.close();
              break;
            }
            
            // Validate session
            const sessionResult = await validateSession(sessionId);
            if (!sessionResult.success) {
              ws.send(JSON.stringify({
                type: 'authError',
                error: 'Invalid or expired session'
              }));
              ws.close();
              break;
            }
            
            // Use authenticated username from session
            const authenticatedUserId = sessionResult.userId;
            const authenticatedUsername = sessionResult.username;
            
            connectedUsers.set(authenticatedUserId, { 
              ws, 
              userId: authenticatedUserId, 
              username: authenticatedUsername, 
              rooms: new Set(),
              sessionId: sessionId
            });
            
            console.log(`User ${authenticatedUsername} (${authenticatedUserId}) connected with session ${sessionId}`);
            
            // Send current friends list
            sendFriendsList(authenticatedUserId);
            
            // Send pending friend requests
            sendPendingRequests(authenticatedUserId);
            
            // Send current room list
            sendRoomList(authenticatedUserId);
            break;

          case 'message':
            handleMessage(data);
            break;

          case 'joinRoom':
            handleJoinRoom(data);
            break;

          case 'leaveRoom':
            handleLeaveRoom(data);
            break;

          case 'typing':
            handleTyping(data);
            break;

          // Friend system message handlers
          case 'sendFriendRequest':
            handleSendFriendRequest(data);
            break;

          case 'acceptFriendRequest':
            handleAcceptFriendRequest(data);
            break;

          case 'rejectFriendRequest':
            handleRejectFriendRequest(data);
            break;

          case 'getFriendsList':
            sendFriendsList(data.from);
            break;

          case 'getPendingRequests':
            sendPendingRequests(data.from);
            break;

          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      // Remove user from connected users
      for (const [userId, userData] of connectedUsers.entries()) {
        if (userData.ws === ws) {
          console.log(`User ${userData.username} (${userId}) disconnected`);
          connectedUsers.delete(userId);
          
          // Remove from all rooms
          for (const roomKey of userData.rooms) {
            const room = privateRooms.get(roomKey);
            if (room) {
              room.delete(userId);
              if (room.size === 0) {
                privateRooms.delete(roomKey);
              }
            }
          }
          
          // Broadcast updated user list to friends
          broadcastFriendsListToFriends(userId);
          break;
        }
      }
    });
  });
};

// Rest of your websocket functions remain the same...
// (I'll continue with the rest of the functions)

const handleMessage = (data) => {
  const { from, to, roomKey, message } = data;
  
  if (roomKey) {
    // Room message - broadcast to all users in the room
    const room = privateRooms.get(roomKey);
    if (room && room.has(from)) {
      room.forEach(userId => {
        const user = connectedUsers.get(userId);
        if (user && user.ws.readyState === WebSocket.OPEN) {
          user.ws.send(JSON.stringify({
            type: 'message',
            from: from,
            message: message,
            timestamp: data.timestamp,
            roomKey: roomKey,
            isPrivateRoom: true
          }));
        }
      });
    }
  } else if (to) {
    // Direct message - check if users are friends
    const senderFriends = friendships.get(from) || new Set();
    
    if (!senderFriends.has(to)) {
      // Not friends - send error back to sender
      const sender = connectedUsers.get(from);
      if (sender && sender.ws.readyState === WebSocket.OPEN) {
        sender.ws.send(JSON.stringify({
          type: 'messageError',
          error: 'You can only send messages to friends',
          targetUser: to
        }));
      }
      return;
    }
    
    // Send to specific user (friend)
    const targetUser = connectedUsers.get(to);
    if (targetUser && targetUser.ws.readyState === WebSocket.OPEN) {
      targetUser.ws.send(JSON.stringify({
        type: 'message',
        from: from,
        message: message,
        timestamp: data.timestamp,
        isPrivate: true
      }));
    }
    
    // Echo back to sender
    const sender = connectedUsers.get(from);
    if (sender && sender.ws.readyState === WebSocket.OPEN) {
      sender.ws.send(JSON.stringify({
        type: 'message',
        from: from,
        message: message,
        timestamp: data.timestamp,
        isPrivate: true,
        to: to,
        isSelf: true
      }));
    }
  }
};

const handleJoinRoom = (data) => {
  const { userId, roomKey, isCreating } = data;
  
  if (!roomKey || roomKey.length !== 6 || !/^\d{6}$/.test(roomKey)) {
    const user = connectedUsers.get(userId);
    if (user && user.ws.readyState === WebSocket.OPEN) {
      user.ws.send(JSON.stringify({
        type: 'roomJoined',
        success: false,
        error: 'Invalid room key format'
      }));
    }
    return;
  }

  const user = connectedUsers.get(userId);
  if (!user) {
    console.error('User not found:', userId);
    return;
  }

  // Create room if it doesn't exist or if explicitly creating
  if (!privateRooms.has(roomKey)) {
    privateRooms.set(roomKey, new Set());
  }

  const room = privateRooms.get(roomKey);
  room.add(userId);
  user.rooms.add(roomKey);

  console.log(`User ${user.username} ${isCreating ? 'created' : 'joined'} room ${roomKey}`);

  // Send success response
  if (user.ws.readyState === WebSocket.OPEN) {
    user.ws.send(JSON.stringify({
      type: 'roomJoined',
      roomKey: roomKey,
      success: true,
      isCreated: isCreating
    }));
  }

  // Send updated room list to user
  sendRoomList(userId);
};

const handleLeaveRoom = (data) => {
  const { userId, roomKey } = data;
  
  const user = connectedUsers.get(userId);
  if (!user) return;

  const room = privateRooms.get(roomKey);
  if (room) {
    room.delete(userId);
    user.rooms.delete(roomKey);
    
    // Remove room if empty
    if (room.size === 0) {
      privateRooms.delete(roomKey);
    }
    
    console.log(`User ${user.username} left room ${roomKey}`);
  }

  // Send updated room list
  sendRoomList(userId);
  
  // Confirm room left
  if (user.ws.readyState === WebSocket.OPEN) {
    user.ws.send(JSON.stringify({
      type: 'roomLeft',
      roomKey: roomKey
    }));
  }
};

const handleTyping = (data) => {
  const { from, to, roomKey, isTyping } = data;
  
  if (roomKey) {
    // Broadcast typing status to room members
    const room = privateRooms.get(roomKey);
    if (room && room.has(from)) {
      room.forEach(userId => {
        if (userId !== from) {
          const user = connectedUsers.get(userId);
          if (user && user.ws.readyState === WebSocket.OPEN) {
            user.ws.send(JSON.stringify({
              type: 'typing',
              from: from,
              isTyping: isTyping,
              roomKey: roomKey
            }));
          }
        }
      });
    }
  } else if (to) {
    // Send typing status to specific user
    const targetUser = connectedUsers.get(to);
    if (targetUser && targetUser.ws.readyState === WebSocket.OPEN) {
      targetUser.ws.send(JSON.stringify({
        type: 'typing',
        from: from,
        isTyping: isTyping
      }));
    }
  }
};

// Friend system functions
const handleSendFriendRequest = (data) => {
  const { from, targetUserId } = data;
  
  console.log(`Friend request from ${from} to ${targetUserId}`);
  
  // Check if users are already friends
  const senderFriends = friendships.get(from) || new Set();
  if (senderFriends.has(targetUserId)) {
    sendFriendRequestResult(from, false, 'You are already friends with this user');
    return;
  }
  
  // Check if request already exists
  const targetRequests = friendRequests.get(targetUserId) || new Set();
  if (targetRequests.has(from)) {
    sendFriendRequestResult(from, false, 'Friend request already sent');
    return;
  }
  
  // Check if sender has already sent a request
  const senderSentRequests = sentRequests.get(from) || new Set();
  if (senderSentRequests.has(targetUserId)) {
    sendFriendRequestResult(from, false, 'Friend request already sent');
    return;
  }
  
  // Add to pending requests
  if (!friendRequests.has(targetUserId)) {
    friendRequests.set(targetUserId, new Set());
  }
  if (!sentRequests.has(from)) {
    sentRequests.set(from, new Set());
  }
  
  friendRequests.get(targetUserId).add(from);
  sentRequests.get(from).add(targetUserId);
  
  // Notify target user if online
  const targetUser = connectedUsers.get(targetUserId);
  if (targetUser && targetUser.ws.readyState === WebSocket.OPEN) {
    const requestCount = friendRequests.get(targetUserId).size;
    targetUser.ws.send(JSON.stringify({
      type: 'newFriendRequest',
      from: from,
      requestCount: requestCount
    }));
    
    // Send updated pending requests
    sendPendingRequests(targetUserId);
  }
  
  // Confirm to sender
  sendFriendRequestResult(from, true, 'Friend request sent successfully');
  
  // Send updated pending requests to sender
  sendPendingRequests(from);
};

const handleAcceptFriendRequest = (data) => {
  const { from, requesterId } = data;
  
  console.log(`${from} accepting friend request from ${requesterId}`);
  
  // Remove from pending requests
  const userRequests = friendRequests.get(from) || new Set();
  const requesterSentRequests = sentRequests.get(requesterId) || new Set();
  
  if (!userRequests.has(requesterId)) {
    console.log('Friend request not found');
    return;
  }
  
  userRequests.delete(requesterId);
  requesterSentRequests.delete(from);
  
  // Add to friendships (bidirectional)
  if (!friendships.has(from)) {
    friendships.set(from, new Set());
  }
  if (!friendships.has(requesterId)) {
    friendships.set(requesterId, new Set());
  }
  
  friendships.get(from).add(requesterId);
  friendships.get(requesterId).add(from);
  
  console.log(`${from} and ${requesterId} are now friends`);
  
  // Notify both users
  const accepter = connectedUsers.get(from);
  const requester = connectedUsers.get(requesterId);
  
  if (requester && requester.ws.readyState === WebSocket.OPEN) {
    const requestCount = friendRequests.get(requesterId)?.size || 0;
    requester.ws.send(JSON.stringify({
      type: 'friendRequestAccepted',
      friendId: from,
      requestCount: requestCount
    }));
  }
  
  // Send updated friends lists and pending requests
  sendFriendsList(from);
  sendFriendsList(requesterId);
  sendPendingRequests(from);
  sendPendingRequests(requesterId);
};

const handleRejectFriendRequest = (data) => {
  const { from, rejectRequesterId } = data;
  
  console.log(`${from} rejecting friend request from ${rejectRequesterId}`);
  
  // Remove from pending requests
  const userRequests = friendRequests.get(from) || new Set();
  const requesterSentRequests = sentRequests.get(rejectRequesterId) || new Set();
  
  userRequests.delete(rejectRequesterId);
  requesterSentRequests.delete(from);
  
  // Notify requester if online
  const requester = connectedUsers.get(rejectRequesterId);
  if (requester && requester.ws.readyState === WebSocket.OPEN) {
    requester.ws.send(JSON.stringify({
      type: 'friendRequestRejected',
      rejectedBy: from
    }));
  }
  
  // Send updated pending requests
  sendPendingRequests(from);
  sendPendingRequests(rejectRequesterId);
};

const sendFriendRequestResult = (userId, success, message) => {
  const user = connectedUsers.get(userId);
  if (user && user.ws.readyState === WebSocket.OPEN) {
    user.ws.send(JSON.stringify({
      type: 'friendRequestResult',
      success: success,
      message: message
    }));
  }
};

const sendFriendsList = (userId) => {
  const user = connectedUsers.get(userId);
  if (!user || user.ws.readyState !== WebSocket.OPEN) return;
  
  const userFriends = friendships.get(userId) || new Set();
  const friendsList = Array.from(userFriends);
  
  console.log(`Sending friends list to ${user.username}:`, friendsList);
  
  user.ws.send(JSON.stringify({
    type: 'friendsList',
    friends: friendsList
  }));
};

const sendPendingRequests = (userId) => {
  const user = connectedUsers.get(userId);
  if (!user || user.ws.readyState !== WebSocket.OPEN) return;
  
  const incoming = Array.from(friendRequests.get(userId) || new Set());
  const sent = Array.from(sentRequests.get(userId) || new Set());
  const requestCount = incoming.length;
  
  console.log(`Sending pending requests to ${user.username}: incoming=${incoming.length}, sent=${sent.length}`);
  
  user.ws.send(JSON.stringify({
    type: 'pendingRequests',
    incoming: incoming,
    sent: sent,
    requestCount: requestCount
  }));
};

const broadcastFriendsListToFriends = (userId) => {
  const userFriends = friendships.get(userId) || new Set();
  
  userFriends.forEach(friendId => {
    sendFriendsList(friendId);
  });
};

const sendRoomList = (userId) => {
  const user = connectedUsers.get(userId);
  if (!user || user.ws.readyState !== WebSocket.OPEN) return;

  const userRooms = Array.from(user.rooms);
  
  user.ws.send(JSON.stringify({
    type: 'roomList',
    rooms: userRooms
  }));
};

module.exports = { initWebSocket };
