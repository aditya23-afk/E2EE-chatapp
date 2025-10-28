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

    ws.on('message', (message) => {
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
              sessionId: sessionId,
              rooms: new Set() 
            });
            ws.userId = authenticatedUserId;
            ws.sessionId = sessionId;
            console.log(`Authenticated user ${authenticatedUsername} (${authenticatedUserId}) connected`);
            
            // Initialize friend data for user
            initializeFriendData(authenticatedUserId);
            
            // Send authentication success
            ws.send(JSON.stringify({
              type: 'authSuccess',
              userId: authenticatedUserId,
              username: authenticatedUsername
            }));
            
            // Send friends list and pending requests to the user
            broadcastFriendsList(authenticatedUserId);
            sendPendingRequests(authenticatedUserId);
            broadcastRoomList(authenticatedUserId);
            
            // Notify friends that this user is now online
            const userFriends = friendships.get(authenticatedUserId) || new Set();
            userFriends.forEach(friendId => {
              broadcastFriendsList(friendId);
            });
            break;

          case 'message':
            // Handle message routing
            if (data.roomKey) {
              // Send to room members
              const roomMembers = privateRooms.get(data.roomKey);
              if (roomMembers) {
                roomMembers.forEach((userId) => {
                  if (userId !== data.from) {
                    const user = connectedUsers.get(userId);
                    if (user && user.ws.readyState === WebSocket.OPEN) {
                      user.ws.send(JSON.stringify(data));
                    }
                  }
                });
              }
            } else if (data.to) {
              // Send to specific user - check if they are friends
              const senderFriends = friendships.get(data.from) || new Set();
              if (senderFriends.has(data.to)) {
                const targetUser = connectedUsers.get(data.to);
                if (targetUser && targetUser.ws.readyState === WebSocket.OPEN) {
                  targetUser.ws.send(JSON.stringify(data));
                }
              } else {
                // Not friends, send error back to sender
                const senderUser = connectedUsers.get(data.from);
                if (senderUser && senderUser.ws.readyState === WebSocket.OPEN) {
                  senderUser.ws.send(JSON.stringify({
                    type: 'messageError',
                    error: 'You can only send messages to friends',
                    targetUser: data.to
                  }));
                }
              }
            } else {
              // Broadcast to friends only (instead of all users)
              const senderFriends = friendships.get(data.from) || new Set();
              senderFriends.forEach((friendId) => {
                const friendUser = connectedUsers.get(friendId);
                if (friendUser && friendUser.ws.readyState === WebSocket.OPEN) {
                  friendUser.ws.send(JSON.stringify(data));
                }
              });
            }
            break;

          case 'joinRoom':
            // Handle room joining
            const { roomKey, userId: joinUserId, isCreating = false } = data;
            
            console.log(`Processing joinRoom request: userId=${joinUserId}, roomKey=${roomKey}`);
            
            try {
              // Validate room key
              if (!roomKey || roomKey.length !== 6 || !/^\d{6}$/.test(roomKey)) {
                console.log(`Invalid room key: ${roomKey}`);
                const user = connectedUsers.get(joinUserId);
                if (user && user.ws.readyState === WebSocket.OPEN) {
                  user.ws.send(JSON.stringify({
                    type: 'roomJoined',
                    roomKey: roomKey,
                    success: false,
                    error: 'Invalid room key format'
                  }));
                }
                break;
              }
              
              // Check if room exists for joining (not creating)
              const roomExists = privateRooms.has(roomKey);
              
              // Create room if it doesn't exist
              if (!roomExists) {
                privateRooms.set(roomKey, new Set());
                console.log(`Created new room: ${roomKey}`);
              }
              
              // Add user to room
              privateRooms.get(roomKey).add(joinUserId);
              
              // Add room to user's room list
              const user = connectedUsers.get(joinUserId);
              if (user) {
                user.rooms.add(roomKey);
              }
              
              console.log(`User ${joinUserId} successfully joined room ${roomKey}`);
              
              // Notify user of successful join
              if (user && user.ws.readyState === WebSocket.OPEN) {
                user.ws.send(JSON.stringify({
                  type: 'roomJoined',
                  roomKey: roomKey,
                  success: true,
                  isCreated: isCreating || !roomExists // True if creating or if room didn't exist before
                }));
              }
              
              // Broadcast updated room list to all users
              broadcastRoomListToAll();
            } catch (error) {
              console.error(`Error joining room: ${error.message}`);
              const user = connectedUsers.get(joinUserId);
              if (user && user.ws.readyState === WebSocket.OPEN) {
                user.ws.send(JSON.stringify({
                  type: 'roomJoined',
                  roomKey: roomKey,
                  success: false,
                  error: error.message
                }));
              }
            }
            break;

          case 'leaveRoom':
            // Handle room leaving
            const { roomKey: leaveRoomKey, userId: leaveUserId } = data;
            
            // Remove user from room
            if (privateRooms.has(leaveRoomKey)) {
              privateRooms.get(leaveRoomKey).delete(leaveUserId);
              
              // Remove empty rooms
              if (privateRooms.get(leaveRoomKey).size === 0) {
                privateRooms.delete(leaveRoomKey);
              }
            }
            
            // Remove room from user's room list
            const leaveUser = connectedUsers.get(leaveUserId);
            if (leaveUser) {
              leaveUser.rooms.delete(leaveRoomKey);
            }
            
            console.log(`User ${leaveUserId} left room ${leaveRoomKey}`);
            
            // Notify user of successful leave
            if (leaveUser && leaveUser.ws.readyState === WebSocket.OPEN) {
              leaveUser.ws.send(JSON.stringify({
                type: 'roomLeft',
                roomKey: leaveRoomKey
              }));
            }
            
            // Broadcast updated room list to all users
            broadcastRoomListToAll();
            break;

          case 'typing':
            // Handle typing indicators
            const { from, to, roomKey: typingRoomKey, isTyping } = data;
            
            if (typingRoomKey) {
              // Send to room members
              const roomMembers = privateRooms.get(typingRoomKey);
              if (roomMembers) {
                roomMembers.forEach((userId) => {
                  if (userId !== from) {
                    const user = connectedUsers.get(userId);
                    if (user && user.ws.readyState === WebSocket.OPEN) {
                      user.ws.send(JSON.stringify(data));
                    }
                  }
                });
              }
            } else if (to) {
              // Send to specific user - check if they are friends
              const senderFriends = friendships.get(from) || new Set();
              if (senderFriends.has(to)) {
                const targetUser = connectedUsers.get(to);
                if (targetUser && targetUser.ws.readyState === WebSocket.OPEN) {
                  targetUser.ws.send(JSON.stringify(data));
                }
              }
            } else {
              // Broadcast to friends only
              const senderFriends = friendships.get(from) || new Set();
              senderFriends.forEach((friendId) => {
                const friendUser = connectedUsers.get(friendId);
                if (friendUser && friendUser.ws.readyState === WebSocket.OPEN) {
                  friendUser.ws.send(JSON.stringify(data));
                }
              });
            }
            break;

          case 'sendFriendRequest':
            // Handle sending friend request
            const { targetUserId } = data;
            const senderId = data.from;
            
            // Initialize friend data structures if they don't exist
            if (!friendRequests.has(targetUserId)) {
              friendRequests.set(targetUserId, new Set());
            }
            if (!sentRequests.has(senderId)) {
              sentRequests.set(senderId, new Set());
            }
            if (!friendships.has(senderId)) {
              friendships.set(senderId, new Set());
            }
            if (!friendships.has(targetUserId)) {
              friendships.set(targetUserId, new Set());
            }
            
            // Check if already friends
            if (friendships.get(senderId).has(targetUserId)) {
              // Already friends, send error
              const senderUser = connectedUsers.get(senderId);
              if (senderUser && senderUser.ws.readyState === WebSocket.OPEN) {
                senderUser.ws.send(JSON.stringify({
                  type: 'friendRequestResult',
                  success: false,
                  error: 'Already friends with this user'
                }));
              }
              break;
            }
            
            // Check if request already sent
            if (sentRequests.get(senderId).has(targetUserId)) {
              // Request already sent, send error
              const senderUser = connectedUsers.get(senderId);
              if (senderUser && senderUser.ws.readyState === WebSocket.OPEN) {
                senderUser.ws.send(JSON.stringify({
                  type: 'friendRequestResult',
                  success: false,
                  error: 'Friend request already sent'
                }));
              }
              break;
            }
            
            // Add to pending requests
            friendRequests.get(targetUserId).add(senderId);
            sentRequests.get(senderId).add(targetUserId);
            
            // Notify sender of success
            const senderUser = connectedUsers.get(senderId);
            if (senderUser && senderUser.ws.readyState === WebSocket.OPEN) {
              senderUser.ws.send(JSON.stringify({
                type: 'friendRequestResult',
                success: true,
                message: 'Friend request sent successfully'
              }));
            }
            
            // Notify target user of new friend request
            const targetUser = connectedUsers.get(targetUserId);
            if (targetUser && targetUser.ws.readyState === WebSocket.OPEN) {
              targetUser.ws.send(JSON.stringify({
                type: 'newFriendRequest',
                from: senderId,
                requestCount: friendRequests.get(targetUserId).size
              }));
            }
            
            console.log(`Friend request sent from ${senderId} to ${targetUserId}`);
            break;

          case 'acceptFriendRequest':
            // Handle accepting friend request
            const { requesterId } = data;
            const accepterId = data.from;
            
            // Initialize if needed
            if (!friendRequests.has(accepterId)) {
              friendRequests.set(accepterId, new Set());
            }
            if (!sentRequests.has(requesterId)) {
              sentRequests.set(requesterId, new Set());
            }
            if (!friendships.has(accepterId)) {
              friendships.set(accepterId, new Set());
            }
            if (!friendships.has(requesterId)) {
              friendships.set(requesterId, new Set());
            }
            
            // Check if request exists
            if (!friendRequests.get(accepterId).has(requesterId)) {
              // No pending request, send error
              const accepterUser = connectedUsers.get(accepterId);
              if (accepterUser && accepterUser.ws.readyState === WebSocket.OPEN) {
                accepterUser.ws.send(JSON.stringify({
                  type: 'friendRequestResult',
                  success: false,
                  error: 'No pending friend request from this user'
                }));
              }
              break;
            }
            
            // Remove from pending requests
            friendRequests.get(accepterId).delete(requesterId);
            sentRequests.get(requesterId).delete(accepterId);
            
            // Add to friendships (both ways)
            friendships.get(accepterId).add(requesterId);
            friendships.get(requesterId).add(accepterId);
            
            // Notify both users
            const accepterUser = connectedUsers.get(accepterId);
            if (accepterUser && accepterUser.ws.readyState === WebSocket.OPEN) {
              accepterUser.ws.send(JSON.stringify({
                type: 'friendRequestAccepted',
                friendId: requesterId,
                requestCount: friendRequests.get(accepterId).size
              }));
              // Send updated friends list
              broadcastFriendsList(accepterId);
            }
            
            const requesterUser = connectedUsers.get(requesterId);
            if (requesterUser && requesterUser.ws.readyState === WebSocket.OPEN) {
              requesterUser.ws.send(JSON.stringify({
                type: 'friendRequestAccepted',
                friendId: accepterId
              }));
              // Send updated friends list
              broadcastFriendsList(requesterId);
            }
            
            console.log(`Friend request accepted: ${requesterId} and ${accepterId} are now friends`);
            break;

          case 'rejectFriendRequest':
            // Handle rejecting friend request
            const { rejectRequesterId } = data;
            const rejecterId = data.from;
            
            // Initialize if needed
            if (!friendRequests.has(rejecterId)) {
              friendRequests.set(rejecterId, new Set());
            }
            if (!sentRequests.has(rejectRequesterId)) {
              sentRequests.set(rejectRequesterId, new Set());
            }
            
            // Remove from pending requests
            friendRequests.get(rejecterId).delete(rejectRequesterId);
            sentRequests.get(rejectRequesterId).delete(rejectRequesterId);
            
            // Notify rejector
            const rejecterUser = connectedUsers.get(rejecterId);
            if (rejecterUser && rejecterUser.ws.readyState === WebSocket.OPEN) {
              rejecterUser.ws.send(JSON.stringify({
                type: 'friendRequestRejected',
                requesterId: rejectRequesterId,
                requestCount: friendRequests.get(rejecterId).size
              }));
            }
            
            // Optionally notify requester (or keep it silent)
            const rejectedRequesterUser = connectedUsers.get(rejectRequesterId);
            if (rejectedRequesterUser && rejectedRequesterUser.ws.readyState === WebSocket.OPEN) {
              rejectedRequesterUser.ws.send(JSON.stringify({
                type: 'friendRequestRejected',
                rejectedBy: rejecterId
              }));
            }
            
            console.log(`Friend request rejected: ${rejectRequesterId} -> ${rejecterId}`);
            break;

          case 'getFriendsList':
            // Send user's friends list
            const friendsUserId = data.from;
            broadcastFriendsList(friendsUserId);
            break;

          case 'getPendingRequests':
            // Send user's pending friend requests
            const requestUserId = data.from;
            sendPendingRequests(requestUserId);
            break;
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    ws.on('close', () => {
      // Remove user from connected users and rooms
      if (ws.userId) {
        const user = connectedUsers.get(ws.userId);
        if (user) {
          // Remove user from all rooms
          user.rooms.forEach((roomKey) => {
            if (privateRooms.has(roomKey)) {
              privateRooms.get(roomKey).delete(ws.userId);
              // Remove empty rooms
              if (privateRooms.get(roomKey).size === 0) {
                privateRooms.delete(roomKey);
              }
            }
          });
        }
        
        // Notify friends that this user went offline
        const userFriends = friendships.get(ws.userId) || new Set();
        userFriends.forEach(friendId => {
          broadcastFriendsList(friendId);
        });
        
        connectedUsers.delete(ws.userId);
        console.log(`User ${ws.userId} disconnected`);
        broadcastRoomListToAll();
      }
    });
  });
};

const broadcastUserList = () => {
  const userList = Array.from(connectedUsers.keys());
  const message = JSON.stringify({
    type: 'userList',
    users: userList
  });

  connectedUsers.forEach((user) => {
    if (user.ws.readyState === WebSocket.OPEN) {
      user.ws.send(message);
    }
  });
};

const broadcastRoomList = (userId) => {
  const user = connectedUsers.get(userId);
  if (!user || user.ws.readyState !== WebSocket.OPEN) return;

  const userRooms = Array.from(user.rooms).map(roomKey => ({
    key: roomKey,
    memberCount: privateRooms.get(roomKey)?.size || 0
  }));

  user.ws.send(JSON.stringify({
    type: 'roomList',
    rooms: userRooms
  }));
};

const broadcastRoomListToAll = () => {
  connectedUsers.forEach((user) => {
    broadcastRoomList(user.userId);
  });
};

// Friend system helper functions
const broadcastFriendsList = (userId) => {
  const user = connectedUsers.get(userId);
  if (!user || user.ws.readyState !== WebSocket.OPEN) return;
  
  // Get user's friends who are currently online
  const userFriends = friendships.get(userId) || new Set();
  const onlineFriends = [];
  
  userFriends.forEach(friendId => {
    if (connectedUsers.has(friendId)) {
      onlineFriends.push(friendId);
    }
  });
  
  user.ws.send(JSON.stringify({
    type: 'friendsList',
    friends: onlineFriends
  }));
};

const sendPendingRequests = (userId) => {
  const user = connectedUsers.get(userId);
  if (!user || user.ws.readyState !== WebSocket.OPEN) return;
  
  const pendingRequests = friendRequests.get(userId) || new Set();
  const sentRequestsSet = sentRequests.get(userId) || new Set();
  
  user.ws.send(JSON.stringify({
    type: 'pendingRequests',
    incoming: Array.from(pendingRequests),
    sent: Array.from(sentRequestsSet),
    requestCount: pendingRequests.size
  }));
};

// Initialize friend data for new user
const initializeFriendData = (userId) => {
  if (!friendships.has(userId)) {
    friendships.set(userId, new Set());
  }
  if (!friendRequests.has(userId)) {
    friendRequests.set(userId, new Set());
  }
  if (!sentRequests.has(userId)) {
    sentRequests.set(userId, new Set());
  }
};

module.exports = {
  initWebSocket,
};