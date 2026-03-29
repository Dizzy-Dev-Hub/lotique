import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getTimeRemaining(endDate: string | Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
  isEnded: boolean;
} {
  const total = new Date(endDate).getTime() - Date.now();

  if (total <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      total: 0,
      isEnded: true,
    };
  }

  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((total % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((total % (1000 * 60)) / 1000),
    total,
    isEnded: false,
  };
}

export function formatTimeRemaining(endDate: string | Date): string {
  const time = getTimeRemaining(endDate);

  if (time.isEnded) return "Ended";

  if (time.days > 0) {
    return `${time.days}d ${time.hours}h`;
  }
  if (time.hours > 0) {
    return `${time.hours}h ${time.minutes}m`;
  }
  if (time.minutes > 0) {
    return `${time.minutes}m ${time.seconds}s`;
  }
  return `${time.seconds}s`;
}

export function calculateMinimumBid(
  currentBid: number,
  startingBid: number,
  totalBids: number,
): number {
  if (totalBids === 0) return startingBid;

  // Standard bid increments
  if (currentBid < 100) return currentBid + 5;
  if (currentBid < 500) return currentBid + 10;
  if (currentBid < 1000) return currentBid + 25;
  if (currentBid < 5000) return currentBid + 50;
  if (currentBid < 10000) return currentBid + 100;
  if (currentBid < 25000) return currentBid + 250;
  if (currentBid < 50000) return currentBid + 500;
  if (currentBid < 100000) return currentBid + 1000;
  return currentBid + 2500;
}

export function getBidderDisplayName(bidderNumber?: number): string {
  if (!bidderNumber) return "Anonymous";
  return `Bidder #${bidderNumber.toString().padStart(3, "0")}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}
