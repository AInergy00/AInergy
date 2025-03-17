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
      roomId,
      fileUrl,
      linkUrl
    } = await request.json();
    
    if (!title) {
      return NextResponse.json({ error: '제목은 필수 항목입니다.' }, { status: 400 });
    }
    
    if (!dueDate) {
      return NextResponse.json({ error: '마감일은 필수 항목입니다.' }, { status: 400 });
    }
    
    const dueDateObj = new Date(dueDate);
    
    // 시간 파싱 함수
    const parseTimeToDate = (timeStr: string | undefined | null, baseDate: Date | null): Date | null => {
      if (!timeStr || !timeStr.trim() || !baseDate) return null;
      
      try {
        const dateCopy = new Date(baseDate);
        const [hours, minutes] = timeStr.split(':').map(Number);
        
        dateCopy.setHours(hours, minutes, 0, 0);
        
        if (isNaN(dateCopy.getTime())) {
          console.error('시간 변환 오류:', dateCopy);
          return null;
        }
        
        return dateCopy;
      } catch (e) {
        console.error('시간 파싱 오류:', e);
        return null;
      }
    };
    
    // roomId가 제공된 경우 방에 대한 권한 체크
    if (roomId && roomId.trim() !== '') {
      console.log(`Task 생성 - roomId 확인: ${roomId}`);
      
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
      
      console.log('방 정보 확인 성공:', room.name);
    }

    // roomId가 제공된 경우 자동으로 isShared를 true로 설정
    const shouldShare = roomId && roomId.trim() !== '' ? true : isShared ?? false;
    
    console.log('업무 생성 정보 - roomId:', roomId, 'isShared:', shouldShare, 'fileUrl:', fileUrl, 'linkUrl:', linkUrl);

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
        fileUrl: fileUrl || '',
        linkUrl: linkUrl || '',
        isShared: shouldShare,
        userId: session.user.id,
        ...(roomId && roomId.trim() !== '' && {
          roomId: roomId
        })
      }
    });

    console.log('업무 생성 완료:', task);
    return NextResponse.json(task);
  } catch (error) {
    console.error('할일 생성 중 오류 발생:', error);
    return NextResponse.json(
      { error: '할일을 생성하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 