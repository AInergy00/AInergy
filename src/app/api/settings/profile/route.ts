import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

// 프로필 정보 조회
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('프로필 정보 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '프로필 정보를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 프로필 정보 업데이트
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const { name, currentPassword, newPassword } = await request.json();
    
    // 현재 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 업데이트할 데이터 준비
    const updateData: any = {};
    
    if (name) updateData.name = name;
    
    // 비밀번호 변경 요청이 있는 경우
    if (newPassword && currentPassword) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      
      if (!isPasswordValid) {
        return NextResponse.json({ error: '현재 비밀번호가 일치하지 않습니다.' }, { status: 400 });
      }
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    // 업데이트할 내용이 없으면 바로 반환
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        success: true,
        message: '변경된 내용이 없습니다.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      });
    }

    // 사용자 정보 업데이트
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: '프로필 정보가 업데이트되었습니다.',
      user: updatedUser,
    });
  } catch (error) {
    console.error('프로필 정보 업데이트 중 오류 발생:', error);
    return NextResponse.json(
      { error: '프로필 정보를 업데이트하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 