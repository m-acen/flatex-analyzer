import dayjs from "dayjs";
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

export const LOCAL_FORMAT = "D.M.YYYY";

export const ISO_FORMAT = "YYYY-MM-DD";

export function parseDate(dateString: string): Date | null {
  const parsedDate = dayjs(dateString, LOCAL_FORMAT);
  return parsedDate.isValid() ? parsedDate.toDate() : null;
}
