import { type ReactNode } from 'react';

interface HeaderProps {
  children?: ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <header className="relative z-10 flex h-16 items-center border-b bg-white px-4 shadow-sm">
      <span className="mr-1 text-2xl" aria-hidden="true">
        🌤
      </span>
      <h1 className="text-xl font-bold text-brand">ClearSky</h1>
      <span className="ml-2 hidden text-sm text-gray-500 sm:inline">Jakość Powietrza w Polsce</span>
      {children && <div className="ml-auto flex-1 max-w-md pl-4">{children}</div>}
    </header>
  );
}
