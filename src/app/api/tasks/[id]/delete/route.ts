import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 인증 체크
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const taskId = params.id;

  try {
    // 업무 존재 확인
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ error: '업무를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 자신의 업무만 삭제 가능
    if (task.userId !== session.user.id) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 관련 완료 기록 삭제
    await prisma.taskCompletion.deleteMany({
      where: { taskId },
    });

    // 업무 삭제
    await prisma.task.delete({
      where: { id: taskId },
    });

    // 리다이렉트 대신 성공 응답 반환
    return NextResponse.json({ success: true, message: '업무가 삭제되었습니다.' }, { status: 200 });
  } catch (error) {
    console.error('업무 삭제 중 오류 발생:', error);
    return NextResponse.json(
      { error: '업무 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 