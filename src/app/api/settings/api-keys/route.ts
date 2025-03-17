import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db';

// API 키 조회
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    // 사용자 설정 조회
    const userSettings = await prisma.userSettings.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    // 설정이 없으면 빈 객체 반환
    if (!userSettings) {
      return NextResponse.json({
        openai: process.env.OPENAI_API_KEY || '',
        gemini: process.env.GEMINI_API_KEY || '',
      });
    }

    return NextResponse.json({
      openai: userSettings.openaiApiKey || process.env.OPENAI_API_KEY || '',
      gemini: userSettings.geminiApiKey || process.env.GEMINI_API_KEY || '',
    });
  } catch (error) {
    console.error('API 키 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: 'API 키를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// API 키 저장
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const { openai, gemini } = await request.json();

    // API 키 유효성 검사
    if (openai && !openai.startsWith('sk-')) {
      return NextResponse.json(
        { error: 'OpenAI API 키 형식이 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    if (gemini && !gemini.startsWith('AIza')) {
      return NextResponse.json(
        { error: 'Google Gemini API 키 형식이 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    // 사용자 설정 업데이트 또는 생성
    const userSettings = await prisma.userSettings.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        openaiApiKey: openai,
        geminiApiKey: gemini,
      },
      create: {
        userId: session.user.id,
        openaiApiKey: openai,
        geminiApiKey: gemini,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'API 키가 저장되었습니다.',
    });
  } catch (error) {
    console.error('API 키 저장 중 오류 발생:', error);
    return NextResponse.json(
      { error: 'API 키를 저장하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 