import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  // 인증 체크
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    // form 데이터 가져오기
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string | null;
    const category = formData.get('category') as string;
    const priority = formData.get('priority') as string;
    const dueDate = formData.get('dueDate') as string | null;
    const startTime = formData.get('startTime') as string | null;
    const endTime = formData.get('endTime') as string | null;
    const location = formData.get('location') as string | null;
    const materials = formData.get('materials') as string | null;
    const notes = formData.get('notes') as string | null;
    const roomId = formData.get('roomId') as string | null;
    const isShared = formData.has('isShared');

    // 필수 필드 확인
    if (!id || !title || !category || !priority) {
      return NextResponse.json({ error: '필수 입력 항목이 누락되었습니다.' }, { status: 400 });
    }

    // 업무 존재 확인
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json({ error: '업무를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 자신의 업무만 수정 가능
    if (task.userId !== session.user.id) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 날짜와 시간 처리
    let dueDateObj = dueDate ? new Date(dueDate) : null;
    let startTimeObj = null;
    let endTimeObj = null;

    if (dueDateObj && startTime) {
      startTimeObj = new Date(dueDateObj);
      const [hours, minutes] = startTime.split(':').map(Number);
      startTimeObj.setHours(hours, minutes, 0, 0);
    }

    if (dueDateObj && endTime) {
      endTimeObj = new Date(dueDateObj);
      const [hours, minutes] = endTime.split(':').map(Number);
      endTimeObj.setHours(hours, minutes, 0, 0);
    }

    // 데이터 업데이트
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        category,
        priority,
        dueDate: dueDateObj,
        startTime: startTimeObj,
        endTime: endTimeObj,
        location,
        materials,
        notes,
        roomId: roomId || null,
        isShared,
        updatedAt: new Date(),
      },
    });

    return NextResponse.redirect(`/tasks/${id}`);
  } catch (error) {
    console.error('업무 업데이트 중 오류 발생:', error);
    return NextResponse.json(
      { error: '업무 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 