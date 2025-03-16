import React from 'react';
import { Layout } from '@/components/layout/Layout';

export default function DashboardPage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">대시보드</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-center py-8">
            <h2 className="text-xl font-medium mb-2">환영합니다!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              AIssist에 오신 것을 환영합니다. 학습 관리와 협업을 위한 최적의 플랫폼입니다.
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <a 
                href="/rooms" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                스터디룸 보기
              </a>
              <a 
                href="/tasks" 
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                작업 관리
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}