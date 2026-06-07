export function pickLocalizedField(
  record,
  { enKey, zhKey, singleKey },
  locale,
) {
  if (!record) return undefined;
  if (singleKey && record[singleKey]) return record[singleKey];
  const preferZh = locale === "zh-CN";
  const en = record[enKey];
  const zh = record[zhKey];
  if (preferZh) return zh || en;
  return en || zh;
}

export function pickBrandName(record, locale) {
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
