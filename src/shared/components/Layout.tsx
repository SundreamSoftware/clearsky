import { type ReactNode } from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
  header?: ReactNode;
}

export function Layout({ children, header }: LayoutProps) {
  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <Header>{header}</Header>
      <main className="relative flex flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
