'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';

export default function EditRoomPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const roomId = params.id;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false,
    inviteCode: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}`);
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || '방 정보를 불러오는데 실패했습니다.');
        }
        
        const roomData = await response.json();
        setFormData({
          name: roomData.name || '',
          description: roomData.description || '',
          isPrivate: roomData.isPrivate || false,
          inviteCode: roomData.inviteCode || '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : '방 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoom();
  }, [roomId]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
    
    // 비공개 설정을 해제하면 초대 코드도 초기화
    if (name === 'isPrivate' && !checked) {
      setFormData(prev => ({ ...prev, inviteCode: '' }));
    }
  };
  
  const generateInviteCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setFormData(prev => ({ ...prev, inviteCode: code }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    // 유효성 검사
    if (!formData.name.trim()) {
      setError('방 이름은 필수입니다.');
      setSaving(false);
      return;
    }
    
    if (formData.isPrivate && !formData.inviteCode) {
      setError('비공개 방은 초대 코드가 필요합니다.');
      setSaving(false);
      return;
    }
    
    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '방 수정 중 오류가 발생했습니다.');
      }
      
      router.push(`/rooms/${roomId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '방 수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
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
  
  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="flex items-center space-x-2 mb-6">
          <Link href={`/rooms/${roomId}`}>
            <Button variant="ghost" size="sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              뒤로
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">스터디룸 설정</h1>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block mb-2 font-medium">
              방 이름 *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="스터디룸 이름을 입력하세요"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block mb-2 font-medium">
              설명
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="스터디룸에 대한 설명을 입력하세요"
              rows={3}
            />
          </div>
          
          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPrivate"
                name="isPrivate"
                checked={formData.isPrivate}
                onChange={handleCheckboxChange}
                className="mr-2"
              />
              <label htmlFor="isPrivate" className="font-medium">
                비공개 방
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              비공개 방은 초대 코드가 있는 사용자만 참여할 수 있습니다.
            </p>
          </div>
          
          {formData.isPrivate && (
            <div className="mb-4">
              <label htmlFor="inviteCode" className="block mb-2 font-medium">
                초대 코드
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="inviteCode"
                  name="inviteCode"
                  value={formData.inviteCode}
                  onChange={handleChange}
                  className="flex-1 p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="초대 코드"
                />
                <button
                  type="button"
                  onClick={generateInviteCode}
                  className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-r"
                >
                  생성
                </button>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={saving}
            >
              {saving ? '저장 중...' : '저장'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
} 