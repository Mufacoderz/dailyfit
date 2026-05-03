import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.exercise.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return NextResponse.json({ message: "Tidak ditemukan" }, { status: 404 });

  const exercise = await prisma.exercise.update({
    where: { id },
    data: {
      name: body.name ?? existing.name,
      category: body.category ?? existing.category,
      type: body.type ?? existing.type,
      muscleGroup: body.muscleGroup ?? existing.muscleGroup,
      reps: body.reps ?? null,
      sets: body.sets ?? null,
      durationSeconds: body.durationSeconds ?? null,
      timeSets: body.timeSets ?? null,
    },
  });

  return NextResponse.json(exercise);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.exercise.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return NextResponse.json({ message: "Tidak ditemukan" }, { status: 404 });

  await prisma.exercise.delete({ where: { id } });
  return NextResponse.json({ message: "Berhasil dihapus" });
}
