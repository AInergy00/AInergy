'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils/date';
import { motion } from 'framer-motion';

type Room = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  members: Array<{ user: { name: string } }>;
  _count: { members: number; tasks: number };
};

export default function RoomsPage() {
  const { data: session, status } = useSession();
  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [joinedRooms, setJoinedRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (status === 'loading' || loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-muted-foreground">로딩 중...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">공유 방</h1>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/rooms/create">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                방 만들기
              </Button>
            </Link>
          </motion.div>
        </div>

        {myRooms.length === 0 && joinedRooms.length === 0 ? (
          <motion.div 
            className="flex flex-col items-center justify-center bg-card rounded-lg shadow-sm p-10 space-y-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6 rounded-full bg-accent/10 text-accent">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">아직 생성하거나 참여한 공유 방이 없습니다.</h3>
              <p className="text-muted-foreground">새로운 방을 만들고 동료들과 함께 협업해보세요!</p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/rooms/create">
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  새 방 만들기
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {myRooms.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  내가 만든 방
                </h2>
                <motion.div 
                  className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {myRooms.map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      isOwner={true}
                    />
                  ))}
                </motion.div>
              </div>
            )}

            {joinedRooms.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  참여 중인 방
                </h2>
                <motion.div 
                  className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {joinedRooms.map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      isOwner={false}
                    />
                  ))}
                </motion.div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

function RoomCard({ room, isOwner }: { room: Room; isOwner: boolean }) {
  // admin 역할을 가진 멤버(방장)가 있는지 확인하고 이름 가져오기
  const ownerName = room.members && room.members[0]?.user?.name || '알 수 없음';

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="card"
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">
            {room.name}
          </h3>
          {isOwner && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-accent">
              소유자
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {room.description || '설명이 없습니다.'}
        </p>
        <div className="mt-4 flex items-center text-sm text-muted-foreground">
          <span className="flex items-center">
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            {room._count.members} 명
          </span>
          <span className="ml-4 flex items-center">
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            업무 {room._count.tasks}개
          </span>
        </div>
      </div>
      <div className="bg-muted/30 px-5 py-3 flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          {!isOwner && <span>방장: {ownerName}</span>}
          {isOwner && <span>생성일: {formatDate(room.createdAt, 'yyyy.MM.dd')}</span>}
        </div>
        <Link href={`/rooms/${room.id}`}>
          <Button variant="outline" size="sm" className="hover:bg-accent/10 hover:text-accent border-border">
            입장
          </Button>
        </Link>
      </div>
    </motion.div>
  );
} 