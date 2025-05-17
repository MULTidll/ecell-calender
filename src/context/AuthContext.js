"use client";

import React, { useState, useEffect, createContext } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdmin = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/validate-token', { method: 'POST' });
      const data = await res.json();
      setIsAdmin(data.valid);
    } catch {
      setIsAdmin(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAdmin();
  }, []);

  const login = async (username, password) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.success) {
      await checkAdmin();
      window.location.reload();
      return true;
    }
    return false;
  };

  const logout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    await checkAdmin();
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}