import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db';
import { RoomMember } from '@prisma/client';

// 방 상세 조회
export async function GET(
  request: NextRequest,
  context: { params: { id: string | string[] } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // params에서 id 추출 및 유효성 검사
    if (!context.params || !context.params.id) {
      console.error('방 ID가 제공되지 않았습니다.');
      return NextResponse.json({ error: '유효하지 않은 요청입니다.' }, { status: 400 });
    }

    const id = Array.isArray(context.params.id) ? context.params.id[0] : context.params.id;
    
    if (!id) {
      console.error('유효하지 않은 방 ID:', context.params.id);
      return NextResponse.json({ error: '유효하지 않은 방 ID입니다.' }, { status: 400 });
    }
    
    console.log(`방 상세 조회 요청: ${id}, 사용자: ${session.user.id}`);
    
    // 방 정보 조회
    try {
      const room = await prisma.room.findUnique({
        where: {
          id,
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
        console.log(`방을 찾을 수 없음: ${id}`);
        return NextResponse.json({ error: '방을 찾을 수 없습니다.' }, { status: 404 });
      }

      // 사용자가 방의 구성원인지 확인
      const isMember = room.members.some((member) => member.userId === session.user.id);
      
      if (!isMember) {
        console.log(`접근 권한 없음: 사용자 ${session.user.id}는 방 ${id}의 구성원이 아닙니다.`);
        return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
      }

      return NextResponse.json(room);
    } catch (dbError) {
      console.error('데이터베이스 쿼리 오류:', dbError);
      return NextResponse.json(
        { error: '데이터베이스 쿼리 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
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
  context: { params: { id: string | string[] } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // params에서 id 추출 및 유효성 검사
    if (!context.params || !context.params.id) {
      return NextResponse.json({ error: '유효하지 않은 요청입니다.' }, { status: 400 });
    }

    const id = Array.isArray(context.params.id) ? context.params.id[0] : context.params.id;
    
    if (!id) {
      return NextResponse.json({ error: '유효하지 않은 방 ID입니다.' }, { status: 400 });
    }
    
    console.log(`방 정보 수정 요청: ${id}, 사용자: ${session.user.id}`);
    
    try {
      // 방 존재 여부 확인
      const room = await prisma.room.findUnique({
        where: {
          id,
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
        console.log(`권한 없음: 사용자 ${session.user.id}는 관리자가 아닙니다.`);
        return NextResponse.json({ error: '권한이 없습니다. 방장만 수정할 수 있습니다.' }, { status: 403 });
      }

      // 요청 데이터 파싱
      let requestData;
      try {
        requestData = await request.json();
      } catch (parseError) {
        console.error('요청 데이터 파싱 오류:', parseError);
        return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
      }

      const { name, description, password } = requestData;

      if (!name) {
        return NextResponse.json({ error: '방 이름은 필수입니다.' }, { status: 400 });
      }

      // 방 정보 업데이트
      const updatedRoom = await prisma.room.update({
        where: {
          id,
        },
        data: {
          name,
          description,
          password,
        },
      });

      return NextResponse.json(updatedRoom);
    } catch (dbError) {
      console.error('데이터베이스 쿼리 오류:', dbError);
      return NextResponse.json(
        { error: '데이터베이스 조작 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
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
  context: { params: { id: string | string[] } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // params에서 id 추출 및 유효성 검사
    if (!context.params || !context.params.id) {
      return NextResponse.json({ error: '유효하지 않은 요청입니다.' }, { status: 400 });
    }

    const id = Array.isArray(context.params.id) ? context.params.id[0] : context.params.id;
    
    if (!id) {
      return NextResponse.json({ error: '유효하지 않은 방 ID입니다.' }, { status: 400 });
    }
    
    console.log(`방 삭제 요청: ${id}, 사용자: ${session.user.id}`);
    
    try {
      // 방 존재 여부 확인
      const room = await prisma.room.findUnique({
        where: {
          id,
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
        console.log(`권한 없음: 사용자 ${session.user.id}는 관리자가 아닙니다.`);
        return NextResponse.json({ error: '권한이 없습니다. 방장만 삭제할 수 있습니다.' }, { status: 403 });
      }

      // 방 삭제 - cascade 설정에 의해 관련된 멤버, 태스크도 모두 삭제됨
      await prisma.room.delete({
        where: {
          id,
        },
      });

      return NextResponse.json({ success: true, message: '성공적으로 삭제되었습니다.' });
    } catch (dbError) {
      console.error('데이터베이스 쿼리 오류:', dbError);
      return NextResponse.json(
        { error: '데이터베이스 조작 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('방 삭제 중 오류 발생:', error);
    return NextResponse.json(
      { error: '방을 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 