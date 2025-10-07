import express from "express";
import { ApolloServer } from "apollo-server-express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./utils/database";
import { typeDefs } from "./schema/typeDefs";
import { resolvers } from "./resolvers";
import { getUser } from "./middleware/auth";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN;

async function startServer() {
  // Connect to database
  await connectDB();

  // Create Express app
  const app = express();

  // Enable CORS
  // app.use(
  //   cors()
  // );

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      // Get user from token for HTTP requests
      return await getUser(req);
    },
    introspection: process.env.NODE_ENV !== "production",
  });

  // Start Apollo Server
  await server.start();

  // Apply Apollo GraphQL middleware
  server.applyMiddleware({
    app: app as any,
    path: "/graphql",
    cors: false, // CORS already handled by Express
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Create executable schema for WebSocket subscriptions
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  // Create WebSocket server for subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  // Use the schema with WebSocket server for subscriptions
  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx) => {
        // Get user from connection params for WebSocket connections
        const token = ctx.connectionParams?.authorization;
        if (token) {
          return await getUser({ headers: { authorization: token } });
        }
        return { isAuth: false };
      },
    },
    wsServer
  );

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      message: "GraphQL Chat Server is running",
      timestamp: new Date().toISOString(),
    });
  });

  // Root endpoint
  app.get("/", (req, res) => {
    res.json({
      message: "GraphQL Chat Server",
      graphql: `http://localhost:${PORT}${server.graphqlPath}`,
      health: `http://localhost:${PORT}/health`,
    });
  });

  // Start HTTP server
  httpServer.listen(PORT, () => {
    console.log(
      `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
    );
    console.log(
      `🔗 Subscriptions ready at ws://localhost:${PORT}${server.graphqlPath}`
    );
    console.log(`💊 Health check at http://localhost:${PORT}/health`);
  });

  // Graceful shutdown
  const gracefulShutdown = async () => {
    console.log("📦 Shutting down gracefully...");

    // Close WebSocket server
    serverCleanup.dispose();

    // Stop Apollo Server
    await server.stop();

    // Close HTTP server
    httpServer.close(() => {
      console.log("✅ Server closed");
      process.exit(0);
    });
  };

  process.on("SIGINT", gracefulShutdown);
  process.on("SIGTERM", gracefulShutdown);
}

// Start the server
startServer().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});
