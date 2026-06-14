export function pickLocalizedField(
  record: Record<string, unknown> | null | undefined,
  keys: { enKey: string; zhKey: string; singleKey?: string },
  locale: string,
) {
  if (!record) return undefined;
  if (keys.singleKey && record[keys.singleKey]) {
    return String(record[keys.singleKey]);
  }
  const preferZh = locale === "zh-CN";
  const en = record[keys.enKey];
  const zh = record[keys.zhKey];
  if (preferZh) return (zh || en) as string | undefined;
  return (en || zh) as string | undefined;
}

export function pickBrandName(
  record: Record<string, unknown> | null | undefined,
  locale: string,
) {
  return pickLocalizedField(
    record,
    {
      enKey: "brand_name_en",
      zhKey: "brand_name_zh",
      singleKey: "brand",
    },
    locale,
  );
}
