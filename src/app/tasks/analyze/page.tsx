'use client';

import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { categoryLabels } from '@/lib/utils/theme';

// TaskCategory 타입을 직접 정의
type TaskCategory = 'MEETING' | 'BUSINESS_TRIP' | 'TRAINING' | 'EVENT' | 'CLASSROOM' | 'TASK' | 'OTHER';

export default function AnalyzeTaskPage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    title: string;
    category: TaskCategory;
    dueDate: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    materials?: string;
    notes?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiProvider, setAiProvider] = useState<'openai' | 'gemini'>('openai');

  const handleAnalyze = async () => {
    if (!content.trim()) {
      setError('업무 쪽지 내용을 입력해주세요.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          provider: aiProvider,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '업무 쪽지 분석 중 오류가 발생했습니다.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '업무 쪽지 분석 중 오류가 발생했습니다.');
      console.error('분석 오류:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...result,
          isShared: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '업무 저장 중 오류가 발생했습니다.');
      }

      router.push('/tasks');
    } catch (err) {
      setError(err instanceof Error ? err.message : '업무 저장 중 오류가 발생했습니다.');
      console.error('저장 오류:', err);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">업무 쪽지 분석</h1>
        
        <div className="bg-card shadow rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="content" className="block text-sm font-medium">
                업무 쪽지 내용
              </label>
              <div className="mt-1">
                <textarea
                  id="content"
                  name="content"
                  rows={10}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  placeholder="업무 쪽지 내용을 붙여넣으세요..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">
                AI 제공자
              </label>
              <div className="mt-1 flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-primary"
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
                    className="form-radio text-primary"
                    name="aiProvider"
                    value="gemini"
                    checked={aiProvider === 'gemini'}
                    onChange={() => setAiProvider('gemini')}
                  />
                  <span className="ml-2">Google Gemini</span>
                </label>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-4">
                <div className="flex">
                  <div className="text-sm text-destructive">{error}</div>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !content.trim()}
              >
                {isAnalyzing ? '분석 중...' : '분석하기'}
              </Button>
            </div>
          </div>
        </div>

        {result && (
          <div className="bg-card shadow rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">분석 결과</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">
                    할 일
                  </label>
                  <div className="mt-1 text-sm">{result.title}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium">
                    분류
                  </label>
                  <div className="mt-1 text-sm">
                    {categoryLabels[result.category] || result.category}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium">
                    날짜
                  </label>
                  <div className="mt-1 text-sm">{result.dueDate}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium">
                    시간
                  </label>
                  <div className="mt-1 text-sm">
                    {result.startTime && result.endTime
                      ? `${result.startTime} - ${result.endTime}`
                      : result.startTime || result.endTime || '미정'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium">
                    장소
                  </label>
                  <div className="mt-1 text-sm">
                    {result.location || '미정'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium">
                    준비물
                  </label>
                  <div className="mt-1 text-sm">
                    {result.materials || '없음'}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium">
                  비고
                </label>
                <div className="mt-1 text-sm whitespace-pre-line">
                  {result.notes || '없음'}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setResult(null)}
                >
                  취소
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                >
                  저장하기
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 