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

  // 현재 날짜 가져오기
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  const currentDateStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;

  try {
    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const prompt = `
      당신은 업무 쪽지를 분석하는 AI 비서입니다. 
      주어진 업무 쪽지에서 다음 정보를 추출하세요:
      - 할 일 (title): 업무의 주요 제목
      - 분류 (category): MEETING(회의), BUSINESS_TRIP(출장), TRAINING(연수), EVENT(행사), CLASSROOM(담임), TASK(업무), OTHER(기타) 중 하나
      - 날짜 (dueDate): YYYY-MM-DD 형식. 오늘은 ${currentDateStr}입니다. 날짜가 명시되지 않았다면 오늘 날짜를 사용하세요.
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
      
      다음 규칙을 따라 업무 쪽지를 작성하세요:
      1. 항상 예의 바른 첫인사로 시작하고, 받는 사람을 언급하세요.
      2. 쪽지의 목적을 간략하게 소개하는 문장을 포함하세요.
      3. 주요 정보(일시, 장소, 참석자, 안건, 준비물 등)는 항목별로 구조화하여 가독성을 높이세요.
      4. 필요한 경우 추가 안내사항이나 당부사항을 포함하세요.
      5. 정중하고 공식적인 끝인사로 마무리하세요.
      
      업무 쪽지만 출력하고, 설명이나 메타 정보는 포함하지 마세요.
      
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