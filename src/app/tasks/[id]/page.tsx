import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { formatDate, formatTime } from '@/lib/utils/date';
import { getCategoryColor, getCategoryLabel, getPriorityLabel } from '@/lib/utils/theme';
import { Button } from '@/components/ui/Button';

export default async function TaskDetailPage({ params, searchParams }: { 
  params: { id: string },
  searchParams: { from?: string } 
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Next.js 15.2 이상에서는 params와 searchParams를 사용하기 전에 await해야 함
  const paramsObj = await params;
  const { id } = paramsObj;
  
  const searchParamsObj = await searchParams;
  const { from } = searchParamsObj || {};

  // 뒤로가기 링크 결정
  const backLink = from === 'calendar' ? '/calendar' : '/tasks';

  // 업무 조회
  const task = await prisma.task.findUnique({
    where: {
      id,
    },
    include: {
      room: true,
      completions: {
        where: {
          userId: session.user.id,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!task) {
    notFound();
  }

  // 자신의 업무이거나 공유된 업무만 접근 가능
  if (task.userId !== session.user.id && !task.isShared) {
    redirect('/tasks');
  }

  const isCompleted = task.completions.length > 0 && task.completions[0].completed;
  const isOwner = task.userId === session.user.id;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link href={backLink}>
            <Button variant="ghost" size="sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              뒤로
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{task.title}</h1>
        </div>
        {isOwner && (
          <div className="flex space-x-3">
            <Link href={`/tasks/${task.id}/edit`}>
              <Button variant="outline">수정</Button>
            </Link>
            <form action={`/api/tasks/${task.id}/delete`} method="POST">
              <Button type="submit" variant="destructive">삭제</Button>
            </form>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">업무 정보</h2>
              
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">분류</dt>
                  <dd className="mt-1 flex items-center">
                    <div
                      className="h-3 w-3 rounded-full mr-2"
                      style={{ backgroundColor: getCategoryColor(task.category) }}
                    />
                    <span className="text-gray-900 dark:text-white">{getCategoryLabel(task.category)}</span>
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">중요도</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">{getPriorityLabel(task.priority)}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">날짜</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">
                    {task.dueDate ? formatDate(task.dueDate) : '미정'}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">시간</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">
                    {task.startTime && task.endTime
                      ? `${formatTime(task.startTime)} - ${formatTime(task.endTime)}`
                      : task.startTime
                      ? formatTime(task.startTime)
                      : task.endTime
                      ? formatTime(task.endTime)
                      : '미정'}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">장소</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">{task.location || '미정'}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">준비물</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">{task.materials || '없음'}</dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">추가 정보</h2>
              
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">설명</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white whitespace-pre-line">
                    {task.description || '없음'}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">비고</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white whitespace-pre-line">
                    {task.notes || '없음'}
                  </dd>
                </div>
                
                {task.room && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">협업 공간</dt>
                    <dd className="mt-1 text-gray-900 dark:text-white">
                      <Link href={`/rooms/${task.room.id}`} className="text-primary-600 hover:underline dark:text-primary-400">
                        {task.room.name}
                      </Link>
                    </dd>
                  </div>
                )}
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">작성자</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">{task.createdBy.name}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">생성일</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">{formatDate(task.createdAt, 'yyyy년 MM월 dd일')}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {isCompleted ? '완료됨' : '진행 중'}
              </div>
            </div>
            <form action={`/api/tasks/${task.id}/complete`} method="POST">
              {isCompleted && <input type="hidden" name="completed" value="false" />}
              <Button
                type="submit"
                variant={isCompleted ? 'outline' : 'default'}
              >
                {isCompleted ? '완료 취소' : '완료로 표시'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 