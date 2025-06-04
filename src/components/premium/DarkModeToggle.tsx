
import { Button } from '@/components/ui/button';
import { Moon, Sun, Monitor, Smartphone } from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const DarkModeToggle = () => {
  const { theme, isDark, isOled, setTheme } = useDarkMode();

  const getIcon = () => {
    switch (theme) {
      case 'oled':
        return <Smartphone className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      case 'light':
        return <Sun className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-9 h-9 rounded-xl transition-all duration-300 hover:bg-accent"
        >
          <div className="transition-transform duration-300 hover:scale-110">
            {getIcon()}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-44 bg-popover border-border backdrop-blur-xl"
      >
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className="cursor-pointer hover:bg-accent"
        >
          <Sun className="w-4 h-4 mr-2" />
          Claro
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className="cursor-pointer hover:bg-accent"
        >
          <Moon className="w-4 h-4 mr-2" />
          Escuro
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('oled')}
          className="cursor-pointer hover:bg-accent"
        >
          <Smartphone className="w-4 h-4 mr-2" />
          OLED (True Black)
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className="cursor-pointer hover:bg-accent"
        >
          <Monitor className="w-4 h-4 mr-2" />
          Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DarkModeToggle;
