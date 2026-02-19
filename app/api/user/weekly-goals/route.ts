import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const weeklyGoalSchema = z.object({
  monday: z.number().min(0),
  tuesday: z.number().min(0),
  wednesday: z.number().min(0),
  thursday: z.number().min(0),
  friday: z.number().min(0),
  saturday: z.number().min(0),
  sunday: z.number().min(0),
  weeklyTotal: z.number().min(0),
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let weeklyGoal = await prisma.weeklyGoal.findUnique({
      where: { userId: user.id },
    });

    // Se não existir, criar com valores padrão
    if (!weeklyGoal) {
      weeklyGoal = await prisma.weeklyGoal.create({
        data: {
          userId: user.id,
          monday: 400,
          tuesday: 470,
          wednesday: 470,
          thursday: 470,
          friday: 550,
          saturday: 390,
          sunday: 0,
          weeklyTotal: 2750,
        },
      });
    }

    return NextResponse.json(weeklyGoal);
  } catch (error) {
    console.error("Error fetching weekly goals:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const data = weeklyGoalSchema.parse(body);

    // Verificar se já existe
    const existing = await prisma.weeklyGoal.findUnique({
      where: { userId: user.id },
    });

    let weeklyGoal;
    if (existing) {
      weeklyGoal = await prisma.weeklyGoal.update({
        where: { userId: user.id },
        data,
      });
    } else {
      weeklyGoal = await prisma.weeklyGoal.create({
        data: {
          userId: user.id,
          ...data,
        },
      });
    }

    return NextResponse.json(weeklyGoal);
  } catch (error) {
    console.error("Error creating/updating weekly goals:", error);
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
    const data = weeklyGoalSchema.partial().parse(body);

    // Verificar se já existe
    let weeklyGoal = await prisma.weeklyGoal.findUnique({
      where: { userId: user.id },
    });

    if (!weeklyGoal) {
      // Criar com valores padrão se não existir
      weeklyGoal = await prisma.weeklyGoal.create({
        data: {
          userId: user.id,
          monday: data.monday ?? 400,
          tuesday: data.tuesday ?? 470,
          wednesday: data.wednesday ?? 470,
          thursday: data.thursday ?? 470,
          friday: data.friday ?? 550,
          saturday: data.saturday ?? 390,
          sunday: data.sunday ?? 0,
          weeklyTotal: data.weeklyTotal ?? 2750,
        },
      });
    } else {
      weeklyGoal = await prisma.weeklyGoal.update({
        where: { userId: user.id },
        data,
      });
    }

    return NextResponse.json(weeklyGoal);
  } catch (error) {
    console.error("Error updating weekly goals:", error);
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
