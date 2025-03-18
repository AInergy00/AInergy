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
    
    console.log(`초대 코드 확인 요청: ${code}`);

    if (!code) {
      return NextResponse.json({ error: '초대 코드가 필요합니다.' }, { status: 400 });
    }

    // 초대 코드로 방 조회 (password 필드 사용)
    const room = await prisma.room.findFirst({
      where: {
        password: code,
      },
      include: {
        // 현재 사용자가 이미 참여 중인지 확인
        members: {
          where: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!room) {
      console.log('유효하지 않은 초대 코드');
      return NextResponse.json({ error: '유효하지 않은 초대 코드입니다.' }, { status: 404 });
    }
    
    console.log(`방 정보: ID=${room.id}, 이름=${room.name}`);

    // 이미 참여한 멤버인지 확인
    if (room.members.length > 0) {
      console.log('이미 참여한 공간');
      return NextResponse.json({ error: '이미 참여한 공간입니다.' }, { status: 400 });
    }

    // 방장 정보 조회
    const admin = await prisma.roomMember.findFirst({
      where: {
        roomId: room.id,
        role: 'admin',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    // 방장 정보 확인
    if (admin?.user?.id === session.user.id) {
      console.log('본인이 관리자인 공간');
      return NextResponse.json({ error: '본인이 관리자인 공간입니다.' }, { status: 400 });
    }

    // 개인 정보 보호를 위해 일부 정보만 제공
    console.log('초대 코드 확인 성공');
    return NextResponse.json({
      id: room.id,
      name: room.name,
      description: room.description,
      isPrivate: !!room.password,
      ownerName: admin?.user?.name || '알 수 없음',
    });
  } catch (error) {
    console.error('초대 코드 확인 중 오류 발생:', error);
    return NextResponse.json(
      { error: '초대 코드 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 