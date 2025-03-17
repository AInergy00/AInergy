import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db';
import { TaskCategory, TaskPriority } from '@prisma/client';

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
    const from = formData.get('from') as string | null;
    
    // 시간 관련 필드
    let startTime = formData.get('startTime') as string | null;
    let endTime = formData.get('endTime') as string | null;
    
    // 시간 커스텀 입력 필드가 있는 경우 이를 처리
    const startTimeHour = formData.get('startTime-hour') as string | null;
    const startTimeMinute = formData.get('startTime-minute') as string | null;
    const endTimeHour = formData.get('endTime-hour') as string | null;
    const endTimeMinute = formData.get('endTime-minute') as string | null;
    
    // 시간과 분이 있으면 조합하여 시간 문자열 생성
    if (startTimeHour && startTimeMinute) {
      startTime = `${startTimeHour}:${startTimeMinute}`;
    }
    
    if (endTimeHour && endTimeMinute) {
      endTime = `${endTimeHour}:${endTimeMinute}`;
    }
    
    const location = formData.get('location') as string | null;
    const materials = formData.get('materials') as string | null;
    const notes = formData.get('notes') as string | null;
    const roomId = formData.get('roomId') as string | null;
    const isShared = formData.has('isShared');

    // 필수 필드 확인
    if (!id || !title || !category || !priority) {
      return NextResponse.json({ error: '필수 입력 항목이 누락되었습니다.' }, { status: 400 });
    }

    // 카테고리와 중요도 값 검증
    const validCategories = ['MEETING', 'BUSINESS_TRIP', 'TRAINING', 'EVENT', 'CLASSROOM', 'TASK', 'OTHER'];
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: '유효하지 않은 분류입니다.' }, { status: 400 });
    }

    if (!validPriorities.includes(priority)) {
      return NextResponse.json({ error: '유효하지 않은 중요도입니다.' }, { status: 400 });
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
    let dueDateObj = null;
    let startTimeObj = null;
    let endTimeObj = null;
    
    if (dueDate) {
      try {
        dueDateObj = new Date(dueDate);
        if (isNaN(dueDateObj.getTime())) {
          return NextResponse.json({ error: '날짜 형식이 올바르지 않습니다.' }, { status: 400 });
        }
      } catch (error) {
        return NextResponse.json({ error: '날짜 형식이 올바르지 않습니다.' }, { status: 400 });
      }
    }

    if (dueDateObj && startTime) {
      try {
        startTimeObj = new Date(dueDateObj);
        const [hours, minutes] = startTime.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) {
          return NextResponse.json({ error: '시작 시간 형식이 올바르지 않습니다.' }, { status: 400 });
        }
        // 분을 10분 단위로 반올림
        const roundedMinutes = Math.round(minutes / 10) * 10;
        // 59분 초과되면 00분으로 조정
        const adjustedMinutes = roundedMinutes >= 60 ? 0 : roundedMinutes;
        startTimeObj.setHours(hours, adjustedMinutes, 0, 0);
        
        if (isNaN(startTimeObj.getTime())) {
          return NextResponse.json({ error: '시작 시간 형식이 올바르지 않습니다.' }, { status: 400 });
        }
      } catch (error) {
        return NextResponse.json({ error: '시작 시간 처리 중 오류가 발생했습니다.' }, { status: 400 });
      }
    }

    if (dueDateObj && endTime) {
      try {
        endTimeObj = new Date(dueDateObj);
        const [hours, minutes] = endTime.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) {
          return NextResponse.json({ error: '종료 시간 형식이 올바르지 않습니다.' }, { status: 400 });
        }
        // 분을 10분 단위로 반올림
        const roundedMinutes = Math.round(minutes / 10) * 10;
        // 59분 초과되면 00분으로 조정
        const adjustedMinutes = roundedMinutes >= 60 ? 0 : roundedMinutes;
        endTimeObj.setHours(hours, adjustedMinutes, 0, 0);
        
        if (isNaN(endTimeObj.getTime())) {
          return NextResponse.json({ error: '종료 시간 형식이 올바르지 않습니다.' }, { status: 400 });
        }
      } catch (error) {
        return NextResponse.json({ error: '종료 시간 처리 중 오류가 발생했습니다.' }, { status: 400 });
      }
    }

    // 데이터 업데이트
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        category: category as TaskCategory,
        priority: priority as TaskPriority,
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

    // from 파라미터가 있으면 리다이렉션 URL에 추가
    // 절대 URL 사용
    const baseUrl = request.nextUrl.origin;
    const redirectPath = from ? `/tasks/${id}?from=${from}` : `/tasks/${id}`;
    const redirectUrl = new URL(redirectPath, baseUrl).toString();
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('업무 업데이트 중 오류 발생:', error);
    
    // 더 자세한 에러 정보 제공
    const errorMessage = error instanceof Error ? error.message : '업무 업데이트 중 오류가 발생했습니다.';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 