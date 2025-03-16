import { Layout } from '@/components/layout/Layout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isSameMonth, parseISO, isValid } from 'date-fns';
import { getCategoryColor } from '@/lib/utils/theme';
import { formatDate } from '@/lib/utils/date';

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // 현재 날짜 또는 URL 파라미터에서 가져온 날짜로 초기화
  const currentDate = new Date();
  
  // Next.js 15.2 이상에서는 searchParams를 await로 처리
  const params = await searchParams;
  const monthStr = params?.month ? String(params.month) : null;
  const yearStr = params?.year ? String(params.year) : null;
  
  const month = monthStr
    ? parseInt(monthStr) - 1 // Date 객체는 0부터 시작하므로 1을 빼줍니다
    : currentDate.getMonth();
  const year = yearStr
    ? parseInt(yearStr)
    : currentDate.getFullYear();

  const firstDayOfMonth = startOfMonth(new Date(year, month));
  const lastDayOfMonth = endOfMonth(new Date(year, month));

  // 해당 월의 모든 날짜 배열 생성
  const days = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });

  // 첫 번째 날의 요일 (0: 일요일, 1: 월요일, ..., 6: 토요일)
  const startDay = getDay(firstDayOfMonth);

  // 이번 달과 다음 달 URL 생성
  const prevMonth = month === 0 ? 12 : month;
  const prevYear = month === 0 ? year - 1 : year;
  const nextMonth = month === 11 ? 1 : month + 2; // month는 0부터 시작하므로 +2
  const nextYear = month === 11 ? year + 1 : year;

  // 사용자의 모든 업무 가져오기 (현재 월 기준)
  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        {
          isShared: true,
          room: {
            members: {
              some: {
                userId: session.user.id,
              },
            },
          },
        },
      ],
      dueDate: {
        gte: firstDayOfMonth,
        lte: lastDayOfMonth,
      },
    },
    orderBy: [
      { dueDate: 'asc' },
      { startTime: 'asc' },
      { createdAt: 'asc' },
    ],
    include: {
      room: true,
      completions: {
        where: {
          userId: session.user.id,
        },
      },
    },
  });

  // 날짜별 업무 분류
  const tasksByDate = days.reduce((acc, day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayTasks = tasks.filter(
      (task) => task.dueDate && format(new Date(task.dueDate), 'yyyy-MM-dd') === dateStr
    );
    acc[dateStr] = dayTasks;
    return acc;
  }, {} as Record<string, typeof tasks>);

  // 수정된 시간 포맷팅 함수
  const formatTimeIfValid = (timeStr: any): string => {
    if (!timeStr) return '';
    
    try {
      // 문자열이면 parseISO, 아니면 그대로 사용
      let date;
      if (typeof timeStr === 'string') {
        date = parseISO(timeStr);
      } else if (timeStr instanceof Date) {
        date = timeStr;
      } else {
        // Date 객체로 변환 시도
        date = new Date(timeStr);
      }
      
      if (isValid(date)) {
        return format(date, 'HH:mm');
      }
      return '';
    } catch (error) {
      console.error('Invalid date format:', timeStr);
      return '';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">일정 캘린더</h1>
          <div className="flex items-center space-x-4">
            <Link href={`/calendar?month=${prevMonth}&year=${prevYear}`}>
              <Button variant="outline" size="sm">
                이전 달
              </Button>
            </Link>
            <h2 className="text-xl font-semibold">
              {format(new Date(year, month), 'yyyy년 M월')}
            </h2>
            <Link href={`/calendar?month=${nextMonth}&year=${nextYear}`}>
              <Button variant="outline" size="sm">
                다음 달
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-7 gap-px border-b border-gray-200 dark:border-gray-700">
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <div
                key={day}
                className="py-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
            {/* 첫번째 날 이전의 빈 칸 */}
            {Array.from({ length: startDay }).map((_, index) => (
              <div key={`empty-start-${index}`} className="bg-gray-50 dark:bg-gray-800 min-h-[120px]" />
            ))}

            {/* 날짜 표시 */}
            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayTasks = tasksByDate[dateStr] || [];
              const isCurrentMonth = isSameMonth(day, new Date(year, month));
              const isTodayDate = isToday(day);

              return (
                <div
                  key={dateStr}
                  className={`bg-white dark:bg-gray-800 min-h-[120px] p-2 ${
                    isTodayDate ? 'ring-2 ring-primary-500 dark:ring-primary-400' : ''
                  } ${!isCurrentMonth ? 'opacity-50' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <span
                      className={`text-sm font-medium ${
                        isTodayDate
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                    <Link href={`/tasks/create?date=${dateStr}`}>
                      <button className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
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
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                    </Link>
                  </div>
                  <div className="mt-1 space-y-1 max-h-[90px] overflow-y-auto">
                    {dayTasks.slice(0, 3).map((task) => {
                      const isCompleted = task.completions.length > 0 && task.completions[0].completed;
                      return (
                        <Link key={task.id} href={`/tasks/${task.id}`}>
                          <div
                            className={`px-2 py-1 text-xs rounded-md truncate ${
                              isCompleted
                                ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 line-through'
                                : 'bg-opacity-10 text-gray-900 dark:text-white'
                            }`}
                            style={{
                              backgroundColor: `${getCategoryColor(task.category)}${
                                isCompleted ? '20' : '20'
                              }`,
                              borderLeft: `3px solid ${getCategoryColor(task.category)}`,
                            }}
                          >
                            {task.startTime && (
                              <span className="mr-1 font-medium">
                                {formatTimeIfValid(task.startTime)}
                              </span>
                            )}
                            {task.title}
                          </div>
                        </Link>
                      );
                    })}
                    {dayTasks.length > 3 && (
                      <Link href={`/tasks?date=${dateStr}`}>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          + {dayTasks.length - 3}개 더 보기
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}

            {/* 마지막 날 이후의 빈 칸 */}
            {Array.from({ length: 42 - days.length - startDay }).map((_, index) => (
              <div key={`empty-end-${index}`} className="bg-gray-50 dark:bg-gray-800 min-h-[120px]" />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
} 