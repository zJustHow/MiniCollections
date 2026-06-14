type DetailField = string | { name?: string | null } | null | undefined;

export function pickDetailField(value: DetailField): string | null {
  if (value == null) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed && trimmed !== "—" ? trimmed : null;
  }
  if (typeof value === "object" && "name" in value) {
    const name = value.name;
    if (typeof name === "string") {
      const trimmed = name.trim();
      return trimmed && trimmed !== "—" ? trimmed : null;
    }
  }
  return null;
}

export function pickDetailText(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed && trimmed !== "—" ? trimmed : null;
  }
  return pickDetailField(value as DetailField);
}
