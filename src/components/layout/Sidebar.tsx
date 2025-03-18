'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, CheckSquare, Home, LogOut, Settings, Users } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Avatar } from '../ui/Avatar';
import { useUserStore } from '@/store/use-user-store';

const menuItems = [
  { href: '/dashboard', icon: Home, title: '대시보드' },
  { href: '/calendar', icon: Calendar, title: '캘린더' },
  { href: '/tasks', icon: CheckSquare, title: '할 일' },
  { href: '/rooms', icon: Users, title: '협업' },
  { href: '/settings', icon: Settings, title: '설정' },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useUserStore((state) => state.user);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <aside className="w-64 h-screen flex flex-col overflow-hidden border-r border-border/40 bg-background/50 backdrop-blur-md">
      {/* 로고와 프로필 */}
      <div className="p-6 border-b border-border/40">
        <div className="text-xl font-bold text-primary mb-6">AI 스쿨 어시스트</div>
        {user && (
          <div className="flex items-center gap-3">
            <Avatar
              src={user.image || undefined}
              fallback={user.name?.[0] || user.username?.[0] || 'U'}
            />
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name || user.username}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* 메뉴 항목 */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link href={item.href} passHref>
                  <div
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                    }`}
                  >
                    <item.icon size={18} />
                    <span>{item.title}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 로그아웃 버튼 */}
      <div className="p-4 border-t border-border/40">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 text-muted-foreground hover:text-destructive w-full px-3 py-2.5 rounded-lg transition-colors duration-200"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">로그아웃</span>
        </button>
      </div>
    </aside>
  );
} 