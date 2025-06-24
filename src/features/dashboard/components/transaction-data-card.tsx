"use client";

import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  CardHeader,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  RawDepotTransactionDataSet,
  RawAccountTransactionDataSet,
} from "@/features/dashboard/types/raw-transaction-data-set";

type AnyRawDataSet = RawDepotTransactionDataSet | RawAccountTransactionDataSet;

interface TransactionDataCardProps {
  icon: React.JSX.Element;
  file: AnyRawDataSet;
  onDelete: () => void;
}

export const TransactionDataCard = ({
  icon,
  file,
  onDelete,
}: TransactionDataCardProps) => {
  return (
    <Card variant="outlined">
        <CardHeader
        title={file.fileName}
        subheader={new Date(file.timestamp).toLocaleString()}
        avatar={icon}
        action={
          <IconButton aria-label="Löschen" onClick={onDelete}>
            <DeleteIcon />
          </IconButton>
        }
        />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
        {file.data.length} Zeilen
      </Typography>
      </CardContent>
    </Card>
  );
};
