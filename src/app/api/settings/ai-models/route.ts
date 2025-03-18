import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db';

// AI 모델 설정 조회
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

    // 설정이 없으면 기본값 반환
    if (!userSettings) {
      return NextResponse.json({
        defaultModel: 'openai',
        temperature: 0.7,
        maxTokens: 1000,
        responseStyle: 'balanced',
      });
    }

    return NextResponse.json({
      defaultModel: userSettings.defaultModel || 'openai',
      temperature: userSettings.temperature || 0.7,
      maxTokens: userSettings.maxTokens || 1000,
      responseStyle: userSettings.responseStyle || 'balanced',
    });
  } catch (error) {
    console.error('AI 모델 설정 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: 'AI 모델 설정을 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// AI 모델 설정 저장
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const { defaultModel, temperature, maxTokens, responseStyle } = await request.json();

    // 유효성 검사
    if (defaultModel && !['openai', 'gemini'].includes(defaultModel)) {
      return NextResponse.json(
        { error: '지원하지 않는 AI 모델입니다.' },
        { status: 400 }
      );
    }

    if (temperature !== undefined && (temperature < 0 || temperature > 1)) {
      return NextResponse.json(
        { error: '온도는 0과 1 사이의 값이어야 합니다.' },
        { status: 400 }
      );
    }

    if (maxTokens !== undefined && (maxTokens < 100 || maxTokens > 4000)) {
      return NextResponse.json(
        { error: '최대 토큰 수는 100에서 4000 사이의 값이어야 합니다.' },
        { status: 400 }
      );
    }

    if (responseStyle && !['creative', 'balanced', 'precise'].includes(responseStyle)) {
      return NextResponse.json(
        { error: '지원하지 않는 응답 스타일입니다.' },
        { status: 400 }
      );
    }

    // 사용자 설정 업데이트 또는 생성
    const userSettings = await prisma.userSettings.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        defaultModel: defaultModel || undefined,
        temperature: temperature !== undefined ? temperature : undefined,
        maxTokens: maxTokens !== undefined ? maxTokens : undefined,
        responseStyle: responseStyle || undefined,
      },
      create: {
        userId: session.user.id,
        defaultModel,
        temperature,
        maxTokens,
        responseStyle,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'AI 모델 설정이 저장되었습니다.',
    });
  } catch (error) {
    console.error('AI 모델 설정 저장 중 오류 발생:', error);
    return NextResponse.json(
      { error: 'AI 모델 설정을 저장하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// AI 모델 설정 업데이트
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const { defaultModel, temperature, maxTokens, responseStyle } = await request.json();

    // 유효성 검사
    if (defaultModel && !['openai', 'gemini'].includes(defaultModel)) {
      return NextResponse.json(
        { error: '지원하지 않는 AI 모델입니다.' },
        { status: 400 }
      );
    }

    if (temperature !== undefined && (temperature < 0 || temperature > 1)) {
      return NextResponse.json(
        { error: '온도는 0과 1 사이의 값이어야 합니다.' },
        { status: 400 }
      );
    }

    if (maxTokens !== undefined && (maxTokens < 100 || maxTokens > 4000)) {
      return NextResponse.json(
        { error: '최대 토큰 수는 100에서 4000 사이의 값이어야 합니다.' },
        { status: 400 }
      );
    }

    if (responseStyle && !['creative', 'balanced', 'precise'].includes(responseStyle)) {
      return NextResponse.json(
        { error: '지원하지 않는 응답 스타일입니다.' },
        { status: 400 }
      );
    }

    // 사용자 설정 업데이트 또는 생성
    const userSettings = await prisma.userSettings.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        ...(defaultModel && { defaultModel }),
        ...(temperature !== undefined && { temperature }),
        ...(maxTokens !== undefined && { maxTokens }),
        ...(responseStyle && { responseStyle }),
      },
      create: {
        userId: session.user.id,
        defaultModel: defaultModel || 'openai',
        temperature: temperature !== undefined ? temperature : 0.7,
        maxTokens: maxTokens !== undefined ? maxTokens : 1000,
        responseStyle: responseStyle || 'balanced',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'AI 모델 설정이 업데이트되었습니다.',
    });
  } catch (error) {
    console.error('AI 모델 설정 업데이트 중 오류 발생:', error);
    return NextResponse.json(
      { error: 'AI 모델 설정을 업데이트하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 