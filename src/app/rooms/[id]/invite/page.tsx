'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const roomId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}`);
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || '협업 공간 정보를 불러오는데 실패했습니다.');
        }
        
        const roomData = await response.json();
        setRoom(roomData);
        setInviteCode(roomData.password || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : '협업 공간 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoom();
  }, [roomId]);
  
  const handleGenerateInviteCode = async () => {
    setIsGenerating(true);
    setError('');
    
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    try {
      const response = await fetch(`/api/rooms/${roomId}/update-invite-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inviteCode: code }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '초대 코드 생성에 실패했습니다.');
      }
      
      const updatedRoom = await response.json();
      setRoom(updatedRoom);
      setInviteCode(updatedRoom.inviteCode || updatedRoom.password || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : '초대 코드 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/rooms/join?code=${inviteCode}`;
    navigator.clipboard.writeText(inviteLink);
    setIsCopied(true);
    
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500 dark:text-gray-400">로딩 중...</div>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <div className="max-w-md mx-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="text-red-500 mb-4">{error}</div>
          <Button onClick={() => router.back()}>돌아가기</Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-md mx-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="flex items-center space-x-2 mb-6">
          <Link href={`/rooms/${roomId}`}>
            <Button variant="ghost" size="sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              뒤로
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{room?.name} - 초대하기</h1>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium mb-2">초대 링크</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              아래 링크를 공유하여 다른 사람을 초대할 수 있습니다.
            </p>
            
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/rooms/join?code=${inviteCode}`}
                  readOnly
                  className="w-full p-2 pr-24 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  onClick={copyInviteLink}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  {isCopied ? '복사됨!' : '복사'}
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-medium mb-2">초대 코드</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              다른 사람은 이 코드를 사용하여 협업 공간에 참여할 수 있습니다.
            </p>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={inviteCode}
                readOnly
                className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <Button
                onClick={handleGenerateInviteCode}
                disabled={isGenerating}
              >
                {isGenerating ? '생성 중...' : '새로 생성'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 