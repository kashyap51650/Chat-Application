# Setup Guide

## Prerequisites

### 1. Install MongoDB

**On Ubuntu/Debian:**

```bash
# Import MongoDB public GPG Key
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

**On macOS:**

```bash
# Install via Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

**On Windows:**

1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Install using the installer
3. Start MongoDB as a service

### 2. Verify MongoDB Installation

```bash
# Check if MongoDB is running
mongosh

# In MongoDB shell, create a test database
use test
db.testCollection.insertOne({test: "Hello World"})
db.testCollection.find()
exit
```

## Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Setup environment:**

   ```bash
   cp .env.example .env
   # Edit .env file with your MongoDB URI and JWT secret
   ```

3. **Start MongoDB** (if not already running):

   ```bash
   sudo systemctl start mongod  # Linux
   brew services start mongodb/brew/mongodb-community  # macOS
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   ```

5. **Access GraphQL Playground:**
   Open http://localhost:4000/graphql in your browser

## Environment Variables

Create a `.env` file with the following variables:

```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://localhost:27017/graphql-chat
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

## Testing the API

### 1. Register a User

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
    }
  }
}
```

### 2. Login

```graphql
mutation LoginUser {
  login(input: { email: "test@example.com", password: "password123" }) {
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

### 3. Get Current User

Add the token to the HTTP headers:

```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN_HERE"
}
```

```graphql
query GetMe {
  me {
    id
    username
    email
    isOnline
    lastSeen
  }
}
```

### 4. Create a Chat Room

```graphql
mutation CreateRoom {
  createChatRoom(
    input: {
      name: "General Chat"
      description: "A place for general discussion"
      isPrivate: false
      participantIds: []
    }
  ) {
    id
    name
    description
    participants {
      username
    }
    createdBy {
      username
    }
  }
}
```

### 5. Send a Message

```graphql
mutation SendMessage {
  sendMessage(
    input: { content: "Hello, World!", chatRoomId: "CHAT_ROOM_ID_HERE" }
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

### 6. Subscribe to Messages

```graphql
subscription NewMessages {
  messageAdded(chatRoomId: "CHAT_ROOM_ID_HERE") {
    id
    content
    sender {
      username
    }
    createdAt
  }
}
```

## Troubleshooting

### MongoDB Connection Issues

1. **Check if MongoDB is running:**

   ```bash
   sudo systemctl status mongod
   ```

2. **Check MongoDB logs:**

   ```bash
   sudo journalctl -u mongod
   ```

3. **Restart MongoDB:**
   ```bash
   sudo systemctl restart mongod
   ```

### Port Already in Use

If port 4000 is already in use, change the PORT in your `.env` file:

```env
PORT=5000
```

### CORS Issues

Update the CORS_ORIGIN in your `.env` file to match your frontend URL:

```env
CORS_ORIGIN=http://localhost:3000
```

### JWT Secret

Make sure to use a strong JWT secret in production:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Production Deployment

1. **Build the application:**

   ```bash
   npm run build
   ```

2. **Set production environment variables:**

   ```env
   NODE_ENV=production
   PORT=4000
   MONGODB_URI=mongodb://your-production-db-uri
   JWT_SECRET=your-super-secure-production-secret
   CORS_ORIGIN=https://your-frontend-domain.com
   ```

3. **Start the production server:**
   ```bash
   npm start
   ```

## Security Considerations

1. **Change default JWT secret** in production
2. **Use HTTPS** in production
3. **Validate and sanitize** all user inputs
4. **Implement rate limiting** for API endpoints
5. **Use environment variables** for sensitive data
6. **Enable MongoDB authentication** in production
7. **Regularly update dependencies** for security patches
