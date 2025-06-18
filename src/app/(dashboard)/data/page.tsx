"use client";

import {
  Box,
  Typography,
  Divider,
  Snackbar,
  Grid,
  Avatar,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import CsvDropzoneUploader from "@/features/dashboard/components/csv-upload";
import { useRawData } from "@/features/dashboard/hooks/use-raw-transaction-data-sets";
import { TransactionDataCard } from "@/features/dashboard/components/transaction-data-card";
import { AttachMoney, ShowChart } from "@mui/icons-material";
import ReactPlayer from "react-player";
import { useState } from "react";
import {
  RawDepotTransactionDataSet,
  RawAccountTransactionDataSet,
} from "@/features/dashboard/types/raw-transaction-data-set";
import {
  createEncryptedServerStorageAdapter,
  createLocalStorageAdapter,
  StorageAdapter,
} from "@/lib/storage-adapter";

interface PersistenceMode {
  value: "none" | "localStorage" | "server";
  label: string;
  storageAdapter?: StorageAdapter<{
    depot: RawDepotTransactionDataSet[];
    account: RawAccountTransactionDataSet[];
  }>;
}

function PersistenceModeSelect({
  persistenceModes,
}: {
  persistenceModes?: PersistenceMode[];
}) {
  const [mode, setMode] = useState<"none" | "localStorage" | "server">("none");

  const handleChange = (event: SelectChangeEvent) => {
    setMode(event.target.value as "none" | "localStorage" | "server");
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="persistence-mode-label">Persistence Mode</InputLabel>
      <Select
        labelId="persistence-mode-label"
        id="persistence-mode-select"
        value={mode}
        label="Persistence Mode"
        onChange={handleChange}
      >
        <MenuItem value="none">None</MenuItem>
        <MenuItem value="localStorage">Local Storage</MenuItem>
        <MenuItem value="server">Server</MenuItem>
      </Select>
    </FormControl>
  );
}

export default function DataPage() {
  const {
    parsedDepotTransactions,
    parsedAccountTransactions,
    depotDataSets,
    accountDataSets,
    handleRawCsvUpload,
    deleteDepotDataSet,
    deleteAccountDataSet,
    error,
    storageAdapter,
    setStorageAdapter,
  } = useRawData();

  const totalDepotRows = parsedDepotTransactions.length;
  const totalAccountRows = parsedAccountTransactions.length;

  return (
    <Box width={"100%"} sx={{ flexGrow: 1 }} p={2}>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Transaktionsdaten
        </Typography>
        <CsvDropzoneUploader
          onParsed={(data, fileName) => handleRawCsvUpload(data, fileName)}
        />
      </Box>

      {/* Datasets Section */}
      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" gutterBottom>
        Datensätze
      </Typography>

      <Grid container spacing={3}>
        {depotDataSets.map((ds) => (
          <Grid key={ds.id} size={{ xs: 6, md: 3 }}>
            <TransactionDataCard
              icon={
                <Avatar sx={{ bgcolor: "secondary.main" }}>
                  <ShowChart />
                </Avatar>
              }
              file={ds}
              onDelete={() => deleteDepotDataSet(ds.id)}
            />
          </Grid>
        ))}

        {accountDataSets.map((ds) => (
          <Grid key={ds.id} size={{ xs: 6, md: 3 }}>
            <TransactionDataCard
              icon={
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <AttachMoney />
                </Avatar>
              }
              file={ds}
              onDelete={() => deleteAccountDataSet(ds.id)}
            />
          </Grid>
        ))}
      </Grid>

      <PersistenceModeSelect
        persistenceModes={[
          { value: "none", label: "Keine Speicherung" },
          {
            value: "localStorage",
            label: "Local Storage",
            storageAdapter: createLocalStorageAdapter<{
              depot: RawDepotTransactionDataSet[];
              account: RawAccountTransactionDataSet[];
            }>("rawTransactionDataSets"),
          },
          {
            value: "server",
            label: "Server",
            storageAdapter: createEncryptedServerStorageAdapter<{
              depot: RawDepotTransactionDataSet[];
              account: RawAccountTransactionDataSet[];
            }>({}),
          },
        ]}
      />

      <Box mt={4}>
        <Typography variant="body1">
          {totalAccountRows} einzigartige Konto-Transaktionen.
        </Typography>
        <Typography variant="body1">
          {totalDepotRows} einzigartige Depot-Transaktionen.
        </Typography>
      </Box>
      <Divider sx={{ my: 4 }} />

      <Box mt={2} mb={4}>
        <ReactPlayer
          url="https://www.youtube.com/watch?v=AlZtmcSHVLA"
          controls
        />
      </Box>
      <Snackbar
        open={error !== null}
        autoHideDuration={6000}
        onClose={() => {}}
        message={error}
      />
    </Box>
  );
}
