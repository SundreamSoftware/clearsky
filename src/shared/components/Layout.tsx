import { type ReactNode } from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
  header?: ReactNode;
}

export function Layout({ children, header }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header>{header}</Header>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
