import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const dailyGoalSchema = z.object({
  dailyGoal: z.number().min(0.01),
});

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const data = dailyGoalSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { dailyGoal: data.dailyGoal },
    });

    return NextResponse.json({ dailyGoal: updatedUser.dailyGoal });
  } catch (error) {
    console.error("Error updating daily goal:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
