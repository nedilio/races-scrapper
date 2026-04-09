export function formatDate(dateStr: string): string {
  const currentYear = new Date().getFullYear();
  return dateStr.replace(/(\d{2})\.(\d{2})/g, `${currentYear}-$2-$1`);
}
