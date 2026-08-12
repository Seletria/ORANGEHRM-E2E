export function isoToUiDate(isoDate, placeholder) {
  const [year, month, day] = isoDate.split('-');
  const parts = { yyyy: year, mm: month, dd: day };

  return placeholder
    .toLowerCase()
    .split('-')
    .map(segment => parts[segment])
    .join('-');
}

export function getIsoDateFromNow(offsetDays) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isWeekend(isoDate) {
  const day = new Date(isoDate).getDay();
  return day === 0 || day === 6;
}

export function getRandomWorkdayIsoDate(minOffsetDays, maxOffsetDays) {
  if (maxOffsetDays <= minOffsetDays) {
    throw new Error(
      `Invalid offset range: maxOffsetDays (${maxOffsetDays}) must be greater than minOffsetDays (${minOffsetDays}). ` +
      `This usually means the leave period is ending soon and there isn't enough room to pick a valid date.`
    );
  }

  let candidate;
  do {
    const offset = minOffsetDays + Math.floor(Math.random() * (maxOffsetDays - minOffsetDays));
    candidate = getIsoDateFromNow(offset);
  } while (isWeekend(candidate));
  return candidate;
}