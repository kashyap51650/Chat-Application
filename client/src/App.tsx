import React from "react";
import { ApolloProvider } from "@apollo/client/react";
import { BrowserRouter as Router } from "react-router-dom";
import { apolloClient } from "./lib/apollo";
import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import AppRoutes from "./AppRoutes";
import PWAInstallPrompt from "./components/ui/PWAInstallPrompt";
import "./index.css";

const App: React.FC = () => {
  return (
    <ApolloProvider client={apolloClient}>
      <Router>
        <AuthProvider>
          <ChatProvider>
            <div className="App min-h-screen bg-gray-50">
              <PWAInstallPrompt />
              <AppRoutes />
            </div>
          </ChatProvider>
        </AuthProvider>
      </Router>
    </ApolloProvider>
  );
};

export default App;
