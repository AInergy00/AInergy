import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db';
import { TaskCategory, TaskPriority } from '@prisma/client';

// 카테고리 매핑 함수 - Prisma enum과 UI 값 사이 매핑
function mapToValidCategory(input: string): TaskCategory {
  console.log(`카테고리 매핑 함수 시작, 입력값: "${input}"`);
  
  // 입력값이 없거나 null인 경우 기본값
  if (!input) {
    console.log('입력값이 없음, OTHER 반환');
    return 'OTHER';
  }
  
  // 정규화 (대문자로 변환, 앞뒤 공백 제거)
  const normalizedInput = typeof input === 'string' ? input.trim().toUpperCase() : String(input).trim().toUpperCase();
  console.log(`정규화된 입력값: "${normalizedInput}"`);
  
  // 직접 매핑 시도
  const directMapping: Record<string, TaskCategory> = {
    'MEETING': 'MEETING',
    'BUSINESS_TRIP': 'BUSINESS_TRIP',
    'TRAINING': 'TRAINING',
    'EVENT': 'EVENT', 
    'CLASSROOM': 'CLASSROOM',
    'TASK': 'TASK',
    'OTHER': 'OTHER'
  };
  
  // 한글 매핑 시도
  const koreanMapping: Record<string, TaskCategory> = {
    '회의': 'MEETING',
    '출장': 'BUSINESS_TRIP',
    '연수': 'TRAINING',
    '행사': 'EVENT',
    '담임': 'CLASSROOM',
    '업무': 'TASK',
    '기타': 'OTHER'
  };
  
  // 유사 매핑 시도
  const similarMapping: Record<string, TaskCategory> = {
    'BUSINESS': 'BUSINESS_TRIP',
    'CLASS': 'CLASSROOM',
    'EDUCATION': 'TRAINING',
    'PERSONAL': 'OTHER'
  };
  
  // 직접 매핑 시도
  if (directMapping[normalizedInput]) {
    const result = directMapping[normalizedInput];
    console.log(`직접 매핑됨: "${normalizedInput}" -> "${result}"`);
    return result;
  }
  
  // 한글 매핑 시도
  const koreanKey = Object.keys(koreanMapping).find(key => 
    normalizedInput === key || normalizedInput.includes(key)
  );
  
  if (koreanKey) {
    const result = koreanMapping[koreanKey];
    console.log(`한글 매핑됨: "${normalizedInput}" -> "${result}"`);
    return result;
  }
  
  // 유사 매핑 시도
  const similarKey = Object.keys(similarMapping).find(key => 
    normalizedInput.includes(key)
  );
  
  if (similarKey) {
    const result = similarMapping[similarKey];
    console.log(`유사 매핑됨: "${normalizedInput}" -> "${result}"`);
    return result;
  }
  
  // 매핑 실패 - 기본값 반환
  console.log(`매핑 실패, OTHER 반환`);
  return 'OTHER';
}

// POST 요청 처리 (기존 FormData 방식)
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
    const categoryRaw = formData.get('category') as string;
    const priority = formData.get('priority') as string;
    const dueDate = formData.get('dueDate') as string | null;
    const from = formData.get('from') as string | null;
    
    console.log('POST 요청 받음, 카테고리:', categoryRaw);
    
    // 카테고리 매핑
    const category = mapToValidCategory(categoryRaw);
    console.log('변환된 카테고리:', category);
    
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
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

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

    // 방 ID 검증
    if (roomId) {
      const room = await prisma.room.findFirst({
        where: { id: roomId },
        include: {
          members: {
            where: { userId: session.user.id }
          }
        }
      });

      if (!room) {
        return NextResponse.json({ error: '존재하지 않는 방입니다.' }, { status: 404 });
      }

      // 사용자가 방의 멤버가 아닌 경우
      if (room.members.length === 0) {
        return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
      }
    }

    // roomId가 제공된 경우 자동으로 isShared를 true로 설정
    const shouldShare = roomId ? true : isShared;
    
    console.log('업무 업데이트(POST) - roomId:', roomId, 'isShared:', shouldShare);

    // 데이터 업데이트
    console.log('저장할 카테고리:', category);
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        category: category,
        priority: priority as TaskPriority,
        dueDate: dueDateObj,
        startTime: startTimeObj,
        endTime: endTimeObj,
        location,
        materials,
        notes,
        roomId: roomId || null,
        isShared: shouldShare,
        updatedAt: new Date(),
      },
    });

    console.log('업데이트된 업무:', updatedTask);

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

// PUT 요청 처리 (JSON 방식)
export async function PUT(request: NextRequest) {
  console.log('PUT 요청 처리 시작');
  
  // 인증 체크
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    // JSON 데이터 가져오기
    const data = await request.json();
    const {
      id,
      title,
      description,
      category: categoryRaw,
      priority,
      dueDate,
      startTime,
      endTime,
      location,
      materials,
      notes,
      roomId,
      isShared,
      from
    } = data;

    console.log('PUT 요청 받음, 원본 카테고리:', categoryRaw);
    
    // 카테고리 매핑
    const category = mapToValidCategory(categoryRaw);
    console.log('변환된 카테고리:', category);

    // 필수 필드 확인
    if (!id || !title || !category || !priority || !dueDate) {
      return NextResponse.json({ error: '필수 입력 항목이 누락되었습니다.' }, { status: 400 });
    }

    // 중요도 값 검증
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

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
        startTimeObj.setHours(hours, minutes, 0, 0);
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
        endTimeObj.setHours(hours, minutes, 0, 0);
        if (isNaN(endTimeObj.getTime())) {
          return NextResponse.json({ error: '종료 시간 형식이 올바르지 않습니다.' }, { status: 400 });
        }
      } catch (error) {
        return NextResponse.json({ error: '종료 시간 처리 중 오류가 발생했습니다.' }, { status: 400 });
      }
    }

    // roomId가 제공된 경우 자동으로 isShared를 true로 설정
    const shouldShare = roomId && roomId.trim() !== '' ? true : isShared ?? false;
    
    console.log('업무 업데이트 - roomId:', roomId, 'isShared:', shouldShare);

    // 데이터 업데이트
    console.log('저장할 카테고리:', category);
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        category: category,
        priority: priority as TaskPriority,
        dueDate: dueDateObj,
        startTime: startTimeObj,
        endTime: endTimeObj,
        location,
        materials,
        notes,
        roomId: roomId || null,
        isShared: shouldShare,
        updatedAt: new Date(),
      },
    });

    console.log('업데이트된 업무:', updatedTask);

    // 리디렉션 URL 구성 (클라이언트에서 처리할 수 있도록 JSON으로 반환)
    let redirectUrl = `/tasks/${id}`;
    if (from === 'calendar') {
      redirectUrl = '/calendar';
    } else if (from) {
      redirectUrl = `/${from}`;
    }

    return NextResponse.json({ 
      success: true, 
      message: '업무가 성공적으로 수정되었습니다.',
      task: updatedTask,
      redirectUrl
    });
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