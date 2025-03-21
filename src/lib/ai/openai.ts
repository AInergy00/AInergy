import OpenAI from 'openai';

let openai: OpenAI | null = null;

export function getOpenAIInstance() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export async function analyzeTaskNote(content: string) {
  const openai = getOpenAIInstance();
  
  if (!openai) {
    throw new Error('OpenAI API 키가 설정되지 않았습니다.');
  }

  // 현재 날짜 가져오기
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  const currentDateStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `
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
          `
        },
        {
          role: 'user',
          content: content
        }
      ],
      response_format: { type: 'json_object' }
    });

    const result = response.choices[0]?.message?.content;
    
    if (!result) {
      throw new Error('AI 분석 결과를 받지 못했습니다.');
    }

    return JSON.parse(result);
  } catch (error) {
    console.error('OpenAI API 오류:', error);
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
  const openai = getOpenAIInstance();
  
  if (!openai) {
    throw new Error('OpenAI API 키가 설정되지 않았습니다.');
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `
            당신은 학교 환경에서 업무 쪽지를 작성하는 AI 비서입니다.
            주어진 정보를 바탕으로 간결하고 효과적인 업무 쪽지를 작성하세요.
            
            다음 규칙을 따라 업무 쪽지를 작성하세요:
            1. '생성된 업무 쪽지' 또는 '[업무 쪽지]'와 같은 메타 정보는 포함하지 마세요.
            2. 학교 선생님들에게 적합한 친근하지만 전문적인 인사말로 시작하세요.
            3. '친애하는', '존경하는' 등의 격식적인 표현은 사용하지 마세요.
            4. 쪽지의 목적을 간략하게 소개하는 문장을 포함하세요.
            5. 중요한 정보(일시, 장소, 참석자, 안건, 준비물 등)는 앞에 "✔️"를 붙여 강조하세요.
            6. 값이 없거나 '미정', '없음'인 항목은 표시하지 마세요.
            7. 필요한 경우 추가 안내사항이나 당부사항을 포함하세요.
            8. 간결하고 친근한 끝인사로 마무리하세요.
            
            업무 쪽지만 출력하고, 설명이나 메타 정보는 포함하지 마세요.
          `
        },
        {
          role: 'user',
          content: `
            다음 정보를 바탕으로 업무 쪽지를 작성해주세요:
            
            제목: ${taskData.title}
            분류: ${taskData.category}
            날짜: ${taskData.dueDate}
            시작 시간: ${taskData.startTime || '미정'}
            종료 시간: ${taskData.endTime || '미정'}
            장소: ${taskData.location || '미정'}
            준비물: ${taskData.materials || '없음'}
            비고: ${taskData.notes || '없음'}
          `
        }
      ]
    });

    return response.choices[0]?.message?.content || '업무 쪽지 생성에 실패했습니다.';
  } catch (error) {
    console.error('OpenAI API 오류:', error);
    throw new Error('업무 쪽지 생성 중 오류가 발생했습니다.');
  }
} 