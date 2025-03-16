'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/date';
import { getCategoryColor, getCategoryLabel } from '@/lib/utils/theme';
import { prisma } from '@/lib/db';

type TaskWithCompletions = {
  id: string;
  title: string;
  description: string;
  category: string;
  dueDate: Date | null;
  completions: {
    id: string;
    userId: string;
    completed: boolean;
  }[];
};

type TaskListProps = {
  incompleteTasks: TaskWithCompletions[];
  completedTasks: TaskWithCompletions[];
  userId: string;
};

export default function TaskList({ incompleteTasks, completedTasks, userId }: TaskListProps) {
  const [showCompleted, setShowCompleted] = useState(false);
  
  const toggleCompletion = async (taskId: string, isCompleted: boolean) => {
    try {
      const formData = new FormData();
      formData.append('completed', (!isCompleted).toString());
      
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData,
        credentials: 'same-origin',
      });
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error('응답 파싱 오류:', e);
        throw new Error('응답을 처리하는데 실패했습니다.');
      }
      
      if (!response.ok) {
        throw new Error(data.error || '완료 상태 변경에 실패했습니다');
      }
      
      if (data.success) {
        window.location.reload();
      } else {
        console.error('작업 완료 상태 변경 실패:', data);
        window.location.reload();
      }
    } catch (error) {
      console.error('완료 상태 변경 중 오류 발생:', error);
      alert('작업 완료 상태 변경에 실패했습니다.');
      window.location.reload();
    }
  };
  
  return (
    <div>
      {incompleteTasks.length === 0 && completedTasks.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500 dark:text-gray-400 mb-4">아직 할일이 없습니다.</p>
          <Link href={`/tasks/create`}>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              할일 추가하기
            </button>
          </Link>
        </div>
      ) : (
        <>
          {/* 미완료 할일 */}
          {incompleteTasks.length > 0 ? (
            <div className="space-y-2">
              {incompleteTasks.map((task) => (
                <div 
                  key={task.id}
                  className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-1">
                      <button
                        onClick={() => toggleCompletion(task.id, false)}
                        className="h-5 w-5 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center"
                        aria-label="완료로 표시"
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <Link href={`/tasks/${task.id}`}>
                        <h3 className="text-base font-medium hover:underline">
                          {task.title}
                        </h3>
                      </Link>
                      <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor: `${getCategoryColor(task.category)}20`,
                            color: getCategoryColor(task.category),
                          }}
                        >
                          {getCategoryLabel(task.category)}
                        </span>
                        {task.dueDate && (
                          <span className="inline-flex items-center text-xs">
                            {formatDate(task.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              모든 할일을 완료했습니다! 🎉
            </div>
          )}
          
          {/* 완료된 할일 토글 버튼 */}
          {completedTasks.length > 0 && (
            <div className="mt-6 mb-2">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 mr-1 transition-transform ${showCompleted ? 'rotate-90' : ''}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                완료된 할일 {showCompleted ? '숨기기' : '보기'} ({completedTasks.length})
              </button>
            </div>
          )}
          
          {/* 완료된 할일 목록 */}
          {showCompleted && completedTasks.length > 0 && (
            <div className="mt-2 space-y-2 opacity-70">
              {completedTasks.map((task) => (
                <div 
                  key={task.id}
                  className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-1">
                      <button
                        onClick={() => toggleCompletion(task.id, true)}
                        className="h-5 w-5 rounded-full border border-gray-300 dark:border-gray-600 bg-blue-500 flex items-center justify-center"
                        aria-label="미완료로 표시"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <div className="ml-3 flex-1">
                      <Link href={`/tasks/${task.id}`}>
                        <h3 className="text-base font-medium line-through hover:underline">
                          {task.title}
                        </h3>
                      </Link>
                      <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium opacity-70"
                          style={{
                            backgroundColor: `${getCategoryColor(task.category)}20`,
                            color: getCategoryColor(task.category),
                          }}
                        >
                          {getCategoryLabel(task.category)}
                        </span>
                        {task.dueDate && (
                          <span className="inline-flex items-center text-xs">
                            {formatDate(task.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
} 