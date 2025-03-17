'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { TaskCategory, TaskPriority } from '@prisma/client';
import { categoryLabels, priorityLabels } from '@/lib/utils/theme';

export default function EditTaskPage() {
  // useParams, useSearchParams 훅 사용
  const params = useParams();
  const searchParams = useSearchParams();
  const taskId = params.id as string;
  const fromParam = searchParams.get('from');
  
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rooms, setRooms] = useState<{ id: string; name: string }[]>([]);
  const [from, setFrom] = useState<string | null>(fromParam);
  const [isFromCalendar, setIsFromCalendar] = useState(fromParam === 'calendar');
  
  const [formData, setFormData] = useState({
    id: '',
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
    isShared: false,
    roomId: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 업무 데이터 가져오기
        const taskResponse = await fetch(`/api/tasks/${taskId}`);
        if (!taskResponse.ok) {
          throw new Error('업무를 불러오는데 실패했습니다.');
        }
        
        const task = await taskResponse.json();
        
        // 날짜와 시간 형식 변환
        const dueDate = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
        const startTime = task.startTime ? new Date(task.startTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
        const endTime = task.endTime ? new Date(task.endTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
        
        setFormData({
          id: task.id,
          title: task.title || '',
          description: task.description || '',
          category: task.category || 'TASK',
          priority: task.priority || 'MEDIUM',
          dueDate,
          startTime,
          endTime,
          location: task.location || '',
          materials: task.materials || '',
          notes: task.notes || '',
          isShared: task.isShared || false,
          roomId: task.roomId || '',
        });

        // 방 목록 가져오기
        const roomsResponse = await fetch('/api/rooms');
        if (roomsResponse.ok) {
          const roomsData = await roomsResponse.json();
          // API 응답 구조가 { myRooms, joinedRooms } 형태이므로 이를 합친 배열 생성
          const allRooms = [
            ...(Array.isArray(roomsData.myRooms) ? roomsData.myRooms : []),
            ...(Array.isArray(roomsData.joinedRooms) ? roomsData.joinedRooms : [])
          ];
          setRooms(allRooms);
        }
      } catch (error) {
        console.error('데이터 로딩 오류:', error);
        setError('데이터를 불러오는데 실패했습니다.');
      }
    };

    fetchData();
  }, [taskId]);

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
    setFormData({
      ...formData,
      [name]: checked,
    });
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
        id: formData.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        dueDate: formData.dueDate,
        location: formData.location,
        materials: formData.materials,
        notes: formData.notes,
        isShared: formData.isShared,
        from
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

      const response = await fetch('/api/tasks/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '업무 저장 중 오류가 발생했습니다.');
      }

      // API 응답에서 redirectUrl 가져오기
      const result = await response.json();

      // API가 제공하는 URL로 강제 리디렉션
      if (result.redirectUrl) {
        window.location.replace(result.redirectUrl);
        return;
      }
      
      // 리디렉션 URL이 없는 경우 기본 경로로 이동
      router.push(`/tasks/${formData.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : '업무 저장 중 오류가 발생했습니다.');
      console.error('업무 저장 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 캘린더로 바로 이동하는 함수
  const goToCalendar = () => {
    window.location.href = '/calendar';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href={`/tasks/${formData.id}${from ? `?from=${from}` : ''}`}>
              <Button variant="ghost" size="sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                뒤로
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">업무 수정</h1>
          </div>
          
          {isFromCalendar && (
            <Button onClick={goToCalendar} variant="outline" size="sm">
              캘린더로 돌아가기
            </Button>
          )}
        </div>
        
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

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (isFromCalendar) {
                    window.location.replace('/calendar');
                  } else if (from) {
                    window.location.replace(`/${from}`);
                  } else {
                    router.push(`/tasks/${formData.id}`);
                  }
                }}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? '저장 중...' : '업데이트'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
} 