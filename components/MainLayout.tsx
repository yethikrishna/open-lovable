'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import {
  Home,
  Code2,
  Database,
  FileText,
  GitBranch,
  Plug,
  Bot,
  Settings,
} from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  ariaLabel: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Home', href: '/', ariaLabel: 'Navigate to home' },
  { icon: Code2, label: 'Code', href: '/', ariaLabel: 'Navigate to code editor' },
  { icon: Database, label: 'Database', href: '/database', ariaLabel: 'Navigate to database' },
  { icon: FileText, label: 'Specs', href: '/specifications', ariaLabel: 'Navigate to specifications' },
  { icon: GitBranch, label: 'Version', href: '/version-control', ariaLabel: 'Navigate to version control' },
  { icon: Plug, label: 'Integrations', href: '/integrations', ariaLabel: 'Navigate to integrations' },
  { icon: Bot, label: 'Agents', href: '/agents', ariaLabel: 'Navigate to agents' },
  { icon: Settings, label: 'Settings', href: '/settings', ariaLabel: 'Navigate to settings' },
];

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#1a1a1a]">
      {/* Sidebar */}
      <nav
        className="fixed left-0 top-0 h-full w-[60px] bg-[#252525] border-r border-[#404040] flex flex-col items-center py-4 z-50"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo/Brand */}
        <div className="mb-8 flex items-center justify-center">
          <div className="w-8 h-8 bg-[#0078d4] rounded-lg flex items-center justify-center text-white font-bold text-sm">
            YC
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 flex flex-col gap-2 w-full px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative group flex items-center justify-center w-full h-12 rounded-lg
                  transition-all duration-200 ease-in-out
                  ${
                    active
                      ? 'bg-[#0078d4] text-white'
                      : 'text-[#b0b0b0] hover:bg-[#333333] hover:text-white'
                  }
                `}
                aria-label={item.ariaLabel}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="w-5 h-5" />

                {/* Tooltip */}
                <span
                  className="absolute left-full ml-3 px-2 py-1 bg-[#333333] text-white text-xs rounded
                    opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none
                    whitespace-nowrap z-50"
                >
                  {item.label}
                </span>

                {/* Active Indicator */}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#0078d4] rounded-r-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer - Project Name */}
        <div className="mt-auto text-[8px] text-[#808080] text-center leading-tight">
          Yethi
          <br />
          Cedar
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="ml-[60px] flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
