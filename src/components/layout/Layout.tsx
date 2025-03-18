'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Toaster } from 'react-hot-toast';
import { useTheme } from 'next-themes';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Moon, Sun, User } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="flex min-h-screen relative bg-gradient-to-br from-background to-background/90">
      {/* 배경 장식 요소 */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* 사이드바 */}
      <Sidebar />

      {/* 메인 콘텐츠 */}
      <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 max-w-5xl mx-auto">
        {/* 상단 헤더 */}
        <div className="flex justify-end items-center mb-6 p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="테마 변경"
            className="mr-2"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          {status === 'authenticated' ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium hidden sm:inline-block">
                {session.user.name || session.user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="text-xs"
              >
                로그아웃
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="outline" size="sm" className="text-xs">
                  로그인
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="text-xs">
                  회원가입
                </Button>
              </Link>
            </div>
          )}
        </div>

        {mounted ? children : null}
      </main>

      {/* 토스트 알림 */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
          },
        }}
      />
    </div>
  );
} 