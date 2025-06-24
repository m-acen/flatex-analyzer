import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import { ContentCopy, Refresh, Edit } from "@mui/icons-material";
import { useEncryptionKey } from "@/hooks/use-encryption-key";
import InfoBox from "./info-box";

export default function EncryptionKeyManager() {
  const { key, setKey, regenerateKey, error } = useEncryptionKey();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newKeyInput, setNewKeyInput] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleCopy = async () => {
    if (key) {
      await navigator.clipboard.writeText(key);
      setSnackbarOpen(true);
    }
  };

  const handlePasteKey = () => {
    setKey(newKeyInput);
    setDialogOpen(false);
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Encryption Key
        </Typography>

        <Card variant="outlined">
          <Box
            sx={{
              padding: 2,
              borderRadius: 1,
              wordBreak: "break-all",
              fontFamily: "monospace",
              fontSize: "0.9rem",
            }}
          >
            {key || "Loading..."}
          </Box>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
          <Tooltip title="Copy to clipboard">
            <IconButton onClick={handleCopy}>
              <ContentCopy />
            </IconButton>
          </Tooltip>

          <Tooltip title="Regenerate key">
            <IconButton onClick={regenerateKey}>
              <Refresh />
            </IconButton>
          </Tooltip>

          <Tooltip title="Paste new key">
            <IconButton onClick={() => setDialogOpen(true)}>
              <Edit />
            </IconButton>
          </Tooltip>
        </Box>
        <InfoBox text="Die Daten werden erst anonymisiert (Name, Iban, etc. werden gelöscht), dann verschlüsselt in der Datenbank gespeichert. Der Schlüssel wird lokal gespeichert. Wenn du die Daten von einem weiteren Gerät verwenden möchtest, kannst du den Schlüssel übertragen." />
      </CardContent>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Paste New Encryption Key</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Base64-encoded 256-bit key"
            variant="outlined"
            value={newKeyInput}
            onChange={(e) => setNewKeyInput(e.target.value)}
            error={!!error}
            helperText={error || ""}
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePasteKey} variant="contained">
            Save Key
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Key copied to clipboard!
        </Alert>
      </Snackbar>
    </Card>
  );
}
