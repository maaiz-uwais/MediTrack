import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('meditrack_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('meditrack_token'));
  const [loading, setLoading] = useState(true);

  // Fetch current user and profile on initial mount
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
          setProfile(res.data.profile);
          localStorage.setItem('meditrack_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.error('Failed to load user profile', err);
        logout(false);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: newToken, user: userData, profile: profileData } = res.data;
        localStorage.setItem('meditrack_token', newToken);
        localStorage.setItem('meditrack_user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        setProfile(profileData);
        toast.success(`Welcome back, ${userData.name}!`);
        return { success: true, user: userData };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // Register handler
  const register = async (data) => {
    try {
      const res = await api.post('/auth/register', data);
      if (res.data.success) {
        if (res.data.token) {
          // Patient or immediately approved account
          const { token: newToken, user: userData } = res.data;
          localStorage.setItem('meditrack_token', newToken);
          localStorage.setItem('meditrack_user', JSON.stringify(userData));
          setToken(newToken);
          setUser(userData);
          toast.success('Registration successful! Welcome to MediTrack.');
          return { success: true, user: userData, pendingApproval: false };
        } else {
          // Doctor awaiting approval
          toast.success(res.data.message, { duration: 6000 });
          return { success: true, pendingApproval: true, message: res.data.message };
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your inputs.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // Logout handler
  const logout = (showToast = true) => {
    localStorage.removeItem('meditrack_token');
    localStorage.removeItem('meditrack_user');
    setToken(null);
    setUser(null);
    setProfile(null);
    if (showToast) {
      toast.success('Signed out safely.');
    }
  };

  // Update profile
  const updateProfile = async (formData) => {
    try {
      const res = await api.put('/auth/profile', formData);
      if (res.data.success) {
        setUser(res.data.user);
        setProfile(res.data.profile);
        localStorage.setItem('meditrack_user', JSON.stringify(res.data.user));
        toast.success('Profile updated successfully!');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const value = {
    user,
    profile,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isPatient: user?.role === 'patient',
    isDoctor: user?.role === 'doctor',
    isLabStaff: user?.role === 'lab_staff',
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateProfile,
    setUser,
    setProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
