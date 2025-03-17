import { Layout } from '@/components/layout/Layout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';

export default async function EditTaskPage({ params, searchParams }: { 
  params: { id: string },
  searchParams: { from?: string }
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const searchParamsObj = await searchParams;
  const { from } = searchParamsObj || {};
  
  const paramsObj = await params;
  const { id } = paramsObj;

  // 업무 조회
  const task = await prisma.task.findUnique({
    where: {
      id,
    },
    include: {
      room: true,
    },
  });

  if (!task) {
    notFound();
  }

  // 자신의 업무만 편집 가능
  if (task.userId !== session.user.id) {
    redirect('/tasks');
  }

  // 사용자의 방 목록 조회
  const rooms = await prisma.room.findMany({
    where: {
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  // 날짜 형식 변환
  const formattedDueDate = task.dueDate 
    ? format(new Date(task.dueDate), 'yyyy-MM-dd') 
    : '';
  
  // 시간 형식 변환
  const formattedStartTime = task.startTime 
    ? format(new Date(task.startTime), 'HH:mm')
    : '';
  
  const formattedEndTime = task.endTime
    ? format(new Date(task.endTime), 'HH:mm')
    : '';

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href={`/tasks/${task.id}${from ? `?from=${from}` : ''}`}>
              <Button variant="ghost" size="sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                뒤로
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">업무 수정</h1>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <form action="/api/tasks/update" method="POST" className="p-6 space-y-6">
            <input type="hidden" name="id" value={task.id} />
            {from && <input type="hidden" name="from" value={from} />}
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    제목 *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    defaultValue={task.title}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    설명
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    defaultValue={task.description || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    분류 *
                  </label>
                  <select
                    id="category"
                    name="category"
                    defaultValue={task.category}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="MEETING">회의</option>
                    <option value="EVENT">행사</option>
                    <option value="TASK">업무</option>
                    <option value="EDUCATION">교육</option>
                    <option value="PERSONAL">개인</option>
                    <option value="OTHER">기타</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    중요도 *
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    defaultValue={task.priority}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="HIGH">높음</option>
                    <option value="MEDIUM">보통</option>
                    <option value="LOW">낮음</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    날짜
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    defaultValue={formattedDueDate}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      시작 시간
                    </label>
                    <div className="flex items-center mt-1">
                      <select
                        id="startTime-hour"
                        name="startTime-hour"
                        defaultValue={formattedStartTime ? formattedStartTime.split(':')[0] : ''}
                        className="w-1/2 rounded-l-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">시</option>
                        {Array.from({length: 24}, (_, i) => i).map(hour => (
                          <option key={hour} value={hour.toString().padStart(2, '0')}>
                            {hour.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                      <span className="mx-1">:</span>
                      <select
                        id="startTime-minute"
                        name="startTime-minute"
                        defaultValue={formattedStartTime ? formattedStartTime.split(':')[1] : ''}
                        className="w-1/2 rounded-r-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">분</option>
                        {Array.from({length: 6}, (_, i) => i * 10).map(minute => (
                          <option key={minute} value={minute.toString().padStart(2, '0')}>
                            {minute.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      종료 시간
                    </label>
                    <div className="flex items-center mt-1">
                      <select
                        id="endTime-hour"
                        name="endTime-hour"
                        defaultValue={formattedEndTime ? formattedEndTime.split(':')[0] : ''}
                        className="w-1/2 rounded-l-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">시</option>
                        {Array.from({length: 24}, (_, i) => i).map(hour => (
                          <option key={hour} value={hour.toString().padStart(2, '0')}>
                            {hour.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                      <span className="mx-1">:</span>
                      <select
                        id="endTime-minute"
                        name="endTime-minute"
                        defaultValue={formattedEndTime ? formattedEndTime.split(':')[1] : ''}
                        className="w-1/2 rounded-r-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">분</option>
                        {Array.from({length: 6}, (_, i) => i * 10).map(minute => (
                          <option key={minute} value={minute.toString().padStart(2, '0')}>
                            {minute.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    장소
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    defaultValue={task.location || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="materials" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    준비물
                  </label>
                  <input
                    type="text"
                    id="materials"
                    name="materials"
                    defaultValue={task.materials || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  비고
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  defaultValue={task.notes || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  공유 방
                </label>
                <select
                  id="roomId"
                  name="roomId"
                  defaultValue={task.roomId || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">선택 안함</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  id="isShared"
                  name="isShared"
                  type="checkbox"
                  defaultChecked={task.isShared}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor="isShared" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  다른 사용자와 공유
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Link href={`/tasks/${task.id}`}>
                <Button variant="outline" type="button">취소</Button>
              </Link>
              <Button type="submit">업데이트</Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
} 