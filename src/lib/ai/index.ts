import * as openai from './openai';
import * as gemini from './gemini';

export type TaskAnalysisResult = {
  title: string;
  category: string;
  dueDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  materials?: string;
  notes?: string;
};

export type TaskGenerationData = {
  title: string;
  category: string;
  dueDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  materials?: string;
  notes?: string;
};

export async function analyzeTaskNote(content: string, provider: 'openai' | 'gemini' = 'openai'): Promise<TaskAnalysisResult> {
  try {
    if (provider === 'openai') {
      return await openai.analyzeTaskNote(content);
    } else {
      return await gemini.analyzeTaskNote(content);
    }
  } catch (error) {
    console.error(`${provider} 분석 오류:`, error);
    throw new Error('업무 쪽지 분석 중 오류가 발생했습니다.');
  }
}

export async function generateTaskNote(data: TaskGenerationData, provider: 'openai' | 'gemini' = 'openai'): Promise<string> {
  try {
    if (provider === 'openai') {
      return await openai.generateTaskNote(data);
    } else {
      return await gemini.generateTaskNote(data);
    }
  } catch (error) {
    console.error(`${provider} 생성 오류:`, error);
    throw new Error('업무 쪽지 생성 중 오류가 발생했습니다.');
  }
} 