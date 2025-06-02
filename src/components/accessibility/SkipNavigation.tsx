
import { cn } from '@/lib/utils';

interface SkipNavigationProps {
  links?: Array<{
    href: string;
    label: string;
  }>;
}

const defaultLinks = [
  { href: '#main-content', label: 'Pular para o conteúdo principal' },
  { href: '#navigation', label: 'Pular para a navegação' },
  { href: '#chat-input', label: 'Pular para a entrada de mensagem' }
];

const SkipNavigation = ({ links = defaultLinks }: SkipNavigationProps) => {
  return (
    <div className="sr-only-focusable">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className={cn(
            "skip-link",
            "bg-blue-600 text-white px-4 py-2 rounded-md",
            "focus:not-sr-only focus:absolute focus:top-4 focus:left-4",
            "focus:z-50 focus:outline-none focus:ring-2 focus:ring-blue-400",
            "transition-all duration-200"
          )}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
};

export default SkipNavigation;
