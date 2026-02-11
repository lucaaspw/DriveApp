import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const expenseSchema = z.object({
  name: z.string().min(1),
  amount: z.number().min(0.01),
  dueDate: z.string().optional(),
  dueDay: z.number().min(1).max(31).optional(),
  category: z.string().min(1),
  isRecurring: z.boolean().optional().default(false),
}).refine((data) => {
  if (data.isRecurring) {
    return data.dueDay !== undefined;
  } else {
    return data.dueDate !== undefined && data.dueDate.length > 0;
  }
}, {
  message: "Data de vencimento ou dia do mês é obrigatório",
});

const updateExpenseSchema = z.object({
  name: z.string().min(1).optional(),
  amount: z.number().min(0.01).optional(),
  dueDate: z.string().optional(),
  dueDay: z.number().min(1).max(31).optional(),
  category: z.string().min(1).optional(),
  isPaid: z.boolean().optional(),
  paidDate: z.string().optional(),
  isRecurring: z.boolean().optional(),
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
    const onlyPending = searchParams.get("onlyPending") === "true";

    const where: any = { userId: user.id };
    if (onlyPending) {
      where.isPaid = false;
    }

    const expenses = await prisma.monthlyExpense.findMany({
      where,
      orderBy: [
        { isPaid: "asc" },
        { dueDate: "asc" },
      ],
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
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
    const data = expenseSchema.parse(body);

    let dueDate: Date;
    let recurringExpenseId: string | null = null;

    if (data.isRecurring && data.dueDay) {
      // Para despesas recorrentes, calcular a data do mês atual
      const now = new Date();
      const currentYear = now.getUTCFullYear();
      const currentMonth = now.getUTCMonth();
      
      // Usar o dia especificado, mas garantir que não ultrapasse o último dia do mês
      const lastDayOfMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0)).getUTCDate();
      const dayToUse = Math.min(data.dueDay, lastDayOfMonth);
      
      dueDate = new Date(Date.UTC(currentYear, currentMonth, dayToUse, 12, 0, 0, 0));
      
      // Verificar se já existe uma despesa recorrente similar para este mês
      const existingRecurring = await prisma.monthlyExpense.findFirst({
        where: {
          userId: user.id,
          name: data.name,
          category: data.category,
          isRecurring: true,
          dueDay: data.dueDay,
          dueDate: {
            gte: new Date(Date.UTC(currentYear, currentMonth, 1)),
            lt: new Date(Date.UTC(currentYear, currentMonth + 1, 1)),
          },
        },
      });

      if (existingRecurring) {
        return NextResponse.json(
          { error: "Já existe uma despesa recorrente com este nome e categoria para este mês" },
          { status: 400 }
        );
      }

      // Gerar um ID único para agrupar despesas recorrentes
      recurringExpenseId = `recurring_${user.id}_${data.name}_${data.category}_${data.dueDay}`;
    } else if (data.dueDate) {
      // Para despesas não recorrentes, usar a data fornecida
      const [year, month, day] = data.dueDate.split('-').map(Number);
      dueDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
    } else {
      return NextResponse.json(
        { error: "Data de vencimento ou dia do mês é obrigatório" },
        { status: 400 }
      );
    }

    const expense = await prisma.monthlyExpense.create({
      data: {
        userId: user.id,
        name: data.name,
        amount: data.amount,
        dueDate,
        category: data.category,
        isRecurring: data.isRecurring || false,
        dueDay: data.dueDay || null,
        recurringExpenseId: recurringExpenseId,
      },
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Error creating expense:", error);
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
    const { id, ...updateFields } = body;
    const data = updateExpenseSchema.parse(updateFields);

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Expense ID is required" },
        { status: 400 }
      );
    }

    // Verificar se a despesa pertence ao usuário
    const existingExpense = await prisma.monthlyExpense.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingExpense) {
      return NextResponse.json(
        { error: "Expense not found" },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.isPaid !== undefined) {
      updateData.isPaid = data.isPaid;
      if (data.isPaid && !data.paidDate) {
        // Se marcando como pago sem data, usar data atual preservando o dia correto
        const now = new Date();
        updateData.paidDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0));
        
        // Se for uma despesa recorrente, criar automaticamente a próxima instância
        if (existingExpense.isRecurring && existingExpense.dueDay) {
          const currentDueDate = new Date(existingExpense.dueDate);
          const nextMonth = currentDueDate.getUTCMonth() + 1;
          const nextYear = currentDueDate.getUTCFullYear() + (nextMonth > 11 ? 1 : 0);
          const adjustedMonth = nextMonth > 11 ? 0 : nextMonth;
          
          // Garantir que o dia não ultrapasse o último dia do mês
          const lastDayOfNextMonth = new Date(Date.UTC(nextYear, adjustedMonth + 1, 0)).getUTCDate();
          const dayToUse = Math.min(existingExpense.dueDay, lastDayOfNextMonth);
          
          const nextDueDate = new Date(Date.UTC(nextYear, adjustedMonth, dayToUse, 12, 0, 0, 0));
          
          // Verificar se já existe a próxima instância
          const nextInstance = await prisma.monthlyExpense.findFirst({
            where: {
              userId: user.id,
              recurringExpenseId: existingExpense.recurringExpenseId,
              dueDate: nextDueDate,
            },
          });

          if (!nextInstance) {
            // Criar a próxima instância
            await prisma.monthlyExpense.create({
              data: {
                userId: user.id,
                name: existingExpense.name,
                amount: existingExpense.amount,
                dueDate: nextDueDate,
                category: existingExpense.category,
                isRecurring: true,
                dueDay: existingExpense.dueDay,
                recurringExpenseId: existingExpense.recurringExpenseId,
                isPaid: false,
              },
            });
          }
        }
      } else if (!data.isPaid) {
        // Se desmarcando como pago, limpar data de pagamento
        updateData.paidDate = null;
      }
    }
    if (data.dueDate !== undefined) {
      // Converter string de data (YYYY-MM-DD) para Date preservando o dia correto
      // Usar UTC com meio-dia para evitar problemas de timezone
      const [year, month, day] = data.dueDate.split('-').map(Number);
      updateData.dueDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
    }
    if (data.paidDate !== undefined) {
      if (data.paidDate) {
        // Converter string de data (YYYY-MM-DD) para Date preservando o dia correto
        // Usar UTC com meio-dia para evitar problemas de timezone
        const [year, month, day] = data.paidDate.split('-').map(Number);
        updateData.paidDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
      } else {
        updateData.paidDate = null;
      }
    }

    const expense = await prisma.monthlyExpense.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Error updating expense:", error);
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

export async function DELETE(request: NextRequest) {
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

    if (!id) {
      return NextResponse.json(
        { error: "Expense ID is required" },
        { status: 400 }
      );
    }

    // Verificar se a despesa pertence ao usuário
    const existingExpense = await prisma.monthlyExpense.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingExpense) {
      return NextResponse.json(
        { error: "Expense not found" },
        { status: 404 }
      );
    }

    await prisma.monthlyExpense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
