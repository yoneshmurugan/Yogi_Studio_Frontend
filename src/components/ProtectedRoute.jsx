import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const isAdminAuthed = sessionStorage.getItem('adminAuth') === 'true';

  if (!isAdminAuthed) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
