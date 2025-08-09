import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get user initials from full name
 * @param name - Full name of the user
 * @param maxInitials - Maximum number of initials to return (default: 2)
 * @returns User initials in uppercase
 */
export function getUserInitials(name: string, maxInitials = 2): string {
  if (!name || typeof name !== "string") {
    return "?";
  }

  // Clean the name: trim whitespace and remove extra spaces
  const cleanName = name.trim().replace(/\s+/g, " ");

  if (cleanName.length === 0) {
    return "?";
  }

  // Split name into words and filter out empty strings
  const words = cleanName.split(" ").filter((word) => word.length > 0);

  if (words.length === 0) {
    return "?";
  }

  // If only one word, take first character(s)
  if (words.length === 1) {
    const word = words[0];
    if (maxInitials === 1) {
      return word.charAt(0).toUpperCase();
    }
    // For single word with maxInitials > 1, take first 2 characters if available
    return word.substring(0, Math.min(maxInitials, word.length)).toUpperCase();
  }

  // Multiple words: take first character of each word up to maxInitials
  const initials = words
    .slice(0, maxInitials)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  return initials;
}
