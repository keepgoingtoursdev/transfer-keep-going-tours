// Utilitário para formatar datas no padrão brasileiro dd/mm/aaaa
// Aceita entradas no formato ISO (yyyy-mm-dd) ou apenas dígitos (yyyymmdd)
// Caso não consiga identificar, retorna a string original.
export function formatDateBR(dateStr: string): string {
  if (!dateStr) return "";
  // Remove qualquer caractere que não seja dígito
  const digits = dateStr.replace(/[^0-9]/g, "");
  if (digits.length >= 8) {
    const yyyy = digits.slice(0, 4);
    const mm = digits.slice(4, 6);
    const dd = digits.slice(6, 8);
    return `${dd}/${mm}/${yyyy}`;
  }
  return dateStr;
}

// Converte dd/mm/aaaa para formato ISO yyyy-mm-dd
export function parseDateBRToISO(dateStr: string): string {
  if (!dateStr) return "";
  const m = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return "";
  const [_, dd, mm, yyyy] = m;
  return `${yyyy}-${mm}-${dd}`;
}
