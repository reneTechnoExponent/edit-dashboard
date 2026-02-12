import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extract error message from API error response
 * Handles various error formats from RTK Query
 */
export function extractErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const err = error as {
      data?: { message?: string };
      error?: string;
      status?: string | number;
    };

    // Check for network/fetch errors
    if (err.status === 'FETCH_ERROR') {
      return 'Network error. Please check your connection.';
    }

    // Extract message from API response
    if (err.data?.message) {
      return err.data.message;
    }

    // Fallback to error string
    if (err.error) {
      return err.error;
    }
  }

  return 'An unexpected error occurred';
}
