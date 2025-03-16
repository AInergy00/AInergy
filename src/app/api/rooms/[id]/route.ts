import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db';
import { RoomMember } from '@prisma/client';

// 방 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    // 방 정보 조회
    const room = await prisma.room.findUnique({
      where: {
        id: params.id,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        tasks: {
          include: {
            completions: true,
            createdBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: [
            { dueDate: 'asc' },
            { createdAt: 'desc' },
          ],
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: '방을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 사용자가 방의 구성원인지 확인
    const isMember = room.members.some((member) => member.userId === session.user.id);
    
    if (!isMember) {
      return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error('방 상세 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '방 정보를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 방 정보 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    // 방 존재 여부 확인
    const room = await prisma.room.findUnique({
      where: {
        id: params.id,
      },
      include: {
        members: true,
      },
    });

    if (!room) {
      return NextResponse.json({ error: '방을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 사용자가 방장인지 확인 (role이 'admin'인 경우)
    const isAdmin = room.members.some(
      (member) => member.userId === session.user.id && member.role === 'admin'
    );

    if (!isAdmin) {
      return NextResponse.json({ error: '권한이 없습니다. 방장만 수정할 수 있습니다.' }, { status: 403 });
    }

    const { name, description, password } = await request.json();

    // 방 정보 업데이트
    const updatedRoom = await prisma.room.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        description,
        password,
      },
    });

    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.error('방 정보 수정 중 오류 발생:', error);
    return NextResponse.json(
      { error: '방 정보를 수정하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 방 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    // 방 존재 여부 확인
    const room = await prisma.room.findUnique({
      where: {
        id: params.id,
      },
      include: {
        members: true,
      },
    });

    if (!room) {
      return NextResponse.json({ error: '방을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 사용자가 방장인지 확인 (role이 'admin'인 경우)
    const isAdmin = room.members.some(
      (member) => member.userId === session.user.id && member.role === 'admin'
    );

    if (!isAdmin) {
      return NextResponse.json({ error: '권한이 없습니다. 방장만 삭제할 수 있습니다.' }, { status: 403 });
    }

    // 방 삭제 - cascade 설정에 의해 관련된 멤버, 태스크도 모두 삭제됨
    await prisma.room.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('방 삭제 중 오류 발생:', error);
    return NextResponse.json(
      { error: '방을 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 