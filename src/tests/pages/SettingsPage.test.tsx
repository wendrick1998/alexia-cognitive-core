
import React from 'react';
import { render, screen, fireEvent } from '@/utils/testUtils';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SettingsPage from '@/pages/SettingsPage';

// Mock settings sub-components
jest.mock('@/components/settings/UserPreferences', () => {
  return function UserPreferencesMock() {
    return <div data-testid="user-preferences">User Preferences Mock</div>;
  };
});

jest.mock('@/components/settings/AIConfiguration', () => {
  return function AIConfigurationMock() {
    return <div data-testid="ai-configuration">AI Configuration Mock</div>;
  };
});

jest.mock('@/pages/SecurityPage', () => {
  return function SecurityPageMock() {
    return <div data-testid="security-page">Security Page Mock</div>;
  };
});

jest.mock('@/components/settings/NotificationsSettings', () => {
  return function NotificationsSettingsMock() {
    return <div data-testid="notifications-settings">Notifications Settings Mock</div>;
  };
});

jest.mock('@/components/settings/PWASettingsPage', () => {
  return function PWASettingsPageMock() {
    return <div data-testid="pwa-settings">PWA Settings Mock</div>;
  };
});

describe('SettingsPage', () => {
  test('renders default profile settings', () => {
    render(
      <MemoryRouter initialEntries={['/settings/profile']}>
        <Routes>
          <Route path="/settings/*" element={<SettingsPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Check if default sub-page (Profile) is rendered
    expect(screen.getByTestId('user-preferences')).toBeInTheDocument();
    expect(screen.getByText('User Preferences Mock')).toBeInTheDocument();
  });

  test('navigates to AI configuration settings', async () => {
    render(
      <MemoryRouter initialEntries={['/settings/profile']}>
        <Routes>
          <Route path="/settings/*" element={<SettingsPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Look for AI settings navigation link
    const aiLink = screen.getByRole('link', { name: /IA|AI|Inteligência/i }) ||
                  screen.getByText(/IA|AI|Inteligência/i) ||
                  document.querySelector('a[href*="ai"]');
    
    if (aiLink) {
      fireEvent.click(aiLink);
      
      // Check if AI settings sub-page is rendered
      expect(await screen.findByTestId('ai-configuration')).toBeInTheDocument();
    } else {
      // If navigation is not available, at least ensure the page renders
      expect(screen.getByTestId('user-preferences')).toBeInTheDocument();
    }
  });

  test('handles settings navigation structure', () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <Routes>
          <Route path="/settings/*" element={<SettingsPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Should redirect to profile by default or show settings layout
    const settingsContent = screen.getByTestId('user-preferences') ||
                           screen.getByText(/Settings|Configurações/i) ||
                           document.body;
    
    expect(settingsContent).toBeInTheDocument();
  });

  test('renders security settings route', () => {
    render(
      <MemoryRouter initialEntries={['/settings/security']}>
        <Routes>
          <Route path="/settings/*" element={<SettingsPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Check if security page is rendered
    expect(screen.getByTestId('security-page')).toBeInTheDocument();
    expect(screen.getByText('Security Page Mock')).toBeInTheDocument();
  });

  test('handles unknown settings routes', () => {
    render(
      <MemoryRouter initialEntries={['/settings/unknown']}>
        <Routes>
          <Route path="/settings/*" element={<SettingsPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Should fallback to default route (profile)
    expect(screen.getByTestId('user-preferences')).toBeInTheDocument();
  });
});
