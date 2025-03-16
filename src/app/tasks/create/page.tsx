'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { TaskCategory, TaskPriority } from '@prisma/client';
import { categoryLabels, priorityLabels } from '@/lib/utils/theme';

export default function CreateTaskPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiProvider, setAiProvider] = useState<'openai' | 'gemini'>('openai');
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  
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
    isShared: false,
    roomId: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
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
      const dataToSubmit = {
        ...formData,
        startTime: formData.startTime && formData.startTime.trim() !== '' ? formData.startTime : undefined,
        endTime: formData.endTime && formData.endTime.trim() !== '' ? formData.endTime : undefined,
        roomId: formData.roomId && formData.roomId.trim() !== '' ? formData.roomId : undefined
      };

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

      router.push('/tasks');
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
                  <input
                    id="startTime"
                    name="startTime"
                    type="time"
                    step="600"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-900 dark:text-white"
                    value={formData.startTime}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  종료 시간
                </label>
                <div className="mt-1">
                  <input
                    id="endTime"
                    name="endTime"
                    type="time"
                    step="600"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-900 dark:text-white"
                    value={formData.endTime}
                    onChange={handleChange}
                  />
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