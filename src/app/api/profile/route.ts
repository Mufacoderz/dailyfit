import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { name, avatar } = await req.json();

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: name ?? undefined,
      avatar: avatar ?? undefined,
    },
    select: { id: true, name: true, email: true, avatar: true },
  });

  return NextResponse.json(user);
}
