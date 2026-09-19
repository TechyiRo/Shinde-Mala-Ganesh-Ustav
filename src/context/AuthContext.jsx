import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const USERS = {
  admin: {
    username: 'admin',
    password: 'ganpati2026',
    role: 'admin',
    displayName: 'खजिनदार / Admin'
  },
  member: {
    username: 'member',
    password: 'member123',
    role: 'member',
    displayName: 'कार्यकारी सदस्य / Committee Member'
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('mandal_auth');
      return saved ? JSON.parse(saved) : USERS.admin; // Default pre-logged in as admin for smooth initial experience
    } catch {
      return USERS.admin;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('mandal_auth', JSON.stringify(user));
    } else {
      localStorage.removeItem('mandal_auth');
    }
  }, [user]);

  const login = (username, password) => {
    const trimmedUser = username.trim().toLowerCase();
    const account = USERS[trimmedUser];

    if (account && account.password === password) {
      setUser({
        username: account.username,
        role: account.role,
        displayName: account.displayName
      });
      return { success: true };
    }
    return { success: false, error: 'invalidCredentials' };
  };

  const logout = () => {
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';
  const isMember = user?.role === 'member';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isMember }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
