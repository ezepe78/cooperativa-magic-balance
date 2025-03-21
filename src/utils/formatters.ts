
/**
 * Formats a number as Argentine Peso (ARS)
 * @param amount - The amount to format
 * @returns The formatted amount string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formats a date string to DD/MM/YYYY format
 * @param dateString - The date string to format
 * @returns The formatted date string
 */
export const formatDate = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

/**
 * Pads a check number with leading zeros to ensure it's 8 digits
 * @param value - The check number to pad
 * @returns The padded check number
 */
export const padCheckNumber = (value: string): string => {
  // Remove any non-digit characters
  const digitsOnly = value.replace(/\D/g, '');
  // Pad with leading zeros to ensure 8 digits
  return digitsOnly.padStart(8, '0');
};

/**
 * Calculates the final balance based on initial balance and transactions
 * @param initialBalance - The initial balance
 * @param transactions - Array of transactions
 * @returns The final balance
 */
export const calculateBalance = (
  initialBalance: number,
  transactions: Array<{ type: 'income' | 'expense'; amount: number }>
): number => {
  return transactions.reduce((acc, transaction) => {
    if (transaction.type === 'income') {
      return acc + transaction.amount;
    } else {
      return acc - transaction.amount;
    }
  }, initialBalance);
};
