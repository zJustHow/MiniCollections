export const COUNTRIES = [
  { code: "+86", zh: "中国大陆", en: "China" },
  { code: "+852", zh: "香港", en: "Hong Kong" },
  { code: "+853", zh: "澳门", en: "Macau" },
  { code: "+886", zh: "台湾", en: "Taiwan" },
  { code: "+1", zh: "美国/加拿大", en: "US/Canada" },
  { code: "+44", zh: "英国", en: "UK" },
  { code: "+81", zh: "日本", en: "Japan" },
  { code: "+82", zh: "韩国", en: "South Korea" },
  { code: "+65", zh: "新加坡", en: "Singapore" },
  { code: "+61", zh: "澳大利亚", en: "Australia" },
  { code: "+49", zh: "德国", en: "Germany" },
  { code: "+33", zh: "法国", en: "France" },
  { code: "+7", zh: "俄罗斯", en: "Russia" },
];

export function parsePhone(phone) {
  if (!phone) return { countryCode: "+86", phoneNumber: "" };
  const sorted = [...COUNTRIES].sort((a, b) => b.code.length - a.code.length);
  for (const { code } of sorted) {
    if (phone.startsWith(code)) {
      return { countryCode: code, phoneNumber: phone.slice(code.length) };
    }
  }
  return { countryCode: "+86", phoneNumber: phone };
}

export function formatPhoneIdentifier(countryCode, phoneNumber) {
  return `${countryCode}${phoneNumber}`;
}
