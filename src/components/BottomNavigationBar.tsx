
import PremiumNavigationBar from './premium/PremiumNavigationBar';
import { useIsMobile } from '@/hooks/use-mobile';

interface BottomNavigationBarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  onMenuToggle?: () => void;
}

const BottomNavigationBar = ({ 
  currentSection, 
  onSectionChange, 
  onMenuToggle = () => {} 
}: BottomNavigationBarProps) => {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <PremiumNavigationBar
      currentSection={currentSection}
      onSectionChange={onSectionChange}
      onMenuToggle={onMenuToggle}
    />
  );
};

export default BottomNavigationBar;
