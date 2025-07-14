import { ParsedAccountTransaction } from "../types/account-transaction";

export function isInOutGoingTransaction(accountTransaction: ParsedAccountTransaction): boolean {
  // Check if the transaction is an outgoing transaction
  return accountTransaction["IBAN / Kontonummer"] !== "";
}