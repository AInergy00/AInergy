import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: '초대 코드가 필요합니다.' }, { status: 400 });
    }

    // 초대 코드로 방 조회
    const room = await prisma.room.findFirst({
      where: {
        inviteCode: code,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          where: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: '유효하지 않은 초대 코드입니다.' }, { status: 404 });
    }

    // 이미 참여한 멤버인지 확인
    if (room.members.length > 0) {
      return NextResponse.json({ error: '이미 참여한 방입니다.' }, { status: 400 });
    }

    // 방장인지 확인
    if (room.ownerId === session.user.id) {
      return NextResponse.json({ error: '본인이 방장인 방입니다.' }, { status: 400 });
    }

    // 개인 정보 보호를 위해 일부 정보만 제공
    return NextResponse.json({
      id: room.id,
      name: room.name,
      description: room.description,
      isPrivate: room.isPrivate,
      ownerName: room.owner.name,
    });
  } catch (error) {
    console.error('초대 코드 확인 중 오류 발생:', error);
    return NextResponse.json(
      { error: '초대 코드 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 