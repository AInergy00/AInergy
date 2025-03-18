'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { MembersList } from '@/components/rooms/MembersList';
import { TasksList } from '@/components/tasks/TasksList';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

interface Room {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  members: Array<{
    id: string;
    role: string;
    joinedAt: string;
    user: {
      id: string;
      name: string;
      email?: string;
    }
  }>;
  tasks: Array<{
    id: string;
    title: string;
    description: string | null;
    category: string;
    priority: string;
    status: string;
    dueDate: string | null;
    createdAt: string;
    completions: Array<{
      id: string;
      completed: boolean;
      completedAt: string | null;
      userId: string;
    }>
  }>;
}

export default function RoomPage() {
  const router = useRouter();
  const { id } = useParams();
  const { data: session, status } = useSession();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }

    if (status === 'authenticated' && id) {
      fetchRoom();
    }
  }, [status, id]);

  const fetchRoom = async () => {
    try {
      const response = await fetch(`/api/rooms/${id}`);
      
      if (!response.ok) {
        throw new Error('방 정보를 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      setRoom(data);
      
      // 현재 사용자의 역할 찾기
      if (session?.user?.id) {
        const userMember = data.members.find((member: any) => 
          member.user.id === session.user.id
        );
        
        if (userMember) {
          setUserRole(userMember.role);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      console.error('방 정보 로딩 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
        <p>{error}</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
        <p>방을 찾을 수 없습니다.</p>
      </div>
    );
  }

  // 방장(admin) 찾기
  const roomAdmin = room.members.find(member => member.role === 'admin');
  const adminName = roomAdmin?.user?.name || '알 수 없음';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{room.name}</h1>
          <p className="text-sm text-muted-foreground">
            {roomAdmin && (
              <>방장: {adminName} · </>
            )}
            생성일: {format(new Date(room.createdAt), 'PPP', { locale: ko })}
          </p>
        </div>
        {userRole === 'admin' && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href={`/rooms/${room.id}/edit`}>
              <Button variant="outline">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                방 설정
              </Button>
            </Link>
          </motion.div>
        )}
      </div>

      {room.description && (
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">{room.description}</p>
        </Card>
      )}

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tasks">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            작업 목록
          </TabsTrigger>
          <TabsTrigger value="members">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            구성원
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tasks" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">작업 목록</h2>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href={`/tasks/create?roomId=${room.id}`}>
                <Button size="sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
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
                  작업 추가
                </Button>
              </Link>
            </motion.div>
          </div>
          <TasksList tasks={room.tasks} roomId={room.id} />
        </TabsContent>
        <TabsContent value="members" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">구성원</h2>
            {userRole === 'admin' && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href={`/rooms/${room.id}/invite`}>
                  <Button size="sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                    초대
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
          <MembersList members={room.members} roomId={room.id} currentUserRole={userRole} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
} 