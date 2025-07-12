import dayjs from "dayjs";
import { ParsedAccountTransaction } from "../types/account-transaction";
import { Asset } from "../types/asset";
import { ISO_FORMAT } from "../utils/date-parse";
import { isInOutGoingTransaction } from "../utils/transaction-filter";

export interface DateValue {
  date: Date;
  value: number;
}

export function calculatePortfolioIndex(
  portfolioValues: DateValue[],
  cashflows: DateValue[],
  startDate?: Date,
  endDate?: Date
): { date: Date; index: number }[] {
  if (portfolioValues.length === 0) return [];

  // Filter portfolioValues by date range
  const filteredPortfolio = portfolioValues.filter(
    (entry) =>
      (!startDate || entry.date >= startDate) &&
      (!endDate || entry.date <= endDate)
  );
  if (filteredPortfolio.length === 0) return [];

  // Ensure cashflows are sorted and filtered by date range
  const cashflowsSorted = [...cashflows]
    .filter(
      (cf) =>
        (!startDate || cf.date >= startDate) &&
        (!endDate || cf.date <= endDate)
    )
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  let cfIndex = 0; // pointer to current cashflow

  const result: { date: Date; index: number }[] = [];
  let prevValue = filteredPortfolio[0].value;
  let index = 1; // normalized index starts at 1

  result.push({ date: filteredPortfolio[0].date, index });

  for (let i = 1; i < filteredPortfolio.length; i++) {
    const currDate = filteredPortfolio[i].date;
    const currValue = filteredPortfolio[i].value;

    // Sum all cashflows between previous and current date (exclusive of currDate)
    let cfAmount = 0;
    while (
      cfIndex < cashflowsSorted.length &&
      cashflowsSorted[cfIndex].date > filteredPortfolio[i - 1].date &&
      cashflowsSorted[cfIndex].date <= currDate
    ) {
      cfAmount += cashflowsSorted[cfIndex].value;
      cfIndex++;
    }

    // Time-weighted subperiod return
    const subperiodReturn = (currValue - prevValue - cfAmount) / prevValue;

    // Update index
    index = index * (1 + subperiodReturn);

    result.push({ date: currDate, index });

    prevValue = currValue;
  }

  return result;
}

export function getInitialInvestment(
  accountTransactions: ParsedAccountTransaction[]
) {
  let totalInvestment = 0;
  accountTransactions.forEach((tx) => {
    if (isInOutGoingTransaction(tx)) totalInvestment += tx.Betrag;
  });
  return totalInvestment;
}

export function getCashPosition(
  accountTransactions: ParsedAccountTransaction[]
) {
  let cashPosition = 0;
  accountTransactions.forEach((tx) => {
    cashPosition += tx.Betrag;
  });
  return cashPosition;
}

export function getDepotSum(assets: Asset[]) {
  let depotSum = 0;
  assets.forEach((item) => {
    if (item.currentPositionValue) {
      depotSum += item.currentPositionValue;
    }
  });
  return depotSum;
}

function XIRR(values: number[], dates: Date[], guess: number = 0.1): number {
  // Credits: algorithm inspired by Apache OpenOffice

  // Calculates the resulting amount
  var irrResult = function (values, dates, rate) {
    var r = rate + 1;
    var result = values[0];
    for (var i = 1; i < values.length; i++) {
      result +=
        values[i] /
        Math.pow(r, dayjs(dates[i]).diff(dayjs(dates[0]), "days") / 365);
    }
    return result;
  };

  // Calculates the first derivation
  var irrResultDeriv = function (values, dates, rate) {
    var r = rate + 1;
    var result = 0;
    for (var i = 1; i < values.length; i++) {
      var frac = dayjs(dates[i]).diff(dayjs(dates[0]), "days") / 365;
      result -= (frac * values[i]) / Math.pow(r, frac + 1);
    }
    return result;
  };

  // Check that values contains at least one positive value and one negative value
  var positive = false;
  var negative = false;
  for (var i = 0; i < values.length; i++) {
    if (values[i] > 0) positive = true;
    if (values[i] < 0) negative = true;
  }

  // Return error if values does not contain at least one positive value and one negative value
  if (!positive || !negative) return 0;

  // Initialize guess and resultRate
  var resultRate = guess;

  // Set maximum epsilon for end of iteration
  var epsMax = 1e-10;

  // Set maximum number of iterations
  var iterMax = 50;

  // Implement Newton's method
  var newRate, epsRate, resultValue;
  var iteration = 0;
  var contLoop = true;
  do {
    resultValue = irrResult(values, dates, resultRate);
    newRate =
      resultRate - resultValue / irrResultDeriv(values, dates, resultRate);
    epsRate = Math.abs(newRate - resultRate);
    resultRate = newRate;
    contLoop = epsRate > epsMax && Math.abs(resultValue) > epsMax;
  } while (contLoop && ++iteration < iterMax);

  if (contLoop) return 0;

  // Return internal rate of return
  return resultRate;
}

export function getAccountCashFlows(
  accountTransactions: ParsedAccountTransaction[],
  factor = -1
) {
  return accountTransactions
    .filter((tx) => isInOutGoingTransaction(tx))
    .map((tx) => ({
      date: new Date(tx.Valuta),
      value: tx.Betrag * factor,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function calculateXIRR(
  accountTransactions: ParsedAccountTransaction[],
  assets: Asset[]
) {
  try {
    const currentValue =
      getDepotSum(assets) + getCashPosition(accountTransactions);
    let cashFlows: DateValue[] = getAccountCashFlows(accountTransactions);

    if (cashFlows.length < 2) {
      console.error(
        "At least two cash flows are required for XIRR calculation"
      );
      return 0; // Not enough data to calculate XIRR
    }

    cashFlows = [
      {
        date: new Date(),
        value: currentValue,
      },
      ...cashFlows,
    ];
    return XIRR(
      cashFlows.map((cf) => cf.value),
      cashFlows.map((cf) => cf.date)
    );
  } catch (error) {
    console.error("Error calculating XIRR:", error);
    return 0; // Return 0 or handle error as needed
  }
}

export function getAccumulatedCashFlows(
  accountTransactions: ParsedAccountTransaction[]
): DateValue[] {
  const cashFlows: DateValue[] = [];
  let accumulatedValue = 0;

  // Sort transactions for deterministic accumulation
  const sortedTransactions = [...accountTransactions].sort(
    (a, b) => new Date(a.Valuta).getTime() - new Date(b.Valuta).getTime()
  );

  const seenDates = new Set<string>();

  for (const tx of sortedTransactions) {
    if (!isInOutGoingTransaction(tx)) continue; // Skip transactions without IBAN
    const dateKey = dayjs(tx.Valuta).format(ISO_FORMAT);
    accumulatedValue += tx.Betrag;

    if (!seenDates.has(dateKey)) {
      seenDates.add(dateKey);
      cashFlows.push({
        date: dayjs(tx.Valuta).toDate(),
        value: accumulatedValue,
      });
    } else {
      // Update last entry (same day, multiple transactions)
      cashFlows[cashFlows.length - 1].value = accumulatedValue;
    }
  }

  return cashFlows;
}

export function getAccumulatedCashPosition(
  accountTransactions: ParsedAccountTransaction[]
): DateValue[] {
  const result: DateValue[] = [];
  const sortedTransactions = [...accountTransactions].sort(
    (a, b) => new Date(a.Valuta).getTime() - new Date(b.Valuta).getTime()
  );

  let totalCash = 0;
  const dateToTotal = new Map<string, number>();

  for (const tx of sortedTransactions) {
    const dateKey = dayjs(tx.Valuta).format(ISO_FORMAT);
    totalCash += tx.Betrag;
    dateToTotal.set(dateKey, totalCash);
  }

  for (const [dateKey, value] of dateToTotal.entries()) {
    result.push({
      date: dayjs(dateKey).toDate(),
      value,
    });
  }

  return result;
}

export function getAccumulatedDepotValue(
  assets: Asset[],
  startDate: Date,
  endDate: Date
): DateValue[] {
  const start = dayjs(startDate).startOf("day");
  const end = dayjs(endDate).startOf("day");

  const result: DateValue[] = [];

  const assetPriceMaps = new Map<Asset, Map<string, number>>();
  const assetQuantityByDate = new Map<Asset, Map<string, number>>();

  for (const asset of assets) {
    const priceMap = new Map<string, number>();
    for (const entry of asset.priceHistory || []) {
      priceMap.set(dayjs(entry.date).format(ISO_FORMAT), entry.price);
    }
    assetPriceMaps.set(asset, priceMap);

    const quantityMap = new Map<string, number>();
    let cumulative = 0;
    const sortedTx = [...(asset.depotTransactions || [])].sort(
      (a, b) => new Date(a.Valuta).getTime() - new Date(b.Valuta).getTime()
    );

    for (
      let date = start.clone();
      !date.isAfter(end);
      date = date.add(1, "day")
    ) {
      const currentDay = date.format(ISO_FORMAT);
      for (const tx of sortedTx) {
        if (dayjs(tx.Valuta).isSame(date, "day")) {
          cumulative += tx.Nominal;
        }
      }
      quantityMap.set(currentDay, cumulative);
    }

    assetQuantityByDate.set(asset, quantityMap);
  }

  function median(values: number[]): number | null {
    if (values.length === 0) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  let weekBuffer: { date: Date; value: number }[] = [];

  for (
    let date = start.clone();
    !date.isAfter(end);
    date = date.add(1, "day")
  ) {
    const dateKey = date.format(ISO_FORMAT);
    let dailyValue = 0;

    for (const asset of assets) {
      const price = assetPriceMaps.get(asset)?.get(dateKey) ?? 0;
      const quantity = assetQuantityByDate.get(asset)?.get(dateKey) ?? 0;
      dailyValue += price * quantity;
    }

    weekBuffer.push({
      date: date.toDate(),
      value: dailyValue,
    });

    const isMedianDay =
      date.date() === 1 || date.date() === 15 || date.isSame(end, "day");
    if (isMedianDay) {
      const values = weekBuffer
        .map((entry) => entry.value)
        .filter((v) => v > 0);
      const weekMedian = median(values);

      for (const entry of weekBuffer) {
        if (
          entry.date.getDate() === 1 ||
          entry.date.getDate() === 15 ||
          dayjs(entry.date).isSame(end, "day")
        ) {
          result.push({
            date: entry.date,
            value: weekMedian,
          });
        }
      }

      weekBuffer = [];
    }
  }

  return result;
}

export function getCombinedNetWorth(
  cashFlowHistory: DateValue[],
  depotValueHistory: DateValue[]
): DateValue[] {
  // Convert inputs to maps for lookup
  const cashMap = new Map<string, number>();
  for (const entry of cashFlowHistory) {
    const key = dayjs(entry.date).format(ISO_FORMAT);
    cashMap.set(key, entry.value);
  }

  const depotMap = new Map<string, number>();
  for (const entry of depotValueHistory) {
    const key = dayjs(entry.date).format(ISO_FORMAT);
    if (entry.value != null) {
      depotMap.set(key, entry.value);
    }
  }

  // Collect all relevant dates (union)
  const allDates = Array.from(
    new Set([...cashMap.keys(), ...depotMap.keys()])
  ).sort();

  const result: { date: Date; value: number }[] = [];

  let lastCash = 0;
  let lastDepot = 0;

  for (const dateStr of allDates) {
    if (cashMap.has(dateStr)) lastCash = cashMap.get(dateStr)!;
    if (depotMap.has(dateStr)) lastDepot = depotMap.get(dateStr)!;

    result.push({
      date: dayjs(dateStr).toDate(),
      value: lastCash + lastDepot,
    });
  }

  return result;
}
