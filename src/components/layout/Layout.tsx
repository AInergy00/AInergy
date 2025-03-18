'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Toaster } from 'react-hot-toast';
import { useTheme } from 'next-themes';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Moon, Sun, User, LogOut } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

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
      <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 max-w-5xl mx-auto flex flex-col">
        {/* 상단 헤더 - 프로필과 로그인/로그아웃 버튼 */}
        <div className="flex justify-end items-center mb-6 p-2 bg-card/30 backdrop-blur-sm rounded-lg shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="테마 변경"
            className="mr-2"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          {status === 'authenticated' && session?.user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Avatar 
                  fallback={(session.user.name?.[0] || session.user.email?.[0] || 'U')} 
                />
                <span className="text-sm font-medium block">
                  {session.user.name || session.user.email}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-1"
              >
                <LogOut size={14} />
                <span>로그아웃</span>
              </Button>
            </div>
          ) : status === 'unauthenticated' ? (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  로그인
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  회원가입
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center">
              <span className="text-sm">로딩 중...</span>
            </div>
          )}
        </div>

        <div className="flex-grow">
          {mounted ? children : null}
        </div>
        
        {/* 푸터 추가 */}
        <footer className="mt-8 py-4 text-center text-sm text-muted-foreground">
          <p>© 2025 <span className="font-semibold text-primary">AI너지</span></p>
        </footer>
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