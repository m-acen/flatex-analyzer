"use client";

import { Box, LinearProgress, Typography } from "@mui/material";
import { ProgressState } from "../hooks/use-assets-calc";
import { useDepot } from "../hooks/use-depot";

export function DepotProgressBar() {
  const { progress } = useDepot();
  return (
    <>
      {progress.state !== ProgressState.COMPLETED && (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box sx={{ width: "100%" }}>
            <LinearProgress
              variant="determinate"
              value={progress.progress * 100}
            />
          </Box>
          <Typography color="text.primary" variant="caption" gutterBottom>
            {progress.message}
          </Typography>
        </Box>
      )}
    </>
  );
}
