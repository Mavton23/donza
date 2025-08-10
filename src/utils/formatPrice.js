export function formatPrice(price) {
  const num = parseFloat(price);
  return num > 0 ? `MZN ${num.toFixed(2)}` : 'Gratuito';
}