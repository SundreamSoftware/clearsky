import { type ReactNode } from 'react';
import { useTheme } from '@/shared/utils/useTheme';

interface HeaderProps {
  children?: ReactNode;
}

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
    </svg>
  );
}

export function Header({ children }: HeaderProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="relative z-10 flex h-14 items-center gap-3 border-b border-[var(--border)] bg-[var(--bg)] px-4 shadow-sm transition-colors">
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xl" aria-hidden="true">🌤</span>
        <h1 className="text-lg font-bold tracking-tight" style={{ color: 'var(--accent)' }}>
          ClearSky
        </h1>
        <span className="hidden text-xs font-medium text-[var(--text-muted)] sm:inline">
          Air Quality Monitor
        </span>
      </div>

      {children && <div className="ml-auto flex-1 max-w-sm">{children}</div>}

      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? 'Włącz tryb jasny' : 'Włącz tryb ciemny'}
        className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </button>
    </header>
  );
}

