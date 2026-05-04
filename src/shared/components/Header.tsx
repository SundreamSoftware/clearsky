import { type ReactNode } from 'react';

interface HeaderProps {
  children?: ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <header className="relative z-10 bg-white shadow-sm">
      <div className="container mx-auto flex items-center gap-4 px-4 py-3">
        <div className="shrink-0">
          <h1 className="leading-none text-xl font-bold text-brand">ClearSky</h1>
          <p className="text-xs text-gray-400">Jakość powietrza w Polsce</p>
        </div>
        {children && <div className="flex-1">{children}</div>}
      </div>
    </header>
  );
}
