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
    console.log(`방 참여 API 호출: 방 ID ${roomId}, 사용자 ID ${session.user.id}`);
    
    // JSON 파싱 시 오류 처리를 위한 별도 try-catch
    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      return NextResponse.json(
        { error: '잘못된 요청 데이터 형식입니다.' },
        { status: 400 }
      );
    }
    
    const { inviteCode } = requestData || {};
    console.log(`초대 코드: ${inviteCode || '없음'}`);

    // 방 존재 확인
    const room = await prisma.room.findUnique({
      where: {
        id: roomId,
      },
    });

    if (!room) {
      console.log(`방을 찾을 수 없음: ${roomId}`);
      return NextResponse.json({ error: '협업 공간을 찾을 수 없습니다.' }, { status: 404 });
    }
    
    console.log(`방 정보: ${room.name}, 비밀번호 설정 여부: ${!!room.password}`);

    // 이미 참여한 멤버인지 확인
    const existingMember = await prisma.roomMember.findFirst({
      where: {
        userId: session.user.id,
        roomId,
      },
    });

    if (existingMember) {
      console.log(`이미 참여한 멤버: ${session.user.id}`);
      return NextResponse.json({ error: '이미 참여한 협업 공간입니다.' }, { status: 400 });
    }

    // 초대 코드 확인 (비공개 방인 경우)
    if (room.password) {
      if (!inviteCode) {
        console.log('초대 코드가 필요하지만 제공되지 않음');
        return NextResponse.json({ error: '초대 코드가 필요합니다.' }, { status: 403 });
      }
      
      if (room.password !== inviteCode) {
        console.log('잘못된 초대 코드');
        return NextResponse.json({ error: '유효하지 않은 초대 코드입니다.' }, { status: 403 });
      }
    }

    // 방에 참여
    console.log(`새 멤버 추가 시도: ${session.user.id}`);
    const newMember = await prisma.roomMember.create({
      data: {
        userId: session.user.id,
        roomId,
        role: 'member',
      },
    });
    
    console.log('방 참여 성공:', newMember);
    return NextResponse.json({
      success: true,
      message: '협업 공간에 참여했습니다.',
      member: newMember
    });
  } catch (error) {
    console.error('협업 공간 참여 중 오류 발생:', error);
    return NextResponse.json(
      { error: '협업 공간 참여 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 