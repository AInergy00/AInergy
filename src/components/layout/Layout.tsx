'use client';

import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="flex flex-1 pt-16">
        <Sidebar />
        <main className="flex-1 p-6 ml-64">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      <footer className="bg-card border-t py-4 text-center text-sm text-muted-foreground ml-0 md:ml-64">
        <div className="container mx-auto">
          © {new Date().getFullYear()} AI 학교생활 어시스트. 모든 권리 보유.
        </div>
      </footer>
    </div>
  );
} 