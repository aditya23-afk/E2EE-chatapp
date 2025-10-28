class WebSocketClient {
    constructor() {
        this.ws = null;
        this.userId = null;
        this.onMessageReceived = null;
        this.onUserListUpdated = null; // Keep for backward compatibility, but will receive friends list
        this.onRoomListUpdated = null;
        this.onRoomJoined = null;
        this.onRoomLeft = null;
        this.onTypingUpdate = null;

        // Friend system callbacks
        this.onFriendsListUpdated = null;
        this.onFriendRequestReceived = null;
        this.onFriendRequestResult = null;
        this.onPendingRequestsUpdated = null;
        this.onFriendRequestAccepted = null;
        this.onMessageError = null;
    }

    connect(userId) {
        this.userId = userId;
        this.ws = new WebSocket('ws://localhost:3001');

        this.ws.onopen = () => {
            console.log('Connected to WebSocket server');
            // Register user with server
            this.send({
                type: 'register',
                userId: this.userId
            });
        };

        this.ws.onmessage = (event) => {
            console.log('Received WebSocket message:', event.data);
            const data = JSON.parse(event.data);

            if (data.type === 'message' && this.onMessageReceived) {
                this.onMessageReceived(data);
            } else if (data.type === 'userList' && this.onUserListUpdated) {
                this.onUserListUpdated(data.users);
            } else if (data.type === 'friendsList' && this.onFriendsListUpdated) {
                this.onFriendsListUpdated(data.friends);
                // Also call onUserListUpdated for backward compatibility
                if (this.onUserListUpdated) {
                    this.onUserListUpdated(data.friends);
                }
            } else if (data.type === 'roomList' && this.onRoomListUpdated) {
                this.onRoomListUpdated(data.rooms);
            } else if (data.type === 'roomJoined' && this.onRoomJoined) {
                console.log(`Room joined response:`, data);
                this.onRoomJoined(data.roomKey, data.success, data.isCreated);
            } else if (data.type === 'roomLeft' && this.onRoomLeft) {
                this.onRoomLeft(data.roomKey);
            } else if (data.type === 'typing' && this.onTypingUpdate) {
                this.onTypingUpdate(data);
            } else if (data.type === 'newFriendRequest' && this.onFriendRequestReceived) {
                this.onFriendRequestReceived(data.from, data.requestCount);
            } else if (data.type === 'friendRequestResult' && this.onFriendRequestResult) {
                this.onFriendRequestResult(data.success, data.message || data.error);
            } else if (data.type === 'pendingRequests' && this.onPendingRequestsUpdated) {
                this.onPendingRequestsUpdated(data.incoming, data.sent, data.requestCount);
            } else if (data.type === 'friendRequestAccepted' && this.onFriendRequestAccepted) {
                this.onFriendRequestAccepted(data.friendId, data.requestCount);
            } else if (data.type === 'friendRequestRejected' && this.onFriendRequestResult) {
                this.onFriendRequestResult(false, 'Friend request was rejected');
            } else if (data.type === 'messageError' && this.onMessageError) {
                this.onMessageError(data.error, data.targetUser);
            } else {
                console.log('Unhandled message type:', data.type, data);
            }
        };

        this.ws.onclose = () => {
            console.log('Disconnected from WebSocket server');
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log('Sending WebSocket message:', data);
            this.ws.send(JSON.stringify(data));
        } else {
            console.error('WebSocket not connected. ReadyState:', this.ws?.readyState);
        }
    }

    sendMessage(message, targetUserId = null, roomKey = null) {
        this.send({
            type: 'message',
            from: this.userId,
            to: targetUserId, // null means broadcast to all
            roomKey: roomKey, // room key for private rooms
            message: message,
            timestamp: new Date().toISOString()
        });
    }

    sendTypingStatus(isTyping, targetUserId = null, roomKey = null) {
        this.send({
            type: 'typing',
            from: this.userId,
            to: targetUserId,
            roomKey: roomKey,
            isTyping: isTyping,
            timestamp: new Date().toISOString()
        });
    }

    joinRoom(roomKey, isCreating = false) {
        console.log(`Attempting to ${isCreating ? 'create' : 'join'} room: ${roomKey}`);
        console.log('WebSocket state:', this.ws?.readyState);
        console.log('User ID:', this.userId);

        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.error('WebSocket not connected! State:', this.ws?.readyState);
            return;
        }

        this.send({
            type: 'joinRoom',
            userId: this.userId,
            roomKey: roomKey,
            isCreating: isCreating
        });
    }

    leaveRoom(roomKey) {
        this.send({
            type: 'leaveRoom',
            userId: this.userId,
            roomKey: roomKey
        });
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }

    // Friend system methods
    sendFriendRequest(targetUserId) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.error('WebSocket not connected! State:', this.ws?.readyState);
            return;
        }

        this.send({
            type: 'sendFriendRequest',
            from: this.userId,
            targetUserId: targetUserId
        });
    }

    acceptFriendRequest(requesterId) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.error('WebSocket not connected! State:', this.ws?.readyState);
            return;
        }

        this.send({
            type: 'acceptFriendRequest',
            from: this.userId,
            requesterId: requesterId
        });
    }

    rejectFriendRequest(requesterId) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.error('WebSocket not connected! State:', this.ws?.readyState);
            return;
        }

        this.send({
            type: 'rejectFriendRequest',
            from: this.userId,
            rejectRequesterId: requesterId
        });
    }

    getFriendsList() {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.error('WebSocket not connected! State:', this.ws?.readyState);
            return;
        }

        this.send({
            type: 'getFriendsList',
            from: this.userId
        });
    }

    getPendingRequests() {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.error('WebSocket not connected! State:', this.ws?.readyState);
            return;
        }

        this.send({
            type: 'getPendingRequests',
            from: this.userId
        });
    }
}

export default WebSocketClient;