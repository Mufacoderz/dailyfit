import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const { id } = await params;

  const existing = await prisma.plan.findFirst({
    where: { id, userId },
  });
  if (!existing) return NextResponse.json({ message: "Tidak ditemukan" }, { status: 404 });

  await prisma.plan.delete({ where: { id } });
  return NextResponse.json({ message: "Berhasil dihapus" });
}
