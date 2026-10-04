import { NextRequest, NextResponse } from 'next/server';
import { getRoom, updateStudentScore } from '@/lib/roomStore';

export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const body = await request.json();
    const { studentId, score, matchedPairsCount, completed, timeTakenSeconds } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const room = getRoom(params.code);
    if (!room) {
      return NextResponse.json(
        { error: 'ไม่พบห้องกิจกรรมนี้' },
        { status: 404 }
      );
    }

    const result = updateStudentScore(params.code, studentId, {
      score,
      matchedPairsCount,
      completed,
      timeTakenSeconds,
    });

    if (!result) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลนักเรียนในห้องนี้' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      student: result.student,
    });
  } catch (error) {
    console.error('Error updating score:', error);
    return NextResponse.json(
      { error: 'Failed to update score' },
      { status: 500 }
    );
  }
}
