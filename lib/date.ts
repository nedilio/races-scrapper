export function formatDate(dateStr: string): string {
  const currentYear = new Date().getFullYear();
  return dateStr.replace(/(\d{2})\.(\d{2})/g, `${currentYear}-$2-$1`);
}

export function isRaceActive(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parts = dateStr.split(" - ");
  const start = new Date(parts[0] ?? "");
  const end = new Date(parts[1] ?? parts[0] ?? "");

  return today >= start && today <= end;
}
