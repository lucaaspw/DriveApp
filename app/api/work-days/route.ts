import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const workDaySchema = z.object({
  date: z.string(),
  hoursWorked: z.number().min(0.5).max(24),
  kmDriven: z.number().min(1),
  uberEarnings: z.number().min(0),
  ninetynineEarnings: z.number().min(0),
  inDriveEarnings: z.number().min(0),
  // Campo opcional de combustível
  fuelAmount: z.number().min(0).optional(),
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
    const data = workDaySchema.parse(body);

    // Converter string de data (YYYY-MM-DD) para Date preservando o dia correto
    // Usar UTC para evitar problemas de timezone que podem resultar em um dia anterior
    const [year, month, day] = data.date.split('-').map(Number);
    const workDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

    // Criar ou atualizar dia de trabalho
    const workDay = await prisma.workDay.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: workDate,
        },
      },
      update: {
        hoursWorked: data.hoursWorked,
        kmDriven: data.kmDriven,
        uberEarnings: data.uberEarnings,
        ninetynineEarnings: data.ninetynineEarnings,
        inDriveEarnings: data.inDriveEarnings,
      },
      create: {
        userId: user.id,
        date: workDate,
        hoursWorked: data.hoursWorked,
        kmDriven: data.kmDriven,
        uberEarnings: data.uberEarnings,
        ninetynineEarnings: data.ninetynineEarnings,
        inDriveEarnings: data.inDriveEarnings,
      },
    });

    // Se houver dados de combustível, criar registro de abastecimento
    if (data.fuelAmount && data.fuelAmount > 0) {
      await prisma.fueling.create({
        data: {
          userId: user.id,
          amount: data.fuelAmount,
          kmDriven: 0, // Campo não mais usado, mantido para compatibilidade com o schema
          date: workDate,
        },
      });
    }

    return NextResponse.json(workDay);
  } catch (error) {
    console.error("Error creating work day:", error);
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
