import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day, 0, 0, 0, 0);
  return d;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const dateStr = req.nextUrl.searchParams.get("date");
  if (!dateStr) return NextResponse.json({ message: "Date diperlukan" }, { status: 400 });

  const dateObj = parseDate(dateStr);

  const log = await prisma.dailyLog.findFirst({
    where: {
      userId: session.user.id,
      date: {
        gte: dateObj,
        lt: new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate() + 1),
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
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { date, exerciseIds, source } = await req.json();
  if (!date || !exerciseIds?.length) {
    return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
  }

  const userId = session.user.id;
  const dateObj = parseDate(date);
  const nextDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate() + 1);

  let log = await prisma.dailyLog.findFirst({
    where: {
      userId,
      date: { gte: dateObj, lt: nextDay },
    },
    include: { items: true },
  });

  if (!log) {
    log = await prisma.dailyLog.create({
      data: { userId, date: dateObj },
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

  const updated = await prisma.dailyLog.findFirst({
    where: {
      userId,
      date: { gte: dateObj, lt: nextDay },
    },
    include: {
      items: {
        include: { exercise: true },
        orderBy: { order: "asc" },
      },
    },
  });

  return NextResponse.json(updated, { status: 201 });
}