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
import { AttachMoney, Lock, ShowChart } from "@mui/icons-material";
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
    <Box my={2} gap={2} display="flex" flexDirection="column">
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

      {config?.dataPersistenceMode === DataPersistenceMode.SERVER && <EncryptionKeyManager />}

    </Box>
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
        <Grid container spacing={2} mb={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <CsvDropzoneUploader
              onParsed={(data, fileName) => handleRawCsvUpload(data, fileName)}
            />
          </Grid>
          {isClient && (<Grid
            size={{ xs: 12, md: 6 }}>

            <ReactPlayer
              url="https://www.youtube.com/watch?v=AlZtmcSHVLA"
              controls
              width={"100%"}
            />
          </Grid>)}

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom>
              Datensätze
            </Typography>

            <Grid container spacing={3}>
              {depotDataSets.map((ds) => (
                <Grid key={ds.id} size={{ xs: 12, md: 6 }}>
                  <TransactionDataCard
                    icon={
                      <Avatar sx={{ bgcolor: ds.valid ? "secondary.main" : "error.main" }}>
                        {ds.valid && <ShowChart />}
                        {!ds.valid && <Lock />}
                      </Avatar>
                    }
                    file={ds}
                    onDelete={() => deleteDepotDataSet(ds.id)}
                  />
                </Grid>
              ))}

              {accountDataSets.map((ds) => (
                <Grid key={ds.id} size={{ xs: 12, md: 6 }}>
                  <TransactionDataCard
                    icon={
                      <Avatar sx={{ bgcolor: ds.valid ? "secondary.main" : "error.main" }}>
                        {ds.valid && <AttachMoney />}
                        {!ds.valid && <Lock />}
                      </Avatar>
                    }
                    file={ds}
                    onDelete={() => deleteAccountDataSet(ds.id)}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <PersistenceModeSelect />
          </Grid>
        </Grid>
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
