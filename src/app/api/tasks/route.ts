import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db';
import { parseDateTime } from '@/lib/utils/date';
import { TaskCategory, TaskPriority } from '@prisma/client';

// 할일 목록 조회
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    
    let where: any = {};
    
    // 방 필터링
    if (roomId) {
      // 방에 속한 할일만 조회
      where.roomId = roomId;
      
      // 방 접근 권한 확인
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
          members: {
            where: { userId: session.user.id }
          }
        }
      });
      
      if (!room) {
        return NextResponse.json({ error: '방을 찾을 수 없습니다.' }, { status: 404 });
      }
      
      // 사용자가 방의 멤버가 아닌 경우
      if (room.members.length === 0) {
        return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
      }
    } else {
      // 방 필터링이 없는 경우 사용자의 할일만 조회
      where.OR = [
        { userId: session.user.id }, // 사용자가 생성한 할일
        { 
          room: {
            OR: [
              { ownerId: session.user.id }, // 사용자가 방장인 방의 할일
              { 
                members: {
                  some: { userId: session.user.id }
                }
              }
            ]
          }
        }
      ];
    }
    
    const tasks = await prisma.task.findMany({
      where,
      include: {
        completions: {
          where: { userId: session.user.id }
        },
        room: {
          select: {
            id: true,
            name: true,
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: [
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('할일 목록 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '할일 목록을 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 할일 생성
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { 
      title, 
      description, 
      category, 
      priority, 
      dueDate, 
      startTime, 
      endTime, 
      location, 
      materials, 
      notes, 
      isShared,
      roomId
    } = data;

    // 필수 필드 검증
    if (!title) {
      return NextResponse.json(
        { error: '제목은 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }

    // 카테고리와 중요도 값 검증
    const validCategories = ['MEETING', 'BUSINESS_TRIP', 'TRAINING', 'EVENT', 'CLASSROOM', 'TASK', 'OTHER'];
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

    if (category && !validCategories.includes(category)) {
      return NextResponse.json({ error: '유효하지 않은 분류입니다.' }, { status: 400 });
    }

    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json({ error: '유효하지 않은 중요도입니다.' }, { status: 400 });
    }

    // 날짜 검증
    let dueDateObj = null;
    if (dueDate) {
      try {
        dueDateObj = new Date(dueDate);
        if (isNaN(dueDateObj.getTime())) {
          return NextResponse.json(
            { error: '날짜 형식이 올바르지 않습니다.' },
            { status: 400 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { error: '날짜 형식이 올바르지 않습니다.' },
          { status: 400 }
        );
      }
    }

    // 시간 검증 및 변환 함수
    const parseTimeToDate = (timeStr: string | undefined | null, baseDate: Date | null): Date | null => {
      if (!timeStr || !timeStr.trim() || !baseDate) return null;
      
      // 정규식으로 시간 형식 검증 (HH:MM)
      if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr.trim())) {
        console.error('시간 형식 오류:', timeStr);
        return null;
      }
      
      try {
        const dateCopy = new Date(baseDate);
        const [hours, minutes] = timeStr.split(':').map(Number);
        
        // 분을 10분 단위로 반올림
        const roundedMinutes = Math.round(minutes / 10) * 10;
        // 59분 초과되면 00분으로 조정
        const adjustedMinutes = roundedMinutes >= 60 ? 0 : roundedMinutes;
        
        dateCopy.setHours(hours, adjustedMinutes, 0, 0);
        
        if (isNaN(dateCopy.getTime())) {
          console.error('최종 날짜 오류:', dateCopy);
          return null;
        }
        
        return dateCopy;
      } catch (e) {
        console.error('시간 파싱 오류:', e);
        return null;
      }
    };

    // 방 ID 검증
    if (roomId && roomId.trim() !== '') {
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
    const shouldShare = roomId && roomId.trim() !== '' ? true : isShared ?? false;
    
    console.log('업무 생성 - roomId:', roomId, 'isShared:', shouldShare);

    const task = await prisma.task.create({
      data: {
        title,
        description: description || '',
        category: category as TaskCategory || 'TASK',
        priority: priority as TaskPriority || 'MEDIUM',
        dueDate: dueDateObj,
        startTime: parseTimeToDate(startTime, dueDateObj),
        endTime: parseTimeToDate(endTime, dueDateObj),
        location: location || '',
        materials: Array.isArray(materials) ? '' : (materials || ''),
        notes: notes || '',
        isShared: shouldShare,
        userId: session.user.id,
        ...(roomId && roomId.trim() !== '' && {
          room: {
            connect: { id: roomId }
          }
        })
      }
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('할일 생성 중 오류 발생:', error);
    return NextResponse.json(
      { error: '할일을 생성하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 