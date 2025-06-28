import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import Navbar from './Navbar';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const hideLayoutPaths = ['/login', '/dashboard'];

  const shouldHideLayout = hideLayoutPaths.some(path => 
    path === '/login' ? location.pathname === path : location.pathname.startsWith(path)
  );

  return (
    <>
      {!shouldHideLayout && <Navbar />}
      <div>{children}</div>
    </>
  );
};

export default Layout; 