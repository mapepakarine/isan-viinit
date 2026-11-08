export function formatDecimal(value: number): string {
  return value.toFixed(1).replace('.', ',');
}

export function formatPrice(value: number): string {
  return `${value.toFixed(2).replace('.', ',')} €`;
}

/** Reads the parts directly: parsing with Date could shift the day across time zones. */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return `${day}.${month}.${year}`;
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
