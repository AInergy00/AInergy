'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="대시보드"
        description="오늘의 중요 정보와 작업 현황을 확인하세요"
      />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* 캘린더 카드 */}
        <Link href="/calendar" className="group block">
          <div className="bg-card p-6 rounded-lg shadow transition-all duration-300 hover:shadow-md border border-border hover:border-primary/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">캘린더</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">일정 및 업무를 캘린더에서 관리하세요.</p>
          </div>
        </Link>
        
        {/* 업무 카드 */}
        <Link href="/tasks" className="group block">
          <div className="bg-card p-6 rounded-lg shadow transition-all duration-300 hover:shadow-md border border-border hover:border-primary/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">업무</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">할 일과 업무를 효율적으로 관리하세요.</p>
          </div>
        </Link>
        
        {/* 협업 카드 */}
        <Link href="/rooms" className="group block">
          <div className="bg-card p-6 rounded-lg shadow transition-all duration-300 hover:shadow-md border border-border hover:border-primary/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">방</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">팀원들과 협력하여 프로젝트를 진행하세요.</p>
          </div>
        </Link>
      </div>
      
      <div className="mt-10 p-6 bg-card rounded-lg shadow border border-border">
        <h2 className="text-xl font-medium mb-2">환영합니다!</h2>
        <p className="text-gray-600 dark:text-gray-400">
          AI 학교생활 어시스트를 통해 일정 관리와 업무를 효율적으로 수행하세요.
          필요한 기능들을 탐색하고 활용해보세요.
        </p>
      </div>
    </>
  );
}