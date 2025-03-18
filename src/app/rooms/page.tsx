'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertCircle, Plus, RefreshCw, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { PageHeader } from '@/components/layout/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useRooms } from '@/hooks/use-rooms';
import { formatDate } from '@/lib/utils/date';
import { redirect } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { RoomSkeleton } from '@/components/ui/Skeleton';

// Room interface definition
interface Room {
  id: string;
  name: string;
  description?: string;
  inviteCode?: string;
  createdAt: string;
  updatedAt: string;
  isPrivate?: boolean;
  _count?: {
    members?: number;
    tasks?: number;
  };
}

export default function RoomsPage() {
  const { data: session, status } = useSession();
  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [joinedRooms, setJoinedRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { rooms, isLoading, isError, refetch } = useRooms();
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login');
    }

    if (status === 'authenticated') {
      fetchRooms();
    }
  }, [status]);

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms');
      if (!response.ok) {
        throw new Error('방 목록을 불러오는데 실패했습니다.');
      }
      const data = await response.json();
      setMyRooms(data.myRooms || []);
      setJoinedRooms(data.joinedRooms || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      console.error('방 목록 로딩 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const createRoom = async () => {
    try {
      setIsCreatingRoom(true);
      const response = await axios.post('/api/rooms');
      if (response.status === 200) {
        toast.success('방이 성공적으로 생성되었습니다.');
        fetchRooms();
        router.push(`/rooms/${response.data.id}`);
      }
    } catch (err) {
      toast.error('방 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  if (status === 'loading' || loading) {
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
      <div className="space-y-8">
        <div className="mb-6 flex items-center justify-between">
          <PageHeader 
            title="협업 공간" 
            description="팀원들과 함께 작업할 수 있는 공간입니다"
          />
          <Button onClick={() => fetchRooms()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            새로고침
          </Button>
        </div>
        
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
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <PageHeader 
          title="협업 공간" 
          description="팀원들과 함께 작업할 수 있는 공간입니다"
        />
        <Button onClick={() => setIsCreatingRoom(true)}>
          <Plus className="w-4 h-4 mr-2" />
          새 공간 만들기
        </Button>
      </div>

      {myRooms.length === 0 && joinedRooms.length === 0 ? (
        <motion.div 
          className="flex flex-col items-center justify-center bg-card/50 backdrop-blur-sm rounded-xl shadow-xl border border-accent/10 p-12 space-y-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="p-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-primary shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-semibold">아직 협업 공간이 없습니다</h3>
            <p className="text-muted-foreground max-w-md">새로운 공간을 만들고 동료들과 함께 프로젝트를 관리하고 아이디어를 공유해보세요!</p>
          </div>
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-75"></div>
            <Button 
              onClick={createRoom}
              disabled={isCreatingRoom}
              className="relative bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg"
            >
              새 공간 만들기
            </Button>
          </motion.div>
        </motion.div>
      ) : (
        <div className="space-y-10">
          {myRooms.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                내가 만든 공간
              </h2>
              <motion.div 
                className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {myRooms.map((room, index) => (
                  <RoomCard key={room.id} room={room} isOwner={true} index={index} />
                ))}
              </motion.div>
            </motion.div>
          )}

          {joinedRooms.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-accent" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                참여 중인 공간
              </h2>
              <motion.div 
                className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {joinedRooms.map((room, index) => (
                  <RoomCard key={room.id} room={room} isOwner={false} index={index} />
                ))}
              </motion.div>
            </motion.div>
          )}
        </div>
      )}
    </>
  );
}

function RoomCard({ room, isOwner, index }: { room: Room; isOwner: boolean; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/rooms/${room.id}`} className="block h-full">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>{room.name}</CardTitle>
            {room.description && (
              <CardDescription>{room.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center space-x-3">
                <span className="text-muted-foreground flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {room._count?.members || 0}
                </span>
                <span className="text-muted-foreground flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {room._count?.tasks || 0}
                </span>
              </div>
              <span className="text-muted-foreground">{formatDate(room.createdAt)}</span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
} 