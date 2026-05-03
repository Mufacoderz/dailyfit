import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const date = req.nextUrl.searchParams.get("date");
  if (!date) return NextResponse.json({ message: "Date diperlukan" }, { status: 400 });

  const log = await prisma.dailyLog.findUnique({
    where: {
      userId_date: {
        userId: session.user.id,
        date: new Date(date),
      },
    },
    include: {
      items: {
        include: { exercise: true },
        orderBy: { order: "asc" },
      },
    },
  });

  return NextResponse.json(log ?? { items: [] });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { date, exerciseIds, source } = await req.json();
  if (!date || !exerciseIds?.length) {
    return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
  }

  const dateObj = new Date(date);

  let log = await prisma.dailyLog.findUnique({
    where: { userId_date: { userId: session.user.id, date: dateObj } },
    include: { items: true },
  });

  if (!log) {
    log = await prisma.dailyLog.create({
      data: { userId: session.user.id, date: dateObj },
      include: { items: true },
    });
  }

  const existingIds = new Set(log.items.map((i) => i.exerciseId));
  const fresh = (exerciseIds as string[]).filter((id) => !existingIds.has(id));

  if (fresh.length === 0) {
    return NextResponse.json({ message: "Semua latihan sudah ada", added: 0 });
  }

  const maxOrder = log.items.reduce((max, i) => Math.max(max, i.order), -1);

  await prisma.dailyLogItem.createMany({
    data: fresh.map((exerciseId, i) => ({
      dailyLogId: log!.id,
      exerciseId,
      order: maxOrder + 1 + i,
      source: source ?? "manual",
      isChecked: false,
    })),
  });

  const updated = await prisma.dailyLog.findUnique({
    where: { id: log.id },
    include: {
      items: {
        include: { exercise: true },
        orderBy: { order: "asc" },
      },
    },
  });

  return NextResponse.json(updated, { status: 201 });
}
