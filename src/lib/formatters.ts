/**
 * Format number to Vietnamese/European format
 * Example: 1234.56 => "1.234,56"
 */
export const fmt = (n: number) => {
  // EU/VN format: 100.000,00 (dấu chấm ngăn nghìn, dấu phẩy thập phân)
  const [integer, decimal] = n.toFixed(2).split(".");
  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formattedInteger},${decimal}`;
};

/**
 * Format price with custom decimal places
 */
export const formatPrice = (
  price: string | number,
  decimals: number = 2
): string => {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format quantity
 */
export const formatQty = (qty: string | number, decimals: number = 8): string => {
  const num = typeof qty === "string" ? parseFloat(qty) : qty;
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};
