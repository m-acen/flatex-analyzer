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
import { DataPersistenceMode } from "@/lib/user-config-schema";
import { useUserConfig } from "@/hooks/use-user-config";
import { useSession } from "@/lib/auth-client";
import { useEncryptionKey } from "@/hooks/use-encryption-key";
import EncryptionKeyManager from "@/components/encryption-key-manager";
import { useState, useEffect } from "react";

function PersistenceModeSelect() {
  const { config, updateConfig } = useUserConfig();

  const { data } = useSession();

  const handleChange = async (event: SelectChangeEvent) => {
    const newMode = event.target.value as DataPersistenceMode;

    if (newMode !== config?.dataPersistenceMode) {
      await updateConfig({ dataPersistenceMode: newMode });
    }
  };
  return (
    <FormControl fullWidth>
      <InputLabel id="persistence-mode-label">Speichermodus</InputLabel>
      <Select
        labelId="persistence-mode-label"
        id="persistence-mode-select"
        value={config?.dataPersistenceMode || ""}
        label="Persistence Mode"
        onChange={handleChange}
        disabled={!config}
      >
        <MenuItem key={DataPersistenceMode.NONE} value={DataPersistenceMode.NONE}>
          Keine Datenspeicherung
        </MenuItem>
        <MenuItem key={DataPersistenceMode.LOCAL} value={DataPersistenceMode.LOCAL}>
          Lokale Speicherung
        </MenuItem>
        <MenuItem disabled={data == null} key={DataPersistenceMode.SERVER} value={DataPersistenceMode.SERVER}>
          Server-Speicherung
        </MenuItem>
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
  } = useRawData();

  const totalDepotRows = parsedDepotTransactions.length;
  const totalAccountRows = parsedAccountTransactions.length;

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  return (
    <Box width={"100%"} sx={{ flexGrow: 1 }} p={2}>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Daten
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

      <PersistenceModeSelect />
      <EncryptionKeyManager />


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
        {isClient && (
          <ReactPlayer
            url="https://www.youtube.com/watch?v=AlZtmcSHVLA"
            controls
          />
        )}
      </Box>
      <Snackbar
        open={error !== null}
        autoHideDuration={6000}
        onClose={() => { }}
        message={error}
      />
    </Box>
  );
}
