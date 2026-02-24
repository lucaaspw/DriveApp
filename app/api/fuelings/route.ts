import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const fuelingSchema = z.object({
  amount: z.number().min(0.01),
});

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
    const data = fuelingSchema.parse(body);

    const fueling = await prisma.fueling.create({
      data: {
        userId: user.id,
        amount: data.amount,
        kmDriven: 0, // Campo não mais usado, mantido para compatibilidade com o schema
      },
    });

    // Invalidar cache quando novos dados são criados
    revalidateTag(`user-${user.id}-historical`);
    
    // Se for o dia de hoje, também invalidar dados atuais
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fuelingDate = fueling.date instanceof Date ? fueling.date : new Date(fueling.date);
    if (fuelingDate.getTime() === today.getTime()) {
      revalidateTag(`dashboard-${user.id}`);
    }

    return NextResponse.json(fueling);
  } catch (error) {
    console.error("Error creating fueling:", error);
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
