import React from 'react';
import { Layout } from '@/components/layout/Layout';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <Layout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">페이지를 찾을 수 없습니다</h2>
          <div className="mb-6 text-gray-600 dark:text-gray-400">
            <p>요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.</p>
          </div>
          <Link href="/dashboard">
            <Button className="px-6 py-2">
              대시보드로 이동
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
} 