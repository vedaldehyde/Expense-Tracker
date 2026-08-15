import React, { useState, useEffect, useRef } from "react";
import Login from "./pages/Login";
import Main from "./pages/Main";
import LandingPage from "./pages/LandingPage";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes idle timeout

function AppRoutes() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const idleTimerRef = useRef(null);

  // Determine initial authentication state based on keepLoggedIn preference
  useEffect(() => {
    const keepLoggedIn = localStorage.getItem('keepLoggedIn') === 'true';
    const sessionActive = sessionStorage.getItem('sessionActive') === 'true';
    const storedToken = localStorage.getItem('token');

    if (storedToken) {
      if (keepLoggedIn || sessionActive) {
        setIsAuthenticated(true);
      } else {
        // User did not select 'Keep me logged in' and closed session -> clear token and start at Landing Page
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Idle Inactivity Monitoring (15 minutes)
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleUserActivity = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

      idleTimerRef.current = setTimeout(() => {
        // Expire session after 15 minutes of no activity
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('sessionActive');
        sessionStorage.setItem('sessionExpiredMessage', 'Your session expired due to 15 minutes of inactivity. Please sign in again.');
        setIsAuthenticated(false);
        window.location.href = '/login';
      }, IDLE_TIMEOUT_MS);
    };

    // Attach activity listeners
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    events.forEach(evt => window.addEventListener(evt, handleUserActivity));

    // Initialize timer
    handleUserActivity();

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      events.forEach(evt => window.removeEventListener(evt, handleUserActivity));
    };
  }, [isAuthenticated]);

  return (
    <Routes>
      <Route path="/welcome" element={<LandingPage />} />
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
      />
      <Route 
        path="/*" 
        element={isAuthenticated ? <Main /> : <LandingPage />} 
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
