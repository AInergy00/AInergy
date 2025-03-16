'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';

export default function CreateRoomPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false,
    inviteCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    setLoading(true);
    setError('');

    // 유효성 검사
    if (!formData.name.trim()) {
      setError('방 이름은 필수입니다.');
      setLoading(false);
      return;
    }

    if (formData.isPrivate && !formData.inviteCode) {
      setError('비공개 방은 초대 코드가 필요합니다.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '방 생성 중 오류가 발생했습니다.');
      }

      router.push(`/rooms/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '방 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">새 스터디룸 만들기</h1>
        
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
              disabled={loading}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? '생성 중...' : '방 만들기'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
} 