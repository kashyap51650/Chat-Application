# GraphQL Testing Guide

This guide will walk you through testing all the queries, mutations, and subscriptions in your GraphQL Chat Application.

## Prerequisites

### Option 1: With MongoDB (Recommended)

1. **Install and start MongoDB:**

   ```bash
   # Ubuntu/Debian
   sudo systemctl start mongod

   # macOS
   brew services start mongodb/brew/mongodb-community

   # Verify MongoDB is running
   mongosh --eval "db.adminCommand('ismaster')"
   ```

### Option 2: Without MongoDB (For Testing Schema Only)

You can test the GraphQL schema structure without MongoDB by modifying the connection temporarily.

## Testing Methods

### Method 1: GraphQL Playground (Browser-based)

1. Start the server: `npm run dev`
2. Open: http://localhost:4000/graphql
3. Use the interactive playground

### Method 2: curl Commands (Terminal-based)It seems the server is trying to connect to MongoDB. Let me create a comprehensive testing guide and also provide instructions for testing without a full MongoDB setup:

Test via command line using curl

### Method 3: Postman/Insomnia

Import the GraphQL endpoint: http://localhost:4000/graphql

## Step-by-Step Testing

### 1. Test Server Health

First, verify the server is running:

```bash
curl http://localhost:4000/health
```

Expected response:

```json
{
  "status": "ok",
  "message": "GraphQL Chat Server is running",
  "timestamp": "2024-..."
}
```

### 2. Test User Registration

**GraphQL Playground:**

```graphql
mutation RegisterUser {
  register(
    input: {
      username: "testuser"
      email: "test@example.com"
      password: "password123"
    }
  ) {
    token
    user {
      id
      username
      email
      isOnline
      createdAt
    }
  }
}
```

**curl Command:**

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation RegisterUser { register(input: { username: \"testuser\", email: \"test@example.com\", password: \"password123\" }) { token user { id username email isOnline createdAt } } }"
  }'
```

**Expected Response:**

```json
{
  "data": {
    "register": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "507f1f77bcf86cd799439011",
        "username": "testuser",
        "email": "test@example.com",
        "isOnline": false,
        "createdAt": "2024-..."
      }
    }
  }
}
```

### 3. Test User Login

**GraphQL:**

```graphql
mutation LoginUser {
  login(input: { email: "test@example.com", password: "password123" }) {
    token
    user {
      id
      username
      email
      isOnline
      lastSeen
    }
  }
}
```

**Save the token from the response** - you'll need it for authenticated requests!

### 4. Test Authenticated Query (Get Current User)

**Add Authorization Header in GraphQL Playground:**

```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN_HERE"
}
```

**GraphQL Query:**

```graphql
query GetMe {
  me {
    id
    username
    email
    isOnline
    lastSeen
    createdAt
  }
}
```

**curl with Authentication:**

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "query": "query GetMe { me { id username email isOnline lastSeen createdAt } }"
  }'
```

### 5. Test Chat Room Creation

**GraphQL:**

```graphql
mutation CreateChatRoom {
  createChatRoom(
    input: {
      name: "General Discussion"
      description: "A place for general conversation"
      isPrivate: false
      participantIds: []
    }
  ) {
    id
    name
    description
    isPrivate
    participants {
      id
      username
    }
    admins {
      username
    }
    createdBy {
      username
    }
    createdAt
  }
}
```

### 6. Test Get User's Chat Rooms

**GraphQL:**

```graphql
query MyChatRooms {
  myChatRooms {
    id
    name
    description
    isPrivate
    participants {
      username
    }
    lastMessage {
      content
      sender {
        username
      }
      createdAt
    }
    createdAt
  }
}
```

### 7. Test Send Message

**GraphQL:**

```graphql
mutation SendMessage {
  sendMessage(
    input: {
      content: "Hello, World! This is my first message."
      chatRoomId: "YOUR_CHAT_ROOM_ID_HERE"
    }
  ) {
    id
    content
    sender {
      username
    }
    chatRoom {
      name
    }
    messageType
    isEdited
    createdAt
  }
}
```

### 8. Test Get Messages

**GraphQL:**

```graphql
query GetMessages {
  messages(chatRoomId: "YOUR_CHAT_ROOM_ID_HERE", limit: 10) {
    id
    content
    sender {
      username
    }
    messageType
    isEdited
    createdAt
  }
}
```

### 9. Test Message Editing

**GraphQL:**

```graphql
mutation EditMessage {
  editMessage(
    input: {
      messageId: "YOUR_MESSAGE_ID_HERE"
      content: "Hello, World! This message has been edited."
    }
  ) {
    id
    content
    isEdited
    editedAt
    sender {
      username
    }
    createdAt
  }
}
```

### 10. Test Real-time Subscriptions

**Important:** Subscriptions require WebSocket connection. Test these in GraphQL Playground or use a WebSocket client.

#### Message Subscription

**GraphQL Subscription:**

```graphql
subscription MessageAdded {
  messageAdded(chatRoomId: "YOUR_CHAT_ROOM_ID_HERE") {
    id
    content
    sender {
      username
    }
    createdAt
  }
}
```

**Testing Steps:**

1. Open two browser tabs with GraphQL Playground
2. In Tab 1: Start the subscription above
3. In Tab 2: Send a message using the SendMessage mutation
4. Tab 1 should receive the new message in real-time

#### Message Edit Subscription

**GraphQL:**

```graphql
subscription MessageEdited {
  messageEdited(chatRoomId: "YOUR_CHAT_ROOM_ID_HERE") {
    id
    content
    isEdited
    editedAt
    sender {
      username
    }
  }
}
```

#### Message Delete Subscription

**GraphQL:**

```graphql
subscription MessageDeleted {
  messageDeleted(chatRoomId: "YOUR_CHAT_ROOM_ID_HERE")
}
```

## Testing Multiple Users

To test the real-time features properly:

1. **Register multiple users:**

   ```graphql
   # User 1
   mutation RegisterUser1 {
     register(
       input: {
         username: "alice"
         email: "alice@example.com"
         password: "password123"
       }
     ) {
       token
       user {
         id
         username
       }
     }
   }

   # User 2
   mutation RegisterUser2 {
     register(
       input: {
         username: "bob"
         email: "bob@example.com"
         password: "password123"
       }
     ) {
       token
       user {
         id
         username
       }
     }
   }
   ```

2. **Create a chat room with User 1**
3. **Add User 2 to the chat room**
4. **Start subscriptions with both users**
5. **Send messages from both users**

## WebSocket Testing (Advanced)

For testing WebSocket subscriptions programmatically:

### JavaScript Client Example

```javascript
import { createClient } from "graphql-ws";

const client = createClient({
  url: "ws://localhost:4000/graphql",
  connectionParams: {
    authorization: "Bearer YOUR_JWT_TOKEN_HERE",
  },
});

// Subscribe to messages
const subscription = client.iterate({
  query: `
    subscription {
      messageAdded(chatRoomId: "YOUR_CHAT_ROOM_ID") {
        id
        content
        sender {
          username
        }
        createdAt
      }
    }
  `,
});

for await (const message of subscription) {
  console.log("New message:", message.data.messageAdded);
}
```

## Troubleshooting

### MongoDB Not Running

```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# View MongoDB logs
sudo journalctl -u mongod -f
```

### Port Already in Use

```bash
# Find what's using port 4000
sudo lsof -i :4000

# Kill the process (replace PID)
kill -9 PID
```

### GraphQL Playground Not Loading

1. Check server logs for errors
2. Verify server is running on http://localhost:4000
3. Check firewall settings
4. Try accessing http://localhost:4000/health first

### Token Expired

JWT tokens expire after 7 days by default. Re-login to get a new token:

```graphql
mutation RefreshLogin {
  login(input: { email: "your@email.com", password: "yourpassword" }) {
    token
    user {
      id
      username
    }
  }
}
```

## Quick Test Script

Save this as `test-api.sh` for quick testing:

```bash
#!/bin/bash

# Test health endpoint
echo "Testing health endpoint..."
curl -s http://localhost:4000/health | jq

# Test GraphQL endpoint
echo "Testing GraphQL endpoint..."
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { __schema { types { name } } }"}' | jq

echo "GraphQL endpoint is working!"
```

Make it executable and run:

```bash
chmod +x test-api.sh
./test-api.sh
```
