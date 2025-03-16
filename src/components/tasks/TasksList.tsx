import React, { useState } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/date';
import { Button } from '@/components/ui/Button';

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
  createdAt: string;
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
      case 'CLASSROOM': return '수업';
      case 'TASK': return '업무';
      case 'OTHER': return '기타';
      default: return category;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('all')}
          >
            전체
          </Button>
          <Button 
            variant={filter === 'incomplete' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('incomplete')}
          >
            미완료
          </Button>
          <Button 
            variant={filter === 'complete' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('complete')}
          >
            완료
          </Button>
        </div>
      </div>

      {sortedTasks.length === 0 ? (
        <div className="text-center p-4 border rounded-md bg-muted/10">
          <p className="text-muted-foreground">작업이 없습니다.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {sortedTasks.map((task) => {
            const isCompleted = task.completions.some(completion => completion.completed);
            
            return (
              <li 
                key={task.id} 
                className={`p-4 border rounded-md ${
                  isCompleted ? 'bg-muted/20' : 'bg-card'
                } hover:bg-secondary/5 transition-colors`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div>
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => handleTaskCompletion(task.id, isCompleted)}
                        className="h-5 w-5 rounded-md border-gray-300 text-primary focus:ring-primary"
                      />
                    </div>
                    <div className={`${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{task.title}</h3>
                        {getPriorityBadge(task.priority)}
                      </div>
                      
                      {task.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                      )}
                      
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                            <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.75A2.75 2.75 0 0119 6.75v8.5A2.75 2.75 0 0116.25 18H3.75A2.75 2.75 0 011 15.25v-8.5A2.75 2.75 0 013.75 4h.75V2.75A.75.75 0 015.75 2zm-2 4.5v8.75c0 .69.56 1.25 1.25 1.25h12.5c.69 0 1.25-.56 1.25-1.25V6.5H3.75z" clipRule="evenodd" />
                          </svg>
                          {task.dueDate ? formatDate(task.dueDate) : '마감일 없음'}
                        </span>
                        
                        <span className="inline-flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" />
                          </svg>
                          {getCategoryText(task.category)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <Link href={`/tasks/${task.id}`}>
                      <Button variant="ghost" size="sm">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-4 w-4" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                          />
                        </svg>
                      </Button>
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
} 