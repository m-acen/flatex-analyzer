"use client";

import {
  Box,
  Typography,
  Divider,
  Snackbar,
  Grid,
  Avatar,
} from "@mui/material";
import CsvDropzoneUploader from "@/features/dashboard/components/csv-upload";
import { useRawData } from "@/features/dashboard/hooks/use-raw-transaction-data-sets";
import { TransactionDataCard } from "@/features/dashboard/components/transaction-data-card";
import { AttachMoney, ShowChart } from "@mui/icons-material";
import ReactPlayer from "react-player";

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
      {/* Snackbar */}
      <Snackbar
        open={error !== null}
        autoHideDuration={6000}
        onClose={() => {}}
        message={error}
      />
    </Box>
  );
}
