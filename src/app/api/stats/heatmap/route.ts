import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const yearAgo = new Date();
  yearAgo.setDate(yearAgo.getDate() - 364);
  yearAgo.setHours(0, 0, 0, 0);

  const logs = await prisma.dailyLog.findMany({
    where: {
      userId,
      date: { gte: yearAgo, lte: today },
    },
    include: {
      items: { select: { isChecked: true } },
    },
  });

  const map: Record<string, number> = {};
  for (const log of logs) {
    const d = new Date(log.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    map[key] = log.items.filter((i) => i.isChecked).length;
  }

  return NextResponse.json(map);
}