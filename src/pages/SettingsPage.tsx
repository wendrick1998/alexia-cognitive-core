
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from '@/components/auth/AuthGuard';
import SidebarSettings from '@/components/settings/SidebarSettings';
import UserPreferences from '@/components/settings/UserPreferences';
import AIConfiguration from '@/components/settings/AIConfiguration';
import SecurityPage from '@/pages/SecurityPage';
import NotificationsSettings from '@/components/settings/NotificationsSettings';

const SettingsPage = () => {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-background text-foreground">
        <SidebarSettings />
        <main className="flex-1 p-4 overflow-y-auto">
          <Routes>
            {/* Rota padrão para /settings, redireciona para 'profile' */}
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<UserPreferences />} />
            <Route path="ai" element={<AIConfiguration />} />
            <Route path="security" element={<SecurityPage />} />
            <Route path="notifications" element={<NotificationsSettings />} />
            {/* Fallback para sub-rotas desconhecidas */}
            <Route path="*" element={<Navigate to="profile" replace />} />
          </Routes>
        </main>
      </div>
    </AuthGuard>
  );
};

export default SettingsPage;
