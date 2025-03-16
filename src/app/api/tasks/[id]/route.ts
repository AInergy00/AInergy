import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/db';

// 날짜와 시간을 결합하여 DateTime 객체 생성
function parseDateTime(dateStr: string | undefined | null, timeStr: string | undefined | null): Date | null {
  try {
    if (!dateStr || !timeStr) return null;
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return null;
    
    date.setHours(hours, minutes, 0, 0);
    return date;
  } catch (e) {
    console.error('DateTime 파싱 오류:', e);
    return null;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { message: '인증되지 않은 요청입니다.' },
      { status: 401 }
    );
  }

  try {
    const task = await prisma.task.findUnique({
      where: {
        id: params.id,
      },
      include: {
        room: {
          select: {
            name: true,
          },
        },
        completions: {
          where: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { message: '업무를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 자신의 업무이거나 공유된 업무만 접근 가능
    if (task.userId !== session.user.id && !task.isShared) {
      return NextResponse.json(
        { message: '접근 권한이 없습니다.' },
        { status: 403 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('업무 조회 오류:', error);
    
    return NextResponse.json(
      { message: '업무 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { message: '인증되지 않은 요청입니다.' },
      { status: 401 }
    );
  }

  try {
    // 기존 업무 조회
    const existingTask = await prisma.task.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        { message: '업무를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 자신의 업무만 수정 가능
    if (existingTask.userId !== session.user.id) {
      return NextResponse.json(
        { message: '접근 권한이 없습니다.' },
        { status: 403 }
      );
    }

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
      calendarId,
      templateId,
      fileUrl,
      linkUrl,
      status,
    } = await req.json();

    let dueDateObj = undefined;
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

    let startTimeObj = undefined;
    let endTimeObj = undefined;

    if (startTime && (dueDate || existingTask.dueDate)) {
      const dateToUse = dueDate || existingTask.dueDate?.toISOString().split('T')[0];
      if (dateToUse) {
        startTimeObj = parseDateTime(dateToUse, startTime);
      }
    }

    if (endTime && (dueDate || existingTask.dueDate)) {
      const dateToUse = dueDate || existingTask.dueDate?.toISOString().split('T')[0];
      if (dateToUse) {
        endTimeObj = parseDateTime(dateToUse, endTime);
      }
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: params.id,
      },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(priority !== undefined && { priority }),
        ...(dueDateObj !== undefined && { dueDate: dueDateObj }),
        ...(startTimeObj !== undefined && { startTime: startTimeObj }),
        ...(endTimeObj !== undefined && { endTime: endTimeObj }),
        ...(location !== undefined && { location }),
        ...(materials !== undefined && { materials }),
        ...(notes !== undefined && { notes }),
        ...(isShared !== undefined && { isShared }),
        ...(roomId !== undefined && { roomId }),
        ...(calendarId !== undefined && { calendarId }),
        ...(templateId !== undefined && { templateId }),
        ...(fileUrl !== undefined && { fileUrl }),
        ...(linkUrl !== undefined && { linkUrl }),
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('업무 수정 오류:', error);
    
    return NextResponse.json(
      { message: '업무 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { message: '인증되지 않은 요청입니다.' },
      { status: 401 }
    );
  }

  try {
    // 기존 업무 조회
    const existingTask = await prisma.task.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        { message: '업무를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 자신의 업무만 삭제 가능
    if (existingTask.userId !== session.user.id) {
      return NextResponse.json(
        { message: '접근 권한이 없습니다.' },
        { status: 403 }
      );
    }

    await prisma.task.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: '업무가 삭제되었습니다.' });
  } catch (error) {
    console.error('업무 삭제 오류:', error);
    
    return NextResponse.json(
      { message: '업무 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 