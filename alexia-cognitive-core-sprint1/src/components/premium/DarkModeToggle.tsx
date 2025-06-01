
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

  const getButtonClass = () => {
    if (isOled) {
      return "w-9 h-9 rounded-xl transition-all duration-300 hover:bg-white/5 border border-white/10 backdrop-blur-sm";
    }
    return "w-9 h-9 rounded-xl transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-800";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={getButtonClass()}
        >
          <div className="transition-transform duration-300 hover:scale-110">
            {getIcon()}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-44 oled:bg-black oled:border-white/10 oled:backdrop-blur-xl"
      >
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className="cursor-pointer oled:hover:bg-white/5 oled:text-white/90"
        >
          <Sun className="w-4 h-4 mr-2" />
          Claro
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className="cursor-pointer oled:hover:bg-white/5 oled:text-white/90"
        >
          <Moon className="w-4 h-4 mr-2" />
          Escuro
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('oled')}
          className="cursor-pointer oled:hover:bg-white/5 oled:text-white/90"
        >
          <Smartphone className="w-4 h-4 mr-2" />
          OLED (True Black)
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className="cursor-pointer oled:hover:bg-white/5 oled:text-white/90"
        >
          <Monitor className="w-4 h-4 mr-2" />
          Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DarkModeToggle;
