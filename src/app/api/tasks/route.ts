import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db';
import { parseDateTime } from '@/lib/utils/date';

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

    if (!title) {
      return NextResponse.json({ error: '제목은 필수입니다.' }, { status: 400 });
    }

    // 방 ID가 제공된 경우 방 존재 및 권한 확인
    if (roomId) {
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
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || '',
        category: category || 'GENERAL',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        startTime: (() => {
          try {
            if (!startTime || startTime.trim() === '') return null;
            if (!dueDate) return null;

            const date = new Date(dueDate);
            if (isNaN(date.getTime())) return null;

            const [hours, minutes] = startTime.split(':').map(Number);
            if (isNaN(hours) || isNaN(minutes)) return null;

            date.setHours(hours, minutes, 0, 0);
            return date;
          } catch (e) {
            console.error('시작 시간 파싱 오류:', e);
            return null;
          }
        })(),
        endTime: (() => {
          try {
            if (!endTime || endTime.trim() === '') return null;
            if (!dueDate) return null;
            
            const date = new Date(dueDate);
            if (isNaN(date.getTime())) return null;

            const [hours, minutes] = endTime.split(':').map(Number);
            if (isNaN(hours) || isNaN(minutes)) return null;

            date.setHours(hours, minutes, 0, 0);
            return date;
          } catch (e) {
            console.error('종료 시간 파싱 오류:', e);
            return null;
          }
        })(),
        location: location || '',
        materials: Array.isArray(materials) ? '' : (materials || ''),
        notes: notes || '',
        isShared: isShared ?? false,
        userId: session.user.id,
        ...(roomId && {
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