export const removeInvalidZero = (str: string) => str.replace(/^0*(?=\d)/g, '');
export const onlyNumbers = (str: string) => str.replace(/\D/g, '');
export const convertCommaToDot = (str: string) => str.replace(/,/g, '.');
export const onlyNumbersWithDot = (str: string) => str.replace(/[^0-9.]/g, '');
