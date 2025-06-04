
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from '@/components/auth/AuthGuard';
import SettingsLayout from '@/components/settings/SettingsLayout';
import UserPreferences from '@/components/settings/UserPreferences';
import AIConfiguration from '@/components/settings/AIConfiguration';
import SecurityPage from '@/pages/SecurityPage';
import NotificationsSettings from '@/components/settings/NotificationsSettings';

const SettingsPage = () => {
  return (
    <AuthGuard>
      <Routes>
        {/* Rota padrão para /settings, redireciona para 'profile' */}
        <Route index element={<Navigate to="profile" replace />} />
        
        {/* Layout com navegação lateral e outlet para as sub-rotas */}
        <Route path="/" element={<SettingsLayout />}>
          <Route path="profile" element={<UserPreferences />} />
          <Route path="ai" element={<AIConfiguration />} />
          <Route path="security" element={<SecurityPage />} />
          <Route path="notifications" element={<NotificationsSettings />} />
          {/* Fallback para sub-rotas desconhecidas */}
          <Route path="*" element={<Navigate to="profile" replace />} />
        </Route>
      </Routes>
    </AuthGuard>
  );
};

export default SettingsPage;
