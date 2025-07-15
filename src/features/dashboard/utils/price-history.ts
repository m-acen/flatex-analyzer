import { DateValue } from "../logic/analyze";
import { PriceHistoryResponse } from "../types/price-history";

export function priceHistoryToDateValues(
  priceHistory: PriceHistoryResponse,
  ticker: string
): DateValue[] {
  const { dates, prices } = priceHistory;
  const priceArr = prices[ticker];

  if (!priceArr) throw new Error(`Ticker ${ticker} not found in price history`);

  return dates.map((dateStr, i) => ({
    date: new Date(dateStr),
    value: priceArr[i],
  }));
}
