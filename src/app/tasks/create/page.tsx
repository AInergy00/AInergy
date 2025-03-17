'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { TaskCategory, TaskPriority } from '@prisma/client';
import { categoryLabels, priorityLabels } from '@/lib/utils/theme';

export default function CreateTaskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomIdParam = searchParams.get('roomId');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiProvider, setAiProvider] = useState<'openai' | 'gemini'>('openai');
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [rooms, setRooms] = useState<{ id: string; name: string }[]>([]);
  
  // roomId가 URL에서 제공되면 자동으로 isShared를 true로 설정
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'TASK' as TaskCategory,
    priority: 'MEDIUM' as TaskPriority,
    dueDate: '',
    startTime: '',
    endTime: '',
    location: '',
    materials: '',
    notes: '',
    fileUrl: '',
    linkUrl: '',
    isShared: roomIdParam ? true : false,
    roomId: roomIdParam || '',
  });

  // 방 목록 가져오기
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('/api/rooms');
        if (response.ok) {
          const data = await response.json();
          // API 응답 구조가 { myRooms, joinedRooms } 형태이므로 이를 합친 배열 생성
          const allRooms = [
            ...(Array.isArray(data.myRooms) ? data.myRooms : []),
            ...(Array.isArray(data.joinedRooms) ? data.joinedRooms : [])
          ];
          console.log('사용 가능한 방 목록:', allRooms);
          setRooms(allRooms);
        } else {
          console.error('방 목록 가져오기 실패:', await response.text());
        }
      } catch (error) {
        console.error('방 목록 가져오기 오류:', error);
      }
    };

    fetchRooms();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // 시간 필드인 경우 10분 단위로 조정
    if ((name === 'startTime' || name === 'endTime') && value) {
      const [hours, minutes] = value.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        // 분을 10분 단위로 반올림
        const roundedMinutes = Math.round(minutes / 10) * 10;
        // 59분 초과되면 00분으로 조정
        const adjustedMinutes = roundedMinutes >= 60 ? 0 : roundedMinutes;
        // 시간 형식으로 변환 (두 자리 숫자로 맞춤)
        const formattedTime = `${hours.toString().padStart(2, '0')}:${adjustedMinutes.toString().padStart(2, '0')}`;
        
        setFormData({
          ...formData,
          [name]: formattedTime,
        });
        return;
      }
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    // isShared 체크박스가 해제될 때, roomId도 함께 초기화
    if (name === 'isShared' && !checked) {
      setFormData({
        ...formData,
        isShared: false,
        roomId: ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: checked,
      });
    }
  };

  // roomId가 선택되면 자동으로 isShared를 true로 설정
  const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    
    setFormData({
      ...formData,
      roomId: value,
      isShared: value ? true : false
    });
  };

  const handleGenerateNote = async () => {
    const { title, category, dueDate, startTime, endTime, location, materials, notes } = formData;

    if (!title || !category || !dueDate) {
      setError('제목, 분류, 날짜는 필수 입력 항목입니다.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskData: {
            title,
            category,
            dueDate,
            startTime,
            endTime,
            location,
            materials,
            notes,
          },
          provider: aiProvider,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '업무 쪽지 생성 중 오류가 발생했습니다.');
      }

      const data = await response.json();
      setGeneratedContent(data.content);
    } catch (error) {
      setError(error instanceof Error ? error.message : '업무 쪽지 생성 중 오류가 발생했습니다.');
      console.error('업무 쪽지 생성 오류:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { title, category, dueDate } = formData;

    if (!title || !category || !dueDate) {
      setError('제목, 분류, 날짜는 필수 입력 항목입니다.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const dataToSubmit: Record<string, any> = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        dueDate: formData.dueDate,
        location: formData.location,
        materials: formData.materials,
        notes: formData.notes,
        fileUrl: formData.fileUrl,
        linkUrl: formData.linkUrl,
        isShared: formData.isShared
      };
      
      if (formData.startTime && formData.startTime.trim() !== '') {
        dataToSubmit.startTime = formData.startTime;
      }
      
      if (formData.endTime && formData.endTime.trim() !== '') {
        dataToSubmit.endTime = formData.endTime;
      }
      
      if (formData.roomId && formData.roomId.trim() !== '') {
        dataToSubmit.roomId = formData.roomId;
      }

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '업무 저장 중 오류가 발생했습니다.');
      }

      // roomId가 있으면 해당 방 페이지로 리디렉션, 없으면 업무 목록으로
      if (formData.roomId) {
        router.push(`/rooms/${formData.roomId}`);
      } else {
        router.push('/tasks');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '업무 저장 중 오류가 발생했습니다.');
      console.error('업무 저장 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">업무 쪽지 작성</h1>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
                <div className="flex">
                  <div className="text-sm text-red-700 dark:text-red-400">{error}</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  제목 *
                </label>
                <div className="mt-1">
                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-900 dark:text-white"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  분류 *
                </label>
                <div className="mt-1">
                  <select
                    id="category"
                    name="category"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-900 dark:text-white"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  중요도
                </label>
                <div className="mt-1">
                  <select
                    id="priority"
                    name="priority"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-900 dark:text-white"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    {Object.entries(priorityLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  날짜 *
                </label>
                <div className="mt-1">
                  <input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-900 dark:text-white"
                    value={formData.dueDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  시작 시간
                </label>
                <div className="mt-1">
                  <div className="flex items-center">
                    <select
                      id="startTime-hour"
                      name="startTime-hour"
                      className="appearance-none block w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-l-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-900 dark:text-white"
                      value={formData.startTime ? formData.startTime.split(':')[0] : ''}
                      onChange={(e) => {
                        const hours = e.target.value;
                        const mins = formData.startTime ? formData.startTime.split(':')[1] : '00';
                        const newTime = hours ? `${hours}:${mins}` : '';
                        setFormData({
                          ...formData,
                          startTime: newTime
                        });
                      }}
                    >
                      <option value="">시</option>
                      {Array.from({length: 24}, (_, i) => i).map(hour => (
                        <option key={hour} value={hour.toString().padStart(2, '0')}>
                          {hour.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    <span className="mx-1">:</span>
                    <select
                      id="startTime-minute"
                      name="startTime-minute"
                      className="appearance-none block w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-r-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-900 dark:text-white"
                      value={formData.startTime ? formData.startTime.split(':')[1] : ''}
                      onChange={(e) => {
                        const mins = e.target.value;
                        const hours = formData.startTime ? formData.startTime.split(':')[0] : '00';
                        const newTime = hours ? `${hours}:${mins}` : '';
                        setFormData({
                          ...formData,
                          startTime: newTime
                        });
                      }}
                    >
                      <option value="">분</option>
                      {Array.from({length: 6}, (_, i) => i * 10).map(minute => (
                        <option key={minute} value={minute.toString().padStart(2, '0')}>
                          {minute.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  종료 시간
                </label>
                <div className="mt-1">
                  <div className="flex items-center">
                    <select
                      id="endTime-hour"
                      name="endTime-hour"
                      className="appearance-none block w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-l-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-900 dark:text-white"
                      value={formData.endTime ? formData.endTime.split(':')[0] : ''}
                      onChange={(e) => {
                        const hours = e.target.value;
                        const mins = formData.endTime ? formData.endTime.split(':')[1] : '00';
                        const newTime = hours ? `${hours}:${mins}` : '';
                        setFormData({
                          ...formData,
                          endTime: newTime
                        });
                      }}
                    >
                      <option value="">시</option>
                      {Array.from({length: 24}, (_, i) => i).map(hour => (
                        <option key={hour} value={hour.toString().padStart(2, '0')}>
                          {hour.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    <span className="mx-1">:</span>
                    <select
                      id="endTime-minute"
                      name="endTime-minute"
                      className="appearance-none block w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-r-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-900 dark:text-white"
                      value={formData.endTime ? formData.endTime.split(':')[1] : ''}
                      onChange={(e) => {
                        const mins = e.target.value;
                        const hours = formData.endTime ? formData.endTime.split(':')[0] : '00';
                        const newTime = hours ? `${hours}:${mins}` : '';
                        setFormData({
                          ...formData,
                          endTime: newTime
                        });
                      }}
                    >
                      <option value="">분</option>
                      {Array.from({length: 6}, (_, i) => i * 10).map(minute => (
                        <option key={minute} value={minute.toString().padStart(2, '0')}>
                          {minute.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  장소
                </label>
                <div className="mt-1">
                  <input
                    id="location"
                    name="location"
                    type="text"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-900 dark:text-white"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="materials" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  준비물
                </label>
                <div className="mt-1">
                  <input
                    id="materials"
                    name="materials"
                    type="text"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-900 dark:text-white"
                    value={formData.materials}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="fileUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  파일 URL
                </label>
                <div className="mt-1">
                  <input
                    id="fileUrl"
                    name="fileUrl"
                    type="url"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-900 dark:text-white"
                    placeholder="https://example.com/file.pdf"
                    value={formData.fileUrl}
                    onChange={handleChange}
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  공유 드라이브나 저장소에 업로드된 파일의 URL을 입력하세요
                </p>
              </div>

              <div>
                <label htmlFor="linkUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  관련 링크
                </label>
                <div className="mt-1">
                  <input
                    id="linkUrl"
                    name="linkUrl"
                    type="url"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-900 dark:text-white"
                    placeholder="https://example.com"
                    value={formData.linkUrl}
                    onChange={handleChange}
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  업무와 관련된 참고자료나 웹사이트 링크
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                설명
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-900 dark:text-white"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                비고
              </label>
              <div className="mt-1">
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-900 dark:text-white"
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="isShared"
                name="isShared"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={formData.isShared}
                onChange={handleCheckboxChange}
              />
              <label htmlFor="isShared" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                공유하기
              </label>
            </div>

            <div className={`${formData.isShared ? 'block' : 'hidden'} mt-4`}>
              <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                협업 공간 선택
              </label>
              <div className="mt-1">
                <select
                  id="roomId"
                  name="roomId"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-900 dark:text-white"
                  value={formData.roomId}
                  onChange={handleRoomChange}
                >
                  <option value="">선택하세요</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                협업 공간을 선택하면 해당 공간의 모든 구성원이 이 업무를 확인하고 편집할 수 있습니다.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">업무 쪽지 생성</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  AI 제공자
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-primary-600"
                      name="aiProvider"
                      value="openai"
                      checked={aiProvider === 'openai'}
                      onChange={() => setAiProvider('openai')}
                    />
                    <span className="ml-2">OpenAI</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-primary-600"
                      name="aiProvider"
                      value="gemini"
                      checked={aiProvider === 'gemini'}
                      onChange={() => setAiProvider('gemini')}
                    />
                    <span className="ml-2">Google Gemini</span>
                  </label>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleGenerateNote}
                disabled={isGenerating || !formData.title || !formData.category || !formData.dueDate}
                className="mb-4"
              >
                {isGenerating ? '생성 중...' : '업무 쪽지 생성하기'}
              </Button>

              {generatedContent && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <Button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedContent);
                        // 복사 성공 알림
                        alert('업무 쪽지가 클립보드에 복사되었습니다.');
                      }}
                      variant="outline"
                      size="sm"
                      className="ml-auto"
                    >
                      복사하기
                    </Button>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {generatedContent}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/tasks')}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? '저장 중...' : '저장하기'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
} 