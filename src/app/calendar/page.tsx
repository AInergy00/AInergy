'use client';

import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import toast from 'react-hot-toast';
import 'moment/locale/ko';
import { Card, CardContent } from '@/components/ui/Card';
import { useSession } from 'next-auth/react';

moment.locale('ko');
const localizer = momentLocalizer(moment);

interface TaskEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  roomName?: string;
  category: string;
  resourceId?: string;
}

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  category?: string;
  description?: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<TaskEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('month');
  const router = useRouter();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks');
        if (!res.ok) {
          throw new Error('일정을 불러오는데 실패했습니다.');
        }
        
        const tasks = await res.json();
        
        // 업무를 캘린더 이벤트로 변환
        const taskEvents = tasks
          .filter((task: any) => task.dueDate)
          .map((task: any) => {
            // 날짜 문자열을 Date 객체로 변환
            const dueDate = new Date(task.dueDate);
            
            // 종료 시간은 시작 시간에 1시간 추가
            const endDate = new Date(dueDate);
            endDate.setHours(endDate.getHours() + 1);
            
            return {
              id: task.id,
              title: task.title,
              start: dueDate,
              end: endDate,
              allDay: !task.time, // 시간이 지정되지 않았으면 종일 이벤트로 설정
              roomName: task.room?.name,
              category: task.category,
              resourceId: task.roomId,
            };
          });
          
        setEvents(taskEvents);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setLoading(false);
        toast.error('일정을 불러오는데 실패했습니다.');
      }
    };
    
    fetchTasks();
  }, []);

  const handleEventClick = (event: TaskEvent) => {
    // 이벤트 클릭 시 해당 업무 상세 페이지로 이동
    router.push(`/tasks/${event.id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <PageHeader
          title="캘린더"
          description="모든 일정을 한눈에 확인하세요"
        />
        <Button 
          onClick={() => router.push('/tasks/create')} 
          className="ml-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          일정 추가
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex mb-4 justify-end">
            <div className="space-x-2">
              <Button 
                size="sm" 
                variant={view === 'month' ? 'default' : 'outline'}
                onClick={() => setView('month')}
              >
                월별
              </Button>
              <Button 
                size="sm" 
                variant={view === 'week' ? 'default' : 'outline'}
                onClick={() => setView('week')}
              >
                주별
              </Button>
              <Button 
                size="sm" 
                variant={view === 'day' ? 'default' : 'outline'}
                onClick={() => setView('day')}
              >
                일별
              </Button>
            </div>
          </div>
          
          <div className="h-[600px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              view={view as any}
              onView={(newView: string) => setView(newView)}
              messages={{
                today: '오늘',
                previous: '이전',
                next: '다음',
                month: '월',
                week: '주',
                day: '일',
                agenda: '일정',
                date: '날짜',
                time: '시간',
                event: '이벤트',
                noEventsInRange: '이 기간에 일정이 없습니다',
              }}
              eventPropGetter={(event: Event) => {
                let backgroundColor = '#3B82F6';  // 기본 파란색
                
                // 카테고리에 따라 색상 적용
                switch(event.category) {
                  case 'MEETING':
                    backgroundColor = '#EC4899';  // 분홍색
                    break;
                  case 'BUSINESS_TRIP':
                    backgroundColor = '#8B5CF6';  // 보라색
                    break;
                  case 'TRAINING':
                    backgroundColor = '#10B981';  // 초록색
                    break;
                  case 'EVENT':
                    backgroundColor = '#F59E0B';  // 주황색
                    break;
                  case 'CLASSROOM':
                    backgroundColor = '#6366F1';  // 인디고
                    break;
                  default:
                    break;
                }

                return {
                  style: {
                    backgroundColor,
                    borderRadius: '4px',
                    opacity: 0.8,
                    color: '#fff',
                    border: '0px',
                    display: 'block',
                  },
                };
              }}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
} 