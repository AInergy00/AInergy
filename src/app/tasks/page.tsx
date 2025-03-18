'use client';

import { useEffect, useState } from 'react';
import { TasksList } from '@/components/tasks/TasksList';
import { Button } from '@/components/ui/Button';
import { Plus, CheckCircle, Circle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

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
  roomId: string | null;
  createdAt: string;
  completions?: TaskCompletion[];
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks');
        
        if (!res.ok) {
          throw new Error('업무를 불러오는데 실패했습니다.');
        }
        
        const data = await res.json();
        setTasks(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('업무를 불러오는데 실패했습니다.');
        setLoading(false);
        toast.error('업무를 불러오는데 실패했습니다.');
      }
    };
    
    fetchTasks();
  }, []);

  const todoTasks = tasks.filter(task => !(task.completions && task.completions.length > 0 && task.completions[0]?.completed));
  const completedTasks = tasks.filter(task => task.completions && task.completions.length > 0 && task.completions[0]?.completed);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div 
          className="flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
          <p className="text-lg text-primary/80 font-medium">로딩 중...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader
          title="업무 목록"
          description="할 일과 완료된 업무를 관리하세요"
          actions={
            <Button 
              onClick={() => window.location.reload()} 
              className="flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              다시 시도
            </Button>
          }
        />
        
        <motion.div 
          className="bg-destructive/10 text-destructive p-6 rounded-lg mb-6 border border-destructive/20 shadow-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
        </motion.div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="업무 목록"
        description="할 일과 완료된 업무를 관리하세요"
        actions={
          <Button 
            onClick={() => router.push('/tasks/create')} 
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            업무 추가
          </Button>
        }
      />

      <Card className="mt-6">
        <CardHeader className="pb-3">
          <Tabs defaultValue="todo" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="todo" className="flex items-center gap-2">
                <Circle className="h-4 w-4" />
                할 일 <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-xs font-medium text-primary">{todoTasks.length}</span>
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                완료됨 <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-xs font-medium text-primary">{completedTasks.length}</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="todo" className="mt-6">
              <AnimatePresence>
                {todoTasks.length > 0 ? (
                  <TasksList tasks={todoTasks} roomId="" />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex flex-col items-center justify-center py-12 px-4"
                  >
                    <div className="rounded-full bg-primary/10 p-3 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-muted-foreground text-sm">완료하지 않은 업무가 없습니다</p>
                    <Button 
                      variant="outline" 
                      onClick={() => router.push('/tasks/create')} 
                      className="mt-4"
                      size="sm"
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      새 업무 만들기
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
            
            <TabsContent value="completed" className="mt-6">
              <AnimatePresence>
                {completedTasks.length > 0 ? (
                  <TasksList tasks={completedTasks} roomId="" />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex flex-col items-center justify-center py-12 px-4"
                  >
                    <div className="rounded-full bg-primary/10 p-3 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-muted-foreground text-sm">완료된 업무가 없습니다</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </>
  );
}