import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AuthPage from "./components/auth/AuthPage";
import ChatApp from "./components/chat/ChatApp";
import LoadingSpinner from "./components/ui/LoadingSpinner";

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  // Show loading while checking authentication
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/auth"
        element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />}
      />
      <Route
        path="/"
        element={
          isAuthenticated ? <ChatApp /> : <Navigate to="/auth" replace />
        }
      />
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/" : "/auth"} replace />}
      />
    </Routes>
  );
};

export default AppRoutes;
