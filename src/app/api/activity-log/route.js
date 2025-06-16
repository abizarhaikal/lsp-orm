import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/activity-log?user_id=&action=&target=
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");
  const action = searchParams.get("action");
  const target = searchParams.get("target");
  const limit = parseInt(searchParams.get("limit")) || 100;

  const filter = {};
  if (user_id) filter.user_id = user_id;
  if (action) filter.action = action;
  if (target) filter.target = target;

  try {
    const logs = await prisma.activityLog.findMany({
      where: filter,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
      take: limit,
    });
    // Format
    const formatted = logs.map((log) => ({
      ...log,
      user_name: log.user?.name ?? null,
      user_email: log.user?.email ?? null,
      user_role: log.user?.role ?? null,
    }));

    return NextResponse.json(formatted, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
