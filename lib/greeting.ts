export function greetingFor(
  companyName: string,
  now: Date = new Date(),
): string {
  const hour = now.getHours();
  const when =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return `${when}, ${companyName}`;
}
