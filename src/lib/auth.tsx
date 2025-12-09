// Authentication context and utilities
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

interface User {
  id: string;
  email: string;
  role: 'student' | 'admin';
  applicationId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'student' | 'admin') => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role: 'student' | 'admin'): Promise<boolean> => {
    try {
      if (role === 'admin') {
        // Admin login - check against hardcoded credentials
        if (email === 'nckcollageadmin@gmail.com' && password === 'nckbcs@123') {
          const adminUser: User = {
            id: 'admin',
            email: email,
            role: 'admin'
          };
          setUser(adminUser);
          localStorage.setItem('user', JSON.stringify(adminUser));
          return true;
        }
        return false;
      } else {
        // Student login - application_id and password
        const { data, error } = await supabase
          .from('admissions')
          .select('id, email, application_id, password_hash')
          .eq('application_id', email)
          .single();

        if (error || !data) {
          return false;
        }

        // Simple password check (in real app, use bcrypt)
        if (data.password_hash === password) {
          const studentUser: User = {
            id: data.id,
            email: data.email,
            role: 'student',
            applicationId: data.application_id
          };
          setUser(studentUser);
          localStorage.setItem('user', JSON.stringify(studentUser));
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
