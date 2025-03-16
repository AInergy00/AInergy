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
  const [isSaving, setIsSaving] = useState(false);

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
    
    setIsSaving(true);
    setError(null);

    try {
      // 시간 형식 변환 (HH:MM -> ISO DateTime)
      let startTimeISO = null;
      let endTimeISO = null;
      
      if (result.dueDate && result.startTime) {
        const [hours, minutes] = result.startTime.split(':').map(Number);
        const startDate = new Date(result.dueDate);
        startDate.setHours(hours, minutes, 0, 0);
        startTimeISO = startDate.toISOString();
      }
      
      if (result.dueDate && result.endTime) {
        const [hours, minutes] = result.endTime.split(':').map(Number);
        const endDate = new Date(result.dueDate);
        endDate.setHours(hours, minutes, 0, 0);
        endTimeISO = endDate.toISOString();
      }

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: result.title,
          description: '',
          category: result.category,
          priority: 'MEDIUM',
          dueDate: result.dueDate,
          startTime: startTimeISO,
          endTime: endTimeISO,
          location: result.location || '',
          materials: Array.isArray(result.materials) ? '' : (result.materials || ''),
          notes: result.notes || '',
          isShared: false
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
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (!result) return;
    
    setResult({
      ...result,
      [field]: value,
    });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!result) return;
    
    setResult({
      ...result,
      category: e.target.value as TaskCategory,
    });
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
                  <input
                    type="text"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    value={result.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium">
                    분류
                  </label>
                  <select
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    value={result.category}
                    onChange={handleCategoryChange}
                  >
                    <option value="MEETING">회의</option>
                    <option value="BUSINESS_TRIP">출장</option>
                    <option value="TRAINING">연수</option>
                    <option value="EVENT">행사</option>
                    <option value="CLASSROOM">담임</option>
                    <option value="TASK">업무</option>
                    <option value="OTHER">기타</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium">
                    날짜
                  </label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    value={result.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium">
                    시간
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="time"
                      step="600"
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      value={result.startTime || ''}
                      onChange={(e) => handleInputChange('startTime', e.target.value)}
                      placeholder="시작 시간"
                    />
                    <input
                      type="time"
                      step="600"
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      value={result.endTime || ''}
                      onChange={(e) => handleInputChange('endTime', e.target.value)}
                      placeholder="종료 시간"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium">
                    장소
                  </label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    value={result.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="장소"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium">
                    준비물
                  </label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    value={result.materials || ''}
                    onChange={(e) => handleInputChange('materials', e.target.value)}
                    placeholder="준비물"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium">
                  비고
                </label>
                <textarea
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  value={result.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="비고"
                  rows={3}
                />
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
                  disabled={isSaving}
                >
                  {isSaving ? '저장 중...' : '저장하기'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 