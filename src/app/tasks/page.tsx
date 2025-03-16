import { Layout } from '@/components/layout/Layout';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { formatDate } from '@/lib/utils/date';
import { getCategoryColor, getCategoryLabel } from '@/lib/utils/theme';
import { Button } from '@/components/ui/Button';

export default async function TasksPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // 모든 업무 가져오기
  const tasks = await prisma.task.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: [
      {
        dueDate: 'asc',
      },
      {
        createdAt: 'desc',
      },
    ],
    include: {
      room: {
        select: {
          name: true,
        },
      },
      completions: {
        where: {
          userId: session.user.id,
        },
      },
    },
  });

  const getTasks = (status: 'todo' | 'completed') => {
    return tasks.filter(task => {
      const isCompleted = task.completions.length > 0 && task.completions[0].completed;
      return status === 'completed' ? isCompleted : !isCompleted;
    });
  };

  const todoTasks = getTasks('todo');
  const completedTasks = getTasks('completed');

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">업무 목록</h1>
          <div className="flex space-x-3">
            <Link href="/tasks/analyze">
              <Button variant="outline">업무 쪽지 분석</Button>
            </Link>
            <Link href="/tasks/create">
              <Button>새 업무 추가</Button>
            </Link>
          </div>
        </div>

        <div className="space-y-8">
          {/* 할 일 업무 */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">할 일 ({todoTasks.length})</h2>
            
            {todoTasks.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">할 일이 없습니다.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
                {todoTasks.map((task) => (
                  <div key={task.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div
                          className="h-4 w-4 rounded-full mt-1"
                          style={{ backgroundColor: getCategoryColor(task.category) }}
                        />
                        <div>
                          <h3 className="text-base font-medium text-gray-900 dark:text-white">
                            <Link href={`/tasks/${task.id}`} className="hover:underline">
                              {task.title}
                            </Link>
                          </h3>
                          <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>{getCategoryLabel(task.category)}</span>
                            {task.dueDate && (
                              <span>• {formatDate(task.dueDate)}</span>
                            )}
                            {task.location && (
                              <span>• {task.location}</span>
                            )}
                            {task.room && (
                              <span>• {task.room.name}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <form action={`/api/tasks/${task.id}/complete`} method="POST">
                        <button
                          type="submit"
                          className="h-5 w-5 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          aria-label="완료로 표시"
                        />
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 완료된 업무 */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">완료됨 ({completedTasks.length})</h2>
            
            {completedTasks.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">완료된 업무가 없습니다.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
                {completedTasks.map((task) => (
                  <div key={task.id} className="p-6 opacity-70">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div
                          className="h-4 w-4 rounded-full mt-1"
                          style={{ backgroundColor: getCategoryColor(task.category) }}
                        />
                        <div>
                          <h3 className="text-base font-medium text-gray-900 dark:text-white line-through">
                            <Link href={`/tasks/${task.id}`} className="hover:underline">
                              {task.title}
                            </Link>
                          </h3>
                          <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>{getCategoryLabel(task.category)}</span>
                            {task.dueDate && (
                              <span>• {formatDate(task.dueDate)}</span>
                            )}
                            {task.location && (
                              <span>• {task.location}</span>
                            )}
                            {task.room && (
                              <span>• {task.room.name}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <form action={`/api/tasks/${task.id}/complete`} method="POST">
                        <input type="hidden" name="completed" value="false" />
                        <button
                          type="submit"
                          className="h-5 w-5 rounded border border-gray-300 dark:border-gray-600 bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          aria-label="미완료로 표시"
                        />
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 