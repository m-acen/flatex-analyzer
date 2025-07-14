import { DateValue } from "../logic/analyze";

export function getLatestDateValue(
  sortedDateValues: DateValue[],
  date: Date
): DateValue | null {
  if (sortedDateValues.length === 0) return null;

  // Find the last entry that is before or on the given date
  for (let i = sortedDateValues.length - 1; i >= 0; i--) {
    if (sortedDateValues[i].date <= date) {
      return sortedDateValues[i];
    }
  }

  // If no entry found, return null
  return null;
}
