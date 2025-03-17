'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-4">시스템 오류</h1>
            <div className="mb-6 text-gray-600 dark:text-gray-300">
              <p className="mb-2">심각한 오류가 발생했습니다. 불편을 드려 죄송합니다.</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{error.message || '알 수 없는 오류'}</p>
            </div>
            <button
              onClick={reset}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </body>
    </html>
  );
} 