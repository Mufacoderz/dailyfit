import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const exercises = await prisma.exercise.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(exercises);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { name, category, type, muscleGroup, reps, sets, durationSeconds, timeSets } = await req.json();

  if (!name || !category || !type || !muscleGroup) {
    return NextResponse.json({ message: "Field wajib tidak lengkap" }, { status: 400 });
  }

  const exercise = await prisma.exercise.create({
    data: {
      userId: session.user.id,
      name,
      category,
      type,
      muscleGroup,
      reps: reps ?? null,
      sets: sets ?? null,
      durationSeconds: durationSeconds ?? null,
      timeSets: timeSets ?? null,
    },
  });

  return NextResponse.json(exercise, { status: 201 });
}
