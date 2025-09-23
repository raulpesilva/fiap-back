import { convertCommaToDot, onlyNumbersWithDot, removeInvalidZero } from '../regex';

export const formatCurrency = (amount: number, prefix = 'R$ ') => {
  const value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
    .format(amount)
    .replace(/R\$\s{1}/g, prefix);

  return value;
};

export const formatBRLCurrencyInput = (value: any) => {
  if (typeof value !== 'string' && typeof value !== 'number') return '';
  const stringValue = String(value);
  const formatted = onlyNumbersWithDot(convertCommaToDot(stringValue));
  const segments = formatted.split('.');
  const p1 = removeInvalidZero(segments[0] || '').slice(0, 9);
  const p2 = (segments[1] || '').slice(0, 2);
  let result = '';

  if (p1.length || p2.length) result += 'R$ ';
  if (p1.length) result += p1;
  if (!p1.length && formatted) result += '0';
  if (formatted.includes('.')) result += ',';
  if (p2.length) result += p2;

  return result;
};

export const formatBRLCurrencyDisplay = (value: number) => {
  if (!value && value !== 0) return 'R$ 0,00';
  const stringValue = String((value / 100).toFixed(2));
  const formatted = formatBRLCurrencyInput(stringValue);
  return formatted;
};

export const unformatBRLCurrencyInput = (value: string) => {
  if (!value) return 0;
  return Number(onlyNumbersWithDot(convertCommaToDot(value)));
};

export const formatBRLCurrencyPayload = (value: number) => value * 100;
