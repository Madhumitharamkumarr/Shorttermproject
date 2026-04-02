import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Reads students directly from localStorage (set by DataContext).
 * This avoids a circular dependency between AuthContext and DataContext.
 */
const getStudents = () => {
  try {
    const saved = localStorage.getItem('sc_students');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

/**
 * Reads registered extra accounts (students who signed up manually).
 */
const getAccounts = () => {
  try {
    const saved = localStorage.getItem('sc_accounts');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveAccounts = (accounts) =>
  localStorage.setItem('sc_accounts', JSON.stringify(accounts));

// ─── Provider ────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('userInfo');
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const trimEmail = email.trim().toLowerCase();
    const trimPass  = password.trim();

    // 1. Admin shortcut
    if (trimEmail === 'admin@prepnplace.com' && trimPass === 'admin123') {
      const data = { _id: 'admin1', email: trimEmail, role: 'admin', name: 'Administrator' };
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    }

    // 2. Check pre-loaded students: email matches AND roll number == password
    const students = getStudents();
    const match = students.find(
      (s) => s.email?.trim().toLowerCase() === trimEmail
    );

    if (match) {
      // Password = their roll number (case-insensitive)
      if (match.id?.toUpperCase() === trimPass.toUpperCase()) {
        const data = {
          _id:   match.id,
          email: match.email,
          role:  'student',
          name:  match.name,
        };
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
        return { success: true };
      } else {
        return { success: false, message: 'Incorrect password. Use your Roll Number as password.' };
      }
    }

    // 3. Check manually registered accounts (from Signup page)
    const accounts = getAccounts();
    const account  = accounts.find(
      (a) => a.email?.trim().toLowerCase() === trimEmail
    );

    if (account) {
      if (account.password === trimPass) {
        const data = {
          _id:   account._id,
          email: account.email,
          role:  'student',
          name:  account.name,
        };
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
        return { success: true };
      } else {
        return { success: false, message: 'Incorrect password.' };
      }
    }

    return { success: false, message: 'No account found with this email. Check your email or register first.' };
  };

  // ── REGISTER ───────────────────────────────────────────────────────────────
  const register = async (userData) => {
    const trimEmail = userData.email?.trim().toLowerCase();

    // Block duplicate emails in existing student list
    const students = getStudents();
    if (students.find((s) => s.email?.trim().toLowerCase() === trimEmail)) {
      return {
        success: false,
        message: 'This email is already registered. Please login with your Roll Number as password.',
      };
    }

    // Block duplicate emails in manual accounts
    const accounts = getAccounts();
    if (accounts.find((a) => a.email?.trim().toLowerCase() === trimEmail)) {
      return { success: false, message: 'This email is already registered. Please login.' };
    }

    // Create new account
    const newId   = userData.registerNumber?.trim() || `STU_${Date.now()}`;
    const newAcct = {
      _id:      newId,
      email:    trimEmail,
      password: userData.password,   // plain text for now (frontend-only)
      name:     userData.name,
      role:     'student',
    };
    saveAccounts([...accounts, newAcct]);

    const data = { _id: newId, email: trimEmail, role: 'student', name: userData.name };
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return { success: true, newId };
  };

  // ── LOGOUT ────────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
