import React, { useEffect, useState } from 'react'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { supabase } from '@/api/supabaseClient';

import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import { readAdminSession } from '@/lib/adminAuth';

const getAdminSession = () => readAdminSession()

const AdminGate = () => {
  const [adminSession, setAdminSession] = useState(getAdminSession())

  useEffect(() => {
    const syncSession = () => setAdminSession(getAdminSession())
    window.addEventListener('adminSessionChanged', syncSession)
    window.addEventListener('storage', syncSession)
    return () => {
      window.removeEventListener('adminSessionChanged', syncSession)
      window.removeEventListener('storage', syncSession)
    }
  }, [])

  if (!adminSession) {
    return <Navigate to="/" replace />
  }

  return <Admin />
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminGate />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/checkout" element={<Checkout />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem('siteVisitTracked')) return

    sessionStorage.setItem('siteVisitTracked', '1')
    // Fire and forget - don't block app startup
    try {
      supabase
        .from('site_visits')
        .insert({
          page: window.location.pathname || '/',
          device: /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
          user_agent: navigator.userAgent,
        })
        .then(() => {
          // visit tracked successfully
        })
        .catch(() => {
          // no-op: visit tracking should not block app startup
        })
    } catch (error) {
      // no-op: visit tracking should not block app startup
    }
  }, [])

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App