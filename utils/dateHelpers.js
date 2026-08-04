export function isoToUiDate(isoDate) {
  const [year, month, day] = isoDate.split('-');
  return `${year}-${day}-${month}`;
}