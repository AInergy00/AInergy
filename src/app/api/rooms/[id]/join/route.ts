import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db';

type RouteParams = {
  params: {
    id: string;
  };
};

export async function POST(
  request: NextRequest,
  context: RouteParams
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const roomId = context.params.id;
    const { inviteCode } = await request.json();

    // 방 존재 확인
    const room = await prisma.room.findUnique({
      where: {
        id: roomId,
      },
      include: {
        members: {
          where: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: '방을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 이미 참여한 멤버인지 확인
    if (room.members.length > 0) {
      return NextResponse.json({ error: '이미 참여한 방입니다.' }, { status: 400 });
    }

    // 초대 코드 확인 (비공개 방인 경우)
    if (room.isPrivate && room.inviteCode !== inviteCode) {
      return NextResponse.json({ error: '유효하지 않은 초대 코드입니다.' }, { status: 403 });
    }

    // 방에 참여
    const newMember = await prisma.roomMember.create({
      data: {
        userId: session.user.id,
        roomId,
        role: 'MEMBER',
      },
    });

    return NextResponse.json(newMember);
  } catch (error) {
    console.error('방 참여 중 오류 발생:', error);
    return NextResponse.json(
      { error: '방 참여 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 