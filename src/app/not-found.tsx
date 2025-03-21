import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 text-center">
        <h1 className="text-7xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">페이지를 찾을 수 없습니다</h2>
        <p className="text-muted-foreground mb-8">
          요청하신 페이지가 존재하지 않거나, 이동되었거나, 사용할 수 없는 상태입니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" passHref>
            <Button className="w-full sm:w-auto">
              홈으로 이동
            </Button>
          </Link>
          <Link href="/dashboard" passHref>
            <Button variant="outline" className="w-full sm:w-auto">
              대시보드로 이동
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 