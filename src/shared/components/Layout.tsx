import { type ReactNode } from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
  header?: ReactNode;
  /** Optional bar rendered between the header and the main content area. */
  filterBar?: ReactNode;
}

export function Layout({ children, header, filterBar }: LayoutProps) {
  return (
    <div className="flex h-screen flex-col bg-[var(--bg-secondary)] transition-colors">
      <Header>{header}</Header>
      {filterBar}
      <main className="relative flex flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
