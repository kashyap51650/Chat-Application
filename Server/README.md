# GraphQL Chat Server

A real-time chat application built with Node.js, Express, GraphQL, TypeScript, and MongoDB.

## Features

- 🔐 **Authentication**: JWT-based user authentication
- 💬 **Real-time Chat**: WebSocket subscriptions for instant messaging
- 🏠 **Chat Rooms**: Create and join public/private chat rooms
- 👥 **User Management**: User registration, login, and online status
- ✏️ **Message Management**: Send, edit, and delete messages
- 🔍 **GraphQL API**: Full GraphQL API with queries, mutations, and subscriptions
- 📱 **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Backend**: Node.js, Express.js
- **GraphQL**: Apollo Server Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: WebSocket subscriptions via graphql-ws
- **Language**: TypeScript
- **Validation**: GraphQL schema validation

## Prerequisites

- Node.js (v18.0.0 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd graphql-chat-server
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment setup:**

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your configuration:

   ```
   NODE_ENV=development
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/graphql-chat
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Start MongoDB:**
   Make sure MongoDB is running on your system.

## Development

**Start the development server:**

```bash
npm run dev
```

**Build for production:**

```bash
npm run build
```

**Start production server:**

```bash
npm start
```

## GraphQL Schema

### Queries

- `me`: Get current user information
- `users`: Get all users
- `user(id)`: Get user by ID
- `myChatRooms`: Get user's chat rooms
- `chatRoom(id)`: Get chat room details
- `messages(chatRoomId, limit, offset)`: Get messages from a chat room

### Mutations

- `register(input)`: Register a new user
- `login(input)`: Login user
- `createChatRoom(input)`: Create a new chat room
- `joinChatRoom(chatRoomId)`: Join a chat room
- `leaveChatRoom(chatRoomId)`: Leave a chat room
- `sendMessage(input)`: Send a message
- `editMessage(input)`: Edit a message
- `deleteMessage(messageId)`: Delete a message
- `updateOnlineStatus(isOnline)`: Update user online status

### Subscriptions

- `messageAdded(chatRoomId)`: Listen for new messages
- `messageEdited(chatRoomId)`: Listen for message edits
- `messageDeleted(chatRoomId)`: Listen for message deletions
- `userStatusChanged`: Listen for user status changes

## API Endpoints

- **GraphQL Playground**: `http://localhost:4000/graphql`
- **Health Check**: `http://localhost:4000/health`
- **WebSocket**: `ws://localhost:4000/graphql`

## Example Usage

### 1. Register a User

```graphql
mutation RegisterUser {
  register(
    input: {
      username: "john_doe"
      email: "john@example.com"
      password: "password123"
    }
  ) {
    token
    user {
      id
      username
      email
    }
  }
}
```

### 2. Login

```graphql
mutation LoginUser {
  login(input: { email: "john@example.com", password: "password123" }) {
    token
    user {
      id
      username
      email
      isOnline
    }
  }
}
```

### 3. Create a Chat Room

```graphql
mutation CreateChatRoom {
  createChatRoom(
    input: {
      name: "General Discussion"
      description: "A place for general conversation"
      isPrivate: false
      participantIds: ["user_id_1", "user_id_2"]
    }
  ) {
    id
    name
    participants {
      id
      username
    }
  }
}
```

### 4. Send a Message

```graphql
mutation SendMessage {
  sendMessage(
    input: {
      content: "Hello everyone!"
      chatRoomId: "chat_room_id"
      messageType: text
    }
  ) {
    id
    content
    sender {
      username
    }
    createdAt
  }
}
```

### 5. Subscribe to Messages

```graphql
subscription MessageAdded {
  messageAdded(chatRoomId: "chat_room_id") {
    id
    content
    sender {
      username
    }
    createdAt
  }
}
```

## Authentication

Include the JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

For WebSocket connections, pass the token in connection parameters:

```javascript
const wsClient = createClient({
  url: "ws://localhost:4000/graphql",
  connectionParams: {
    authorization: "Bearer YOUR_JWT_TOKEN",
  },
});
```

## Project Structure

```
src/
├── index.ts              # Main server file
├── types/                # TypeScript type definitions
│   └── index.ts
├── models/               # MongoDB models
│   ├── User.ts
│   ├── ChatRoom.ts
│   ├── Message.ts
│   └── index.ts
├── schema/               # GraphQL schema
│   └── typeDefs.ts
├── resolvers/            # GraphQL resolvers
│   ├── userResolvers.ts
│   ├── chatRoomResolvers.ts
│   ├── messageResolvers.ts
│   ├── scalarResolvers.ts
│   └── index.ts
├── middleware/           # Custom middleware
│   └── auth.ts
└── utils/                # Utility functions
    ├── auth.ts
    └── database.ts
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run clean` - Clean build directory
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
