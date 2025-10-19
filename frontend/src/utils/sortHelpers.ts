/**
 * Utility functions for sorting data in tables
 */

/**
 * Parse a price value that might be a string with currency symbols and commas
 * Examples: "$1,234.56", "1234.56", 1234.56 => 1234.56
 */
export function parsePrice(value: string | number | undefined | null): number {
  if (value === undefined || value === null) return 0;
  
  if (typeof value === 'number') return value;
  
  // Remove currency symbols, commas, and whitespace
  const cleaned = value.toString().replace(/[$,\s]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parse a numeric value that might be a string
 */
export function parseNumeric(value: string | number | undefined | null): number {
  if (value === undefined || value === null) return 0;
  
  if (typeof value === 'number') return value;
  
  const parsed = parseFloat(value.toString());
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Generic sort comparator for any value type
 */
export function compareValues<T>(
  a: T,
  b: T,
  direction: 'asc' | 'desc' = 'asc'
): number {
  if (a < b) return direction === 'asc' ? -1 : 1;
  if (a > b) return direction === 'asc' ? 1 : -1;
  return 0;
}
