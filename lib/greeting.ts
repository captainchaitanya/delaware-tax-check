export function greetingFor(
  companyName: string,
  now: Date = new Date(),
  firstName?: string,
): string {
  const hour = now.getHours();
  const when =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const name = firstName?.trim();
  if (name) {
    return `${when}, ${name}`;
  }
  return `${when}. Here's ${companyName}'s desk.`;
}
