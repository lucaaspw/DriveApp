import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const workDaySchema = z.object({
  date: z.string(),
  hoursWorked: z.number().min(0.5).max(24),
  kmDriven: z.number().min(1),
  tripsCount: z.number().min(0).optional(),
  uberEarnings: z.number().min(0),
  ninetynineEarnings: z.number().min(0),
  inDriveEarnings: z.number().min(0),
  // Campo opcional de combustível
  fuelAmount: z.number().min(0).optional(),
});

const updateWorkDaySchema = z.object({
  hoursWorked: z.number().min(0.5).max(24).optional(),
  kmDriven: z.number().min(1).optional(),
  tripsCount: z.number().min(0).optional().nullable(),
  uberEarnings: z.number().min(0).optional(),
  ninetynineEarnings: z.number().min(0).optional(),
  inDriveEarnings: z.number().min(0).optional(),
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const date = searchParams.get("date");

    if (!id && !date) {
      return NextResponse.json(
        { error: "ID or date is required" },
        { status: 400 }
      );
    }

    let workDay;
    if (id) {
      workDay = await prisma.workDay.findFirst({
        where: {
          id,
          userId: user.id,
        },
      });
    } else if (date) {
      const [year, month, day] = date.split('-').map(Number);
      const workDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      
      workDay = await prisma.workDay.findUnique({
        where: {
          userId_date: {
            userId: user.id,
            date: workDate,
          },
        },
      });
    }

    if (!workDay) {
      return NextResponse.json(
        { error: "Work day not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(workDay);
  } catch (error) {
    console.error("Error fetching work day:", error);
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
        tripsCount: data.tripsCount || null,
        uberEarnings: data.uberEarnings,
        ninetynineEarnings: data.ninetynineEarnings,
        inDriveEarnings: data.inDriveEarnings,
      },
      create: {
        userId: user.id,
        date: workDate,
        hoursWorked: data.hoursWorked,
        kmDriven: data.kmDriven,
        tripsCount: data.tripsCount || null,
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

    // Invalidar cache quando novos dados são criados/atualizados
    revalidateTag(`user-${user.id}-historical`);
    
    // Se for o dia de hoje, também invalidar dados atuais
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (workDate.getTime() === today.getTime()) {
      // Revalidar página do dashboard imediatamente
      revalidateTag(`dashboard-${user.id}`);
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
    const { id, ...updateData } = body;
    const data = updateWorkDaySchema.parse(updateData);

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Work day ID is required" },
        { status: 400 }
      );
    }

    // Verificar se o workDay pertence ao usuário
    const existingWorkDay = await prisma.workDay.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingWorkDay) {
      return NextResponse.json(
        { error: "Work day not found" },
        { status: 404 }
      );
    }

    // Preparar dados para atualização
    const updateFields: any = {};
    if (data.hoursWorked !== undefined) updateFields.hoursWorked = data.hoursWorked;
    if (data.kmDriven !== undefined) updateFields.kmDriven = data.kmDriven;
    if (data.tripsCount !== undefined) updateFields.tripsCount = data.tripsCount;
    if (data.uberEarnings !== undefined) updateFields.uberEarnings = data.uberEarnings;
    if (data.ninetynineEarnings !== undefined) updateFields.ninetynineEarnings = data.ninetynineEarnings;
    if (data.inDriveEarnings !== undefined) updateFields.inDriveEarnings = data.inDriveEarnings;

    const workDay = await prisma.workDay.update({
      where: { id },
      data: updateFields,
    });

    // Invalidar cache quando dados são atualizados
    revalidateTag(`user-${user.id}-historical`);
    
    // Se for o dia de hoje, também invalidar dados atuais
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const workDate = new Date(existingWorkDay.date);
    workDate.setHours(0, 0, 0, 0);
    if (workDate.getTime() === today.getTime()) {
      revalidateTag(`dashboard-${user.id}`);
    }

    return NextResponse.json(workDay);
  } catch (error) {
    console.error("Error updating work day:", error);
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
