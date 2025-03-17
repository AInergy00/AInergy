'use client';

import React, { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 오류 로깅
    console.error('Application error:', error);
  }, [error]);

  return (
    <Layout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">오류가 발생했습니다</h1>
          <div className="mb-6 text-gray-600 dark:text-gray-300">
            <p className="mb-2">예기치 않은 오류가 발생했습니다. 불편을 드려 죄송합니다.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{error.message || '알 수 없는 오류'}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={reset}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700"
            >
              다시 시도
            </Button>
            <Link href="/dashboard">
              <Button 
                variant="outline" 
                className="px-6 py-2"
              >
                대시보드로 이동
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
} 