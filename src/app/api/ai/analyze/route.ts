import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { analyzeTaskNote } from '@/lib/ai';

export async function POST(req: NextRequest) {
  // 인증 검사 임시 비활성화 (개발 중에만 사용)
  // const session = await getServerSession(authOptions);
  // if (!session) {
  //   return NextResponse.json(
  //     { message: '인증되지 않은 요청입니다.' },
  //     { status: 401 }
  //   );
  // }

  try {
    const { content, provider = 'openai' } = await req.json();

    if (!content) {
      return NextResponse.json(
        { message: '업무 쪽지 내용이 필요합니다.' },
        { status: 400 }
      );
    }

    const result = await analyzeTaskNote(content, provider as 'openai' | 'gemini');

    return NextResponse.json(result);
  } catch (error) {
    console.error('업무 쪽지 분석 오류:', error);
    
    return NextResponse.json(
      { message: error instanceof Error ? error.message : '업무 쪽지 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 