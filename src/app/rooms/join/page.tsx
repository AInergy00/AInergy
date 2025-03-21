'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';

export default function JoinRoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeParam = searchParams.get('code');
  
  const [inviteCode, setInviteCode] = useState(codeParam || '');
  const [loading, setLoading] = useState(!!codeParam);
  const [checking, setChecking] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [room, setRoom] = useState<any>(null);
  
  // 초기 URL 파라미터로 초대 코드가 제공된 경우 자동으로 확인
  useEffect(() => {
    if (codeParam) {
      checkInviteCode();
    }
  }, [codeParam]);
  
  const checkInviteCode = async () => {
    if (!inviteCode.trim()) {
      setError('초대 코드를 입력해주세요.');
      return;
    }
    
    setChecking(true);
    setError('');
    
    try {
      const response = await fetch(`/api/rooms/check-invite?code=${inviteCode}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '초대 코드 확인에 실패했습니다.');
      }
      
      const roomData = await response.json();
      setRoom(roomData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '초대 코드 확인에 실패했습니다.');
      setRoom(null);
    } finally {
      setChecking(false);
      setLoading(false);
    }
  };
  
  const handleJoinRoom = async () => {
    if (!room) return;
    
    setJoining(true);
    setError('');
    
    try {
      console.log(`방 참여 요청: 방 ID ${room.id}, 초대 코드: ${inviteCode}`);
      
      // 요청 데이터 준비
      const requestData = { inviteCode };
      console.log('요청 데이터:', requestData);
      
      const response = await fetch(`/api/rooms/${room.id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      // 응답 상태 로깅
      console.log(`응답 상태: ${response.status} ${response.statusText}`);
      
      // 응답 본문 파싱
      let data;
      try {
        data = await response.json();
        console.log('응답 데이터:', data);
      } catch (parseError) {
        console.error('응답 파싱 오류:', parseError);
        throw new Error('응답을 처리할 수 없습니다.');
      }
      
      if (!response.ok) {
        // 오류 응답 처리
        const errorMessage = data?.error || '방 참여에 실패했습니다.';
        console.error(`방 참여 실패 (${response.status}): ${errorMessage}`, data);
        throw new Error(errorMessage);
      }
      
      console.log('방 참여 성공:', data);
      router.push(`/rooms/${room.id}`);
    } catch (err) {
      console.error('방 참여 오류:', err);
      setError(err instanceof Error ? err.message : '방 참여에 실패했습니다.');
    } finally {
      setJoining(false);
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500 dark:text-gray-400">초대 코드 확인 중...</div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-md mx-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="flex items-center space-x-2 mb-6">
          <Link href="/rooms">
            <Button variant="ghost" size="sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              협업 공간 목록
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">협업 공간 참여</h1>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {!room ? (
          <div>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              초대 코드를 입력하여 협업 공간에 참여하세요.
            </p>
            
            <div className="mb-4">
              <label htmlFor="inviteCode" className="block mb-2 font-medium">
                초대 코드
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="inviteCode"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="flex-1 p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="초대 코드를 입력하세요"
                />
                <Button
                  onClick={checkInviteCode}
                  disabled={checking || !inviteCode.trim()}
                  className="rounded-l-none"
                >
                  {checking ? '확인 중...' : '확인'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded">
              <h2 className="text-xl font-semibold mb-2">{room.name}</h2>
              {room.description && (
                <p className="text-gray-600 dark:text-gray-300 mb-2">{room.description}</p>
              )}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                방장: {room.ownerName || '알 수 없음'}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setRoom(null);
                  setInviteCode('');
                }}
                disabled={joining}
              >
                취소
              </Button>
              <Button
                onClick={handleJoinRoom}
                disabled={joining}
              >
                {joining ? '참여 중...' : '참여하기'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 