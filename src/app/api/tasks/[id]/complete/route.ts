import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // AJAX 요청인지 확인
  const isAjaxRequest = request.headers.get('X-Requested-With') === 'XMLHttpRequest';
  
  // 인증 체크
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  // Next.js 15.2 이상에서는 params를 사용하기 전에 await해야 함
  const { id: taskId } = await params;
  const formData = await request.formData();
  const completedParam = formData.get('completed');
  
  // completed가 "false" 문자열이면 false로 변환, 아니면 true로 설정
  const completed = completedParam === 'false' ? false : true;

  try {
    // 업무 존재 확인
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        completions: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: '업무를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 자신의 업무이거나 공유된 업무만 완료 상태 변경 가능
    if (task.userId !== session.user.id && !task.isShared) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    if (completed) {
      // 완료 처리
      if (task.completions.length === 0) {
        // 완료 기록이 없으면 생성
        await prisma.taskCompletion.create({
          data: {
            taskId,
            userId: session.user.id,
            completed: true,
          },
        });
      } else {
        // 완료 기록이 있으면 업데이트
        await prisma.taskCompletion.update({
          where: { id: task.completions[0].id },
          data: { completed: true },
        });
      }
    } else {
      // 미완료 처리
      if (task.completions.length > 0) {
        await prisma.taskCompletion.update({
          where: { id: task.completions[0].id },
          data: { completed: false },
        });
      }
    }

    // JSON 응답 헤더를 명시적으로 설정
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Cache-Control', 'no-store');
    headers.set('X-Content-Type-Options', 'nosniff');
    
    // AJAX 요청인 경우에만 JSON 응답, 아니면 Redirect 응답
    if (isAjaxRequest) {
      return new NextResponse(JSON.stringify({ success: true, taskId }), { 
        status: 200,
        headers: headers
      });
    } else {
      // AJAX 요청이 아닌 경우 이전 페이지로 리다이렉트
      headers.set('Location', request.headers.get('Referer') || '/tasks');
      return new NextResponse(null, { 
        status: 303, // See Other
        headers: headers
      });
    }
  } catch (error) {
    console.error('업무 완료 상태 변경 중 오류 발생:', error);
    return NextResponse.json(
      { error: '업무 완료 상태 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 