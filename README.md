# 🔐 E2EE ChatApp

A modern, real-time chat application with **End-to-End Encryption (E2EE)**, premium UI design, and advanced social features. Built with React and Node.js, featuring a sophisticated friend management system and private room functionality with military-grade security.

## ✨ Features

### 🔒 **Security & Authentication**
- **User Registration & Login System** - Secure account creation with password hashing
- **Session Management** - 30-day session persistence with automatic cleanup
- **File-based Database** - JSON storage for users and sessions
- **Secure WebSocket Authentication** - Session-based connection validation

### 👥 **Friend Management System**
- **Friend Requests** - Send, accept, and reject friend requests
- **Real-time Notifications** - Red dot indicators for pending requests
- **Friends-only Messaging** - Enhanced security by restricting communication to friends
- **Friend List Management** - View and manage your connections

### 🏠 **Private Room System**
- **6-digit Room Keys** - Create secure private chat rooms
- **Room Creation Modal** - Beautiful celebration animations for new rooms
- **Room Key Display** - Copy-to-clipboard functionality with visual feedback
- **Join Room Interface** - Easy room joining with key validation
- **Room Persistence** - Rooms remain active across sessions

### 💬 **Advanced Messaging**
- **Real-time Communication** - WebSocket-powered instant messaging
- **Message Persistence** - Per-contact and per-room message history
- **localStorage Integration** - Messages persist across browser sessions
- **Typing Indicators** - See when friends are typing
- **Message Routing** - Smart message delivery to correct contacts/rooms

### 🎨 **Premium UI/UX Design**
- **Glassmorphism Effects** - Modern glass-like modal designs
- **Multiple Themes** - Light, Dark, and Cyberpunk themes
- **Premium Form Fields** - Enhanced inputs with focus animations
- **Smooth Animations** - CSS transitions and micro-interactions
- **Responsive Design** - Mobile-friendly interface
- **Premium Modal System** - Consistent design language across all modals

### 🔧 **User Interface Components**
- **Enhanced UserMenu** - Dropdown menu with profile information
- **Settings Modal** - Theme selection and preferences management
- **Status Bar** - Connection status, user count, and encryption indicators
- **Contact List** - Friends and rooms with online indicators
- **Chat Window** - Message display with timestamps and user avatars
- **Sound Effects** - Audio feedback for notifications and actions

### 🎯 **Advanced Features**
- **Random Username Generator** - Quick account creation with fun usernames
- **ESC Key Support** - Close modals with keyboard shortcuts
- **Backdrop Click-to-Close** - Intuitive modal interactions
- **Loading States** - Visual feedback for all async operations
- **Error Handling** - Comprehensive error messages and validation
- **Auto-reconnection** - Automatic WebSocket reconnection on disconnect

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/aditya23-afk/E2EE-ChatApp.git
   cd E2EE-ChatApp
   ```

2. **Install server dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies:**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. **Start the server:**
   ```bash
   cd server
   npm start
   ```
   Server will run on `http://localhost:3001`

2. **Start the client (in a new terminal):**
   ```bash
   cd client
   npm start
   ```
   Client will run on `http://localhost:3000`

## 📱 How to Use

### Getting Started
1. **Register/Login** - Create an account or sign in with existing credentials
2. **Add Friends** - Send friend requests to other users by username
3. **Accept Requests** - Manage incoming friend requests from the Friends modal
4. **Start Chatting** - Message your friends in real-time

### Private Rooms
1. **Create Room** - Generate a 6-digit room key for private conversations
2. **Share Key** - Copy and share the room key with friends
3. **Join Room** - Enter a room key to join existing private rooms
4. **Room Chat** - Enjoy secure group conversations

### Customization
1. **Change Themes** - Switch between Light, Dark, and Cyberpunk themes
2. **Adjust Settings** - Configure animations, sounds, and display preferences
3. **Profile Management** - Update your profile through the user menu

## 🛠️ Technology Stack

### Frontend
- **React 17** - Modern UI library with hooks
- **CSS3** - Advanced styling with CSS variables and animations
- **WebSocket Client** - Real-time communication
- **localStorage** - Client-side data persistence

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web application framework
- **WebSocket (ws)** - Real-time bidirectional communication
- **File System** - JSON-based data storage
- **Body Parser** - Request parsing middleware

## 📁 Project Structure

```
E2EE-ChatApp/
├── server/
│   ├── src/
│   │   ├── server.js          # Main server file
│   │   ├── websocket.js       # WebSocket handling
│   │   └── auth.js            # Authentication logic
│   ├── data/                  # Auto-generated data storage
│   └── package.json
├── client/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── api/              # API communication
│   │   ├── utils/            # Utility functions
│   │   ├── styles.css        # Main styles
│   │   └── styles-premium.css # Premium UI styles
│   └── package.json
└── README.md
```

## 🎨 Themes

### Light Theme
- Clean, modern interface with soft shadows
- Perfect for daytime use

### Dark Theme
- Easy on the eyes with dark backgrounds
- Great for low-light environments

### Cyberpunk Theme
- Futuristic neon aesthetics
- Glowing effects and vibrant colors

## 🔐 Security Features

- **Password Hashing** - Secure password storage
- **Session Tokens** - Secure authentication tokens
- **Input Validation** - Comprehensive data validation
- **XSS Protection** - Safe message rendering
- **CORS Configuration** - Secure cross-origin requests

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Developer

**Aditya Tripathi**
- GitHub: [@aditya23-afk](https://github.com/aditya23-afk)
- Email: adityatripathi584@gmail.com

---

## 🚀 Future Enhancements

- File sharing capabilities
- Voice/video calling
- Message encryption
- Push notifications
- Mobile app development
- Group chat administration
- Message search functionality
- User status customization

---

*Built with ❤️ using React and Node.js*