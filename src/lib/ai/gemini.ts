import { GoogleGenerativeAI } from '@google/generative-ai';

let gemini: GoogleGenerativeAI | null = null;

export function getGeminiInstance() {
  if (!gemini && process.env.GEMINI_API_KEY) {
    gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return gemini;
}

export async function analyzeTaskNote(content: string) {
  const gemini = getGeminiInstance();
  
  if (!gemini) {
    throw new Error('Gemini API 키가 설정되지 않았습니다.');
  }

  try {
    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const prompt = `
      당신은 업무 쪽지를 분석하는 AI 비서입니다. 
      주어진 업무 쪽지에서 다음 정보를 추출하세요:
      - 할 일 (title): 업무의 주요 제목
      - 분류 (category): MEETING(회의), BUSINESS_TRIP(출장), TRAINING(연수), EVENT(행사), CLASSROOM(담임), TASK(업무), OTHER(기타) 중 하나
      - 날짜 (dueDate): YYYY-MM-DD 형식
      - 시작 시간 (startTime): HH:MM 형식 (24시간제)
      - 종료 시간 (endTime): HH:MM 형식 (24시간제)
      - 장소 (location): 업무가 진행될 장소
      - 준비물 (materials): 필요한 준비물 목록
      - 비고 (notes): 기타 중요 정보
      
      JSON 형식으로 응답하세요.
      
      업무 쪽지:
      ${content}
    `;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // JSON 부분만 추출
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('JSON 형식의 응답을 받지 못했습니다.');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Gemini API 오류:', error);
    throw new Error('업무 쪽지 분석 중 오류가 발생했습니다.');
  }
}

export async function generateTaskNote(taskData: {
  title: string;
  category: string;
  dueDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  materials?: string;
  notes?: string;
}) {
  const gemini = getGeminiInstance();
  
  if (!gemini) {
    throw new Error('Gemini API 키가 설정되지 않았습니다.');
  }

  try {
    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const prompt = `
      당신은 업무 쪽지를 작성하는 AI 비서입니다.
      주어진 정보를 바탕으로 공식적이고 전문적인 업무 쪽지를 작성하세요.
      쪽지는 간결하고 명확하게 작성하되, 필요한 모든 정보를 포함해야 합니다.
      
      다음 정보를 바탕으로 업무 쪽지를 작성해주세요:
      
      제목: ${taskData.title}
      분류: ${taskData.category}
      날짜: ${taskData.dueDate}
      시작 시간: ${taskData.startTime || '미정'}
      종료 시간: ${taskData.endTime || '미정'}
      장소: ${taskData.location || '미정'}
      준비물: ${taskData.materials || '없음'}
      비고: ${taskData.notes || '없음'}
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini API 오류:', error);
    throw new Error('업무 쪽지 생성 중 오류가 발생했습니다.');
  }
} 