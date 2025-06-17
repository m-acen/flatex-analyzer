import { AccountTransaction } from "./account-transaction";
import { DepotTransaction } from "./depot-transaction";

export interface RawDataSet<T> {
    id: string;
    data: T[];
    fileName: string;
    timestamp: Date;
}

export interface RawAccountTransactionDataSet extends RawDataSet<AccountTransaction> {}

export interface RawDepotTransactionDataSet extends RawDataSet<DepotTransaction> {}