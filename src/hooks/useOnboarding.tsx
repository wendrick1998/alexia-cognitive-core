
import { useState, useEffect } from 'react';

const ONBOARDING_KEY = 'alexia_onboarding_completed';

export const useOnboarding = () => {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    
    const stored = localStorage.getItem(ONBOARDING_KEY);
    return stored === 'true';
  });

  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if this is a first-time user
    if (!isOnboardingCompleted) {
      // Small delay to ensure smooth loading
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isOnboardingCompleted]);

  const completeOnboarding = () => {
    setIsOnboardingCompleted(true);
    setShowOnboarding(false);
    localStorage.setItem(ONBOARDING_KEY, 'true');
  };

  const resetOnboarding = () => {
    setIsOnboardingCompleted(false);
    setShowOnboarding(true);
    localStorage.removeItem(ONBOARDING_KEY);
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  return {
    isOnboardingCompleted,
    showOnboarding,
    completeOnboarding,
    resetOnboarding,
    skipOnboarding,
  };
};
