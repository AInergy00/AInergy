import React, { useState } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/date';
import { Button } from '@/components/ui/Button';
import { getCategoryLabel } from '@/lib/utils/theme';
import { formatDistanceToNow, isFuture, isWithinInterval, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';

interface TaskCompletion {
  id: string;
  completed: boolean;
  completedAt: string | null;
  userId: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  category: string;
  priority: string;
  status: string;
  dueDate: string | null;
  startTime: string | null;
  endTime: string | null;
  fileUrl: string | null;
  linkUrl: string | null;
  location: string | null;
  materials: string | null;
  notes: string | null;
  createdAt: string;
  createdBy?: {
    id: string;
    name: string;
  };
  completions: TaskCompletion[];
}

interface TasksListProps {
  tasks: Task[];
  roomId: string;
}

export function TasksList({ tasks, roomId }: TasksListProps) {
  const [filter, setFilter] = useState<'all' | 'complete' | 'incomplete'>('all');
  const [tasksState, setTasks] = useState<Task[]>(tasks);
  
  const filteredTasks = tasksState.filter(task => {
    if (filter === 'all') return true;
    const isCompleted = task.completions.some(completion => completion.completed);
    return filter === 'complete' ? isCompleted : !isCompleted;
  });

  // 정렬: 완료되지 않은 항목은 날짜순, 완료된 항목은 완료일순
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const aCompleted = a.completions.some(c => c.completed);
    const bCompleted = b.completions.some(c => c.completed);
    
    // 완료 여부가 다른 경우 미완료를 먼저
    if (aCompleted !== bCompleted) {
      return aCompleted ? 1 : -1;
    }
    
    // 두 작업 모두 미완료인 경우 마감일순
    if (!aCompleted && !bCompleted) {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    
    // 두 작업 모두 완료된 경우 완료일순 (최근 것이 위로)
    const aCompletedAt = a.completions.find(c => c.completed)?.completedAt;
    const bCompletedAt = b.completions.find(c => c.completed)?.completedAt;
    
    if (!aCompletedAt) return 1;
    if (!bCompletedAt) return -1;
    
    return new Date(bCompletedAt).getTime() - new Date(aCompletedAt).getTime();
  });

  // 업무 긴급 여부 확인 (제출 마감 2일 전부터 당일까지)
  const isUrgent = (dueDate: string | null) => {
    if (!dueDate) return false;
    
    const today = new Date();
    const deadline = new Date(dueDate);
    const twoDaysBefore = subDays(deadline, 2);
    
    return isWithinInterval(today, { start: twoDaysBefore, end: deadline }) || 
           (isFuture(deadline) && formatDistanceToNow(deadline, { locale: ko }).includes('하루'));
  };

  const handleTaskCompletion = async (taskId: string, isCompleted: boolean) => {
    try {
      const formData = new FormData();
      formData.append('completed', (!isCompleted).toString());

      // fetch 옵션을 수정하여 JSON 응답이 직접 표시되지 않도록 함
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest' // AJAX 요청임을 명시
        },
        body: formData,
        // 브라우저가 응답을 직접 처리하지 않도록 설정
        credentials: 'same-origin',
      });
      
      let data;
      try {
        // 응답 데이터를 한 번만 읽음
        data = await response.json();
      } catch (e) {
        console.error('응답 파싱 오류:', e);
        throw new Error('응답을 처리하는데 실패했습니다.');
      }
      
      // response가 정상적으로 처리되었는지 확인
      if (!response.ok) {
        throw new Error(data.error || '작업 상태를 변경하는데 실패했습니다.');
      }
      
      // 서버에서 성공적으로 처리되었다면 클라이언트 상태 업데이트
      if (data.success) {
        setTasks(prevTasks => 
          prevTasks.map(task => {
            if (task.id === taskId) {
              // 완료 상태 토글
              const updatedCompletions = task.completions.length > 0 
                ? [{ ...task.completions[0], completed: !isCompleted, completedAt: !isCompleted ? new Date().toISOString() : null }]
                : [{ id: 'temp-id', completed: !isCompleted, completedAt: !isCompleted ? new Date().toISOString() : null, userId: '' }];
              
              return { ...task, completions: updatedCompletions };
            }
            return task;
          })
        );
      } else {
        // 성공하지 않았을 경우 오류 메시지 표시
        console.error('작업 완료 상태 변경 실패:', data);
        window.location.reload(); // 페이지 새로고침으로 상태 동기화
      }
    } catch (error) {
      console.error('작업 완료 상태 변경 중 오류 발생:', error);
      alert('작업 완료 상태를 변경하는데 실패했습니다.');
      window.location.reload(); // 오류 발생 시 페이지 새로고침
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <span className="px-2 py-1 text-xs rounded-full bg-destructive/20 text-destructive">긴급</span>;
      case 'HIGH':
        return <span className="px-2 py-1 text-xs rounded-full bg-warning/20 text-warning">높음</span>;
      case 'MEDIUM':
        return <span className="px-2 py-1 text-xs rounded-full bg-secondary/20 text-secondary-foreground">중간</span>;
      case 'LOW':
        return <span className="px-2 py-1 text-xs rounded-full bg-muted/20 text-muted-foreground">낮음</span>;
      default:
        return null;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'MEETING': return '회의';
      case 'BUSINESS_TRIP': return '출장';
      case 'TRAINING': return '연수';
      case 'EVENT': return '행사';
      case 'CLASSROOM': return '담임';
      case 'TASK': return '업무';
      case 'OTHER': return '기타';
      default: return category;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            전체
          </Button>
          <Button
            size="sm"
            variant={filter === 'incomplete' ? 'default' : 'outline'}
            onClick={() => setFilter('incomplete')}
          >
            미완료
          </Button>
          <Button
            size="sm"
            variant={filter === 'complete' ? 'default' : 'outline'}
            onClick={() => setFilter('complete')}
          >
            완료
          </Button>
        </div>
      </div>

      {sortedTasks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          업무가 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {sortedTasks.map(task => {
            const isCompleted = task.completions.some(c => c.completed);
            const taskUrgent = isUrgent(task.dueDate) && !isCompleted;
            
            return (
              <div 
                key={task.id} 
                className={`p-4 border rounded-lg transition-colors ${
                  isCompleted 
                    ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50' 
                    : taskUrgent
                    ? 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 pt-1">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => handleTaskCompletion(task.id, isCompleted)}
                      className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className={`text-lg font-medium ${isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
                        <Link href={`/tasks/${task.id}`} className="hover:underline">
                          {task.title}
                        </Link>
                      </h3>
                      
                      {taskUrgent && !isCompleted && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          급함
                        </span>
                      )}
                      
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {getCategoryLabel(task.category)}
                      </span>
                      
                      {getPriorityBadge(task.priority)}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      {task.dueDate && (
                        <span className="inline-flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                      
                      {task.location && (
                        <span className="inline-flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {task.location}
                        </span>
                      )}
                      
                      {task.createdBy && (
                        <span className="inline-flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {task.createdBy.name}
                        </span>
                      )}
                      
                      {task.fileUrl && (
                        <a 
                          href={task.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary-600 hover:underline dark:text-primary-400"
                          title="첨부 파일 다운로드"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          파일
                        </a>
                      )}
                      
                      {task.linkUrl && (
                        <a 
                          href={task.linkUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary-600 hover:underline dark:text-primary-400"
                          title="관련 링크"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          링크
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Link href={`/tasks/${task.id}/edit?from=room_${roomId}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="sr-only">편집</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 