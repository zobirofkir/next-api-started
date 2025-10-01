'use client';

import { useState } from 'react';
import { auth } from '@/app/lib/config/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function GmailAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const handleGmailLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      // Sign in with Google using Firebase
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Get the Firebase ID token
      const idToken = await result.user.getIdToken();

      // Send the token to your backend
      const response = await fetch('/api/auth/gmail/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (data.success) {
        // Store the JWT token
        localStorage.setItem('token', data.resource.token);
        setUser(data.resource.user);
        console.log('Login successful:', data.resource.user);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Gmail login error:', err);
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleGmailRegister = async () => {
    setLoading(true);
    setError(null);

    try {
      // Sign in with Google using Firebase
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Get the Firebase ID token
      const idToken = await result.user.getIdToken();

      // Send the token to your backend
      const response = await fetch('/api/auth/gmail/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (data.success) {
        // Store the JWT token
        localStorage.setItem('token', data.resource.token);
        setUser(data.resource.user);
        console.log('Registration successful:', data.resource.user);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Gmail registration error:', err);
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-2xl font-bold">Gmail Authentication</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {user ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p className="font-bold">Welcome, {user.name}!</p>
          <p>Email: {user.email}</p>
          {user.photoURL && (
            <img src={user.photoURL} alt="Profile" className="w-16 h-16 rounded-full mt-2" />
          )}
        </div>
      ) : (
        <div className="flex gap-4">
          <button
            onClick={handleGmailLogin}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Login with Gmail'}
          </button>
          
          <button
            onClick={handleGmailRegister}
            disabled={loading}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Register with Gmail'}
          </button>
        </div>
      )}
    </div>
  );
}
