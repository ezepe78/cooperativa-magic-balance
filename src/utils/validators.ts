
/**
 * Validates that a check number is exactly 8 digits
 * @param value - The check number to validate
 * @returns Whether the check number is valid
 */
export const isValidCheckNumber = (value: string): boolean => {
  return /^\d{8}$/.test(value);
};

/**
 * Validates that a vendor name is at most 100 characters
 * @param value - The vendor name to validate
 * @returns Whether the vendor name is valid
 */
export const isValidVendorName = (value: string): boolean => {
  return value.length <= 100;
};

/**
 * Validates that an amount is a positive number
 * @param value - The amount to validate
 * @returns Whether the amount is valid
 */
export const isValidAmount = (value: number): boolean => {
  return !isNaN(value) && value > 0;
};

/**
 * Validates that a date is not in the future
 * @param value - The date to validate
 * @returns Whether the date is valid
 */
export const isValidDate = (value: Date): boolean => {
  const now = new Date();
  now.setHours(23, 59, 59, 999); // End of today
  return value <= now;
};
