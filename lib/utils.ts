import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: Date | string): string {
  let d: Date;
  
  if (typeof date === 'string') {
    // Se for uma string no formato YYYY-MM-DD, criar Date usando UTC preservando o dia
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [year, month, day] = date.split('-').map(Number);
      d = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    } else {
      // Caso contrário, tentar parsear normalmente
      d = new Date(date);
    }
  } else {
    d = date;
  }
  
  // Usar UTC para extrair os valores e formatar, garantindo que o dia não mude
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  
  return `${day}/${month}/${year}`;
}

export function formatTime(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  return `${h}h${m > 0 ? ` ${m}m` : ''}`;
}
