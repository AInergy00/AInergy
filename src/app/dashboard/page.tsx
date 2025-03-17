import React from 'react';
import { Layout } from '@/components/layout/Layout';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">대시보드</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 캘린더 카드 */}
          <Link href="/calendar" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 h-full flex flex-col items-center justify-center text-center border border-transparent hover:border-primary-400 relative overflow-hidden cursor-pointer">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
              <div className="mb-6 p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">캘린더</h2>
              <p className="text-gray-600 dark:text-gray-300">일정을 확인하고 관리하세요</p>
            </div>
          </Link>

          {/* 업무 카드 */}
          <Link href="/tasks" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 h-full flex flex-col items-center justify-center text-center border border-transparent hover:border-primary-400 relative overflow-hidden cursor-pointer">
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
              <div className="mb-6 p-4 bg-amber-100 dark:bg-amber-900 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-amber-600 dark:text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">업무</h2>
              <p className="text-gray-600 dark:text-gray-300">할 일을 구성하고 완료하세요</p>
            </div>
          </Link>

          {/* 방 카드 */}
          <Link href="/rooms" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 h-full flex flex-col items-center justify-center text-center border border-transparent hover:border-primary-400 relative overflow-hidden cursor-pointer">
              <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
              <div className="mb-6 p-4 bg-purple-100 dark:bg-purple-900 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-600 dark:text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">방</h2>
              <p className="text-gray-600 dark:text-gray-300">협업을 위한 공간에 참여하세요</p>
            </div>
          </Link>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-center py-4">
            <h2 className="text-xl font-medium mb-2">환영합니다!</h2>
            <p className="text-gray-600 dark:text-gray-300">
              AIssist에 오신 것을 환영합니다. 학습 관리와 협업을 위한 최적의 플랫폼입니다.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}