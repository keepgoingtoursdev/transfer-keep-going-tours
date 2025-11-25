export function onlyDigits(value: string): string {
  return (value || "").replace(/\D/g, "");
}

export function maskCep(value: string): string {
  const digits = onlyDigits(value).slice(0, 8);
  if (!digits) return "";
  return digits.length > 5
    ? `${digits.slice(0, 5)}-${digits.slice(5)}`
    : digits;
}

export function maskPhone(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (!d) return "";
  const part1 = d.slice(0, 2);
  if (d.length <= 10) {
    const part2 = d.slice(2, 6);
    const part3 = d.slice(6, 10);
    return `(${part1}) ${part2}${part3 ? `-${part3}` : ""}`.trim();
  }
  const part2b = d.slice(2, 7);
  const part3b = d.slice(7, 11);
  return `(${part1}) ${part2b}${part3b ? `-${part3b}` : ""}`.trim();
}

// Máscara para datas no padrão brasileiro dd/mm/aaaa
// Aceita qualquer entrada, mantendo apenas dígitos e inserindo as barras.
export function maskDateBR(value: string): string {
  const d = onlyDigits(value).slice(0, 8);
  if (!d) return "";
  const dd = d.slice(0, 2);
  const mm = d.slice(2, 4);
  const yyyy = d.slice(4, 8);
  if (d.length <= 2) return dd;
  if (d.length <= 4) return `${dd}/${mm}`;
  return `${dd}/${mm}/${yyyy}`;
}
