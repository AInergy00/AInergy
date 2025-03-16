import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { generateTaskNote } from '@/lib/ai';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { message: '인증되지 않은 요청입니다.' },
      { status: 401 }
    );
  }

  try {
    const { taskData, provider = 'openai' } = await req.json();

    if (!taskData || !taskData.title || !taskData.category || !taskData.dueDate) {
      return NextResponse.json(
        { message: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const result = await generateTaskNote(taskData, provider as 'openai' | 'gemini');

    return NextResponse.json({ content: result });
  } catch (error) {
    console.error('업무 쪽지 생성 오류:', error);
    
    return NextResponse.json(
      { message: error instanceof Error ? error.message : '업무 쪽지 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 