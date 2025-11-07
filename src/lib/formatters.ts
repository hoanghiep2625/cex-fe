export const fmt = (n: number | string) => {
  const num = typeof n === "string" ? parseFloat(n) : n;
  if (isNaN(num) || num === null || num === undefined) {
    return "0,00";
  }
  const [integer, decimal] = num.toFixed(2).split(".");
  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formattedInteger},${decimal}`;
};

export const formatPrice = (
  price: string | number,
  decimals: number = 2
): string => {
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(num) || num === null || num === undefined) {
    return "0";
  }
  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatQty = (
  qty: string | number,
  decimals: number = 8
): string => {
  const num = typeof qty === "string" ? parseFloat(qty) : qty;
  if (isNaN(num) || num === null || num === undefined) {
    return "0";
  }
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};
export const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};
