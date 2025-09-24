import React from 'react';
import { NotificationProvider } from '../contexts/NotificationContext';
import NotificationCenter from '../components/notifications/NotificationCenter';

export default function Notifications() {
  return (
    <NotificationProvider>
      <div className="min-h-screen bg-background">
        <NotificationCenter />
      </div>
    </NotificationProvider>
  );
}